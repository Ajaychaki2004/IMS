from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register_user'),  # Updated to register_user
    path('login/', views.login, name='login'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('verify-email-via-otp/', views.verify_email_via_otp, name='verify-email-via-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('dashboard-stats/<str:user_id>/', views.dashboard_stats, name='dashboard_stats'),
    path('managers/', views.get_managers, name='get_managers'),  # Removed user_id from managers and employees
    path('employees/', views.get_employees, name='get_employees'),
    path('update-session-settings/', views.update_session_settings, name='update_session_settings'),
    path('logout/', views.logout, name='logout'),
]