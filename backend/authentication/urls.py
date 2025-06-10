from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    path('api/auth/google/', views.google_auth, name='google_auth'),
    path('api/auth/github/', views.github_auth, name='github_auth'),
    path('api/auth/logout/', views.logout, name='logout'),
    path('api/auth/profile/', views.user_profile, name='user_profile'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
