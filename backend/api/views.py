from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import random
import pymongo
from django.core.mail import send_mail
from bson import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser

LOCK_DURATION_HOURS = timedelta(minutes=5)


client = pymongo.MongoClient("mongodb+srv://HCqpxhFHemEzvcWx:HCqpxhFHemEzvcWx@cluster0.srrgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["inventory"]
collection_users = db["users"]
collection_otp = db["otp"]
collection_inventory = db["inventory"]
collection_warehouse = db["warehouse"]

# Add a dictionary to track login attempts
login_attempts = {}

def hash_password(password):
    # Convert the password to bytes
    password = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    # Return the hash in string format for storage
    return hashed.decode('utf-8')

def check_password(password, hashed_password):
    # Convert both to bytes for comparison
    password = password.encode('utf-8')
    hashed_password = hashed_password.encode('utf-8')
    # Return True if password matches
    return bcrypt.checkpw(password, hashed_password)

@api_view(['POST'])
def register(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        print("Registration attempt for email:", email)  # Debug print
        
        if not email or not password:
            return Response({
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        existing_user = collection_users.find_one({"email": email})
        if existing_user:
            return Response({
                'message': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user data with hashed password
        user_data = request.data.copy()
        # Remove confirm_password if it exists
        user_data.pop('confirmPassword', None)
        
        # Hash the password
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        
        # Store the hashed password as string
        user_data['password'] = hashed_password.decode('utf-8')
        print("Hashed password for registration:", user_data['password'])  # Debug print
        
        # Insert the user
        inserted_data = collection_users.insert_one(user_data)
        
        # Prepare response data
        response_data = user_data.copy()
        response_data['_id'] = str(inserted_data.inserted_id)
        response_data.pop('password', None)  # Remove password from response
        response_data.pop('confirmPassword', None)

        return Response({
            'message': 'Registration successful',
            'data': response_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Registration error: {str(e)}")  # For debugging
        return Response({
            'message': 'An error occurred during registration'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_email_via_otp(request):
    email = request.data["email"]
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    subject = 'Email Verification OTP for Inventory Management System'
    message = f'Your OTP for email verification is: {otp}'
    from_email = 'naveenkumar.intern@gmail.com'
    recipient_list = [email]
    
    try:
        send_mail(subject, message, from_email, recipient_list)
        collection_otp.update_one(
            {"email": email},
            {"$set": {"otp": otp}},
            upsert=True
        )
        return Response({'message':'OTP sent successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message':'Failed to send OTP'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
def verify_otp(request):
    email = request.data["email"]
    otp = request.data["otp"]
    user = collection_otp.find_one({"email": email})
    
    if user and user["otp"] == otp:
        return Response({'message':'OTP verified successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({'message':'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = collection_users.find_one({'email': email})
        
        if not user:
            return Response({
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check if account is locked
        if user.get('is_locked', False):
            lock_time = user.get('locked_until')
            if lock_time and datetime.now() < datetime.fromisoformat(lock_time):
                return Response({
                    'message': 'Account is locked. Please try again later.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            else:
                # Reset lock if lock time has passed
                collection_users.update_one(
                    {'_id': user['_id']},
                    {'$set': {'is_locked': False, 'login_attempts': 0}}
                )

        stored_password = user.get('password', '').encode('utf-8')
        input_password = password.encode('utf-8')
        
        if bcrypt.checkpw(input_password, stored_password):
            # Reset login attempts on successful login
            collection_users.update_one(
                {'_id': user['_id']},
                {'$set': {'login_attempts': 0}}
            )

            # Generate JWT token
            token = jwt.encode({
                'user_id': str(user['_id']),
                'email': user['email'],
                'role': user.get('role', 'employee'),
                'is_active': user.get('is_active', True),
                'exp': datetime.utcnow() + timedelta(days=1)
            }, settings.SECRET_KEY, algorithm='HS256')

            response = Response({
                'message': 'Login successful',
                'data': {
                    '_id': str(user['_id']),
                    'email': user['email'],
                    'role': user.get('role', 'employee').lower(),
                    'name': user.get('name', ''),
                    'is_active': user.get('is_active', True)
                }
            }, status=status.HTTP_200_OK)

            # Set JWT token in cookie
            response.set_cookie(
                'jwt_token',
                token,
                max_age=24 * 60 * 60,  # 1 day
                httponly=True,
                samesite='Lax',
                secure=False  # Set to True in production with HTTPS
            )
            
            return response
        else:
            # Increment login attempts
            attempts = user.get('login_attempts', 0) + 1
            update_data = {'login_attempts': attempts}

            # Lock account if 5 failed attempts
            if attempts >= 5:
                locked_until = datetime.now() + LOCK_DURATION_HOURS
                update_data.update({
                    'is_locked': True,
                    'locked_until': locked_until.isoformat()
                })
                message = 'Account locked due to too many failed attempts'
            else:
                message = f'Invalid credentials. {5 - attempts} attempts remaining'

            collection_users.update_one(
                {'_id': user['_id']},
                {'$set': update_data}
            )

            return Response({
                'message': message
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return Response({
            'message': 'An error occurred during login'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout(request):
    try:
        response = Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
        
        # Delete the JWT cookie
        response.delete_cookie('jwt_token')
        
        return response
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return Response({
            'message': 'An error occurred during logout'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = collection_users.find_one({'email': email})
    if user:
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        subject = 'Password Reset OTP for Inventory Management System'
        message = f'Your OTP for password reset is: {otp}'
        from_email = 'naveenkumar.intern@gmail.com'
        recipient_list = [email]
        
        try:
            send_mail(subject, message, from_email, recipient_list)
            collection_otp.update_one(
                {"email": email},
                {"$set": {"otp": otp}},
                upsert=True
            )
            return Response({'message':'OTP sent successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message':'Failed to send OTP'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    user = collection_otp.find_one({'email': email})
    if user:
        if user['otp'] == otp:
            # Hash the new password before storing
            hashed_password = hash_password(new_password)
            collection_users.update_one(
                {'email': email}, 
                {'$set': {'password': hashed_password}}
            )
            return Response({
                'message': 'Password reset successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def dashboard_stats(request, user_id):
    try:
        # Verify that the requesting user matches the user_id
        if str(request.user['user_id']) != user_id:
            return Response({
                'message': 'Unauthorized access'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get counts from MongoDB collections
        managers_count = collection_users.count_documents({'role': 'manager'})
        employees_count = collection_users.count_documents({'role': 'employee'})
        inventory_count = collection_inventory.count_documents({})
        
        # Get recent activities (last 5 users)
        recent_users = list(collection_users.find({}, {'name': 1, 'date_joined': 1}).sort('date_joined', -1).limit(5))
        recent_activities = []
        for user in recent_users:
            if 'name' in user and 'date_joined' in user:
                recent_activities.append({
                    'type': 'user_joined',
                    'user': user['name'],
                    'timestamp': user['date_joined']
                })
        
        return Response({
            'managers_count': managers_count,
            'employees_count': employees_count, 
            'inventory_count': inventory_count,
            'recent_activities': recent_activities
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Dashboard stats error: {str(e)}")
        return Response({
            'message': 'An error occurred while fetching dashboard stats'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_managers(request):
    try:
        managers = list(collection_users.find({'role': 'manager'}, {
            '_id': 1,
            'name': 1, 
            'email': 1,
            'date_joined': 1,
            'is_active': 1
        }))
        
        manager_data = [{
            'id': str(manager['_id']),
            'name': manager.get('name', ''),
            'email': manager.get('email', ''),
            'status': 'Active' if manager.get('is_active', True) else 'Inactive',
            'joined_date': manager.get('date_joined')
        } for manager in managers]
        
        return Response(manager_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employees(request):
    try:
        # Query MongoDB directly instead of using Django ORM
        employees = list(collection_users.find({'role': 'employee'}, {
            '_id': 1,
            'name': 1,
            'email': 1, 
            'date_joined': 1,
            'is_active': 1
        }))
        
        employee_data = [{
            'id': str(employee['_id']),
            'name': employee.get('name', ''),
            'email': employee.get('email', ''),
            'status': 'Active' if employee.get('is_active', True) else 'Inactive',
            'joined_date': employee.get('date_joined')
        } for employee in employees]
        
        return Response(employee_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_session_settings(request):
    try:
        warning_time = request.data.get('warningTime')
        logout_time = request.data.get('logoutTime')
        
        if not warning_time or not logout_time:
            return Response({
                'message': 'Warning time and logout time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if warning_time >= logout_time:
            return Response({
                'message': 'Warning time must be less than logout time'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Store settings in database or cache if needed
        # For now, we'll just return success
        return Response({
            'message': 'Session settings updated successfully',
            'data': {
                'warningTime': warning_time,
                'logoutTime': logout_time
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['POST'])
# def create_warehouse(request):
#     try:
#         # Check if user is logged in via cookie
#         user_data = request.COOKIES.get('userData')
#         if not user_data:
#             return Response({
#                 'message': 'Authentication required'
#             }, status=status.HTTP_401_UNAUTHORIZED)

#         data = request.data
#         print(data)
#         warehouse_data = {
#             'name': data['name'],
#             'location': data['location'],
#             'managers': data['managers'],
#             'staff': data['staff'],
#             'created_at': datetime.now().isoformat(),
#             'is_active': True
#         }
        
#         # Insert into database
#         result = collection_warehouse.insert_one(warehouse_data)
        
#         return Response({
#             'message': 'Warehouse created successfully',
#             'data': {
#                 '_id': str(result.inserted_id),
#                 **warehouse_data
#             }
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         print(f"Error creating warehouse: {str(e)}")
#         return Response({
#             'message': 'An error occurred while creating the warehouse'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_warehouse(request):
    data = request.data
    print(data)
    return Response({'message': 'Warehouse created successfully'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def create_warehouse(request):
    data = request.data
    print(data)
    return Response({'message': 'Warehouse created successfully'}, status=status.HTTP_201_CREATED)





