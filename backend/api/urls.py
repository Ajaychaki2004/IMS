from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('verify-email-via-otp/', views.verify_email_via_otp, name='verify-email-via-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('dashboard-stats/<str:user_id>/', views.dashboard_stats, name='dashboard_stats'),
    path('managers/<str:user_id>/', views.get_managers, name='get_managers'),
    path('employees/<str:user_id>/', views.get_employees, name='get_employees'),
    path('update-session-settings/', views.update_session_settings, name='update_session_settings'),
    path('logout/', views.logout, name='logout'),
    path('warehouses/', views.create_warehouse, name='create_warehouse'),
    path('get-warehouses/', views.get_warehouse, name='get_warehouse'),
]