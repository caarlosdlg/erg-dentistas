from django.urls import path
from . import views

urlpatterns = [
    path('google/', views.google_auth, name='google_auth'),
    path('logout/', views.logout, name='auth_logout'),
    path('profile/', views.user_profile, name='user_profile'),
]
