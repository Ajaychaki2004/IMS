from rest_framework_simplejwt.authentication import JWTAuthentication
from bson import ObjectId
from .views import collection_users

class MongoDBUser:
    def __init__(self, user_data):
        self.user_data = user_data
        self.is_authenticated = True
        self.is_active = user_data.get('is_active', True)

    @property
    def id(self):
        return str(self.user_data.get('_id'))

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            header = self.get_header(request)
            if header is None:
                raw_token = request.COOKIES.get('jwt_token')
                if raw_token is None:
                    return None
            else:
                raw_token = self.get_raw_token(header)
                if raw_token is None:
                    return None

            validated_token = self.get_validated_token(raw_token)
            user_id = validated_token['user_id']
            user_data = collection_users.find_one({'_id': ObjectId(user_id)})
            
            if not user_data:
                return None
                
            user = MongoDBUser(user_data)
            return (user, validated_token)
        except Exception:
            return None 