from django.http import JsonResponse
import jwt
from django.conf import settings
from rest_framework import status

class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List of paths that don't require authentication
        public_paths = [
            '/api/login/',
            '/api/register/',
            '/api/forgot-password/',
            '/api/verify-email-via-otp/',
            '/api/verify-otp/',
            '/api/reset-password/',
        ]

        # Check if the path starts with any of the public paths
        if any(request.path.startswith(path) for path in public_paths):
            return self.get_response(request)

        # Check for authentication token in cookies
        try:
            jwt_token = request.COOKIES.get('jwt_token')
            if not jwt_token:
                return JsonResponse(
                    {'message': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Verify token
            payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
            request.user = payload
            return self.get_response(request)

        except jwt.ExpiredSignatureError:
            return JsonResponse(
                {'message': 'Token expired'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            return JsonResponse(
                {'message': 'Invalid token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return JsonResponse(
                {'message': 'Authentication error'}, 
                status=status.HTTP_401_UNAUTHORIZED
            ) 