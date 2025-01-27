from django.http import JsonResponse
import jwt
from django.conf import settings
from rest_framework import status

class JWTAuthMiddleware:
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
            '/api/reset-password/'
        ]

        # Skip authentication for public paths
        if request.path in public_paths:
            return self.get_response(request)

        try:
            token = request.COOKIES.get('jwt_token')
            if not token:
                return JsonResponse(
                    {'message': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            request.user = payload

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

        return self.get_response(request) 