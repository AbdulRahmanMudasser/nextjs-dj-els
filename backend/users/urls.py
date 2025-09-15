from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/permissions/', views.user_permissions, name='user_permissions'),
    
    # Include DRF auth URLs for browsable API
    path('auth/', include('rest_framework.urls')),
]
