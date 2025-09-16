from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PermissionViewSet, RoleViewSet, UserRoleAssignmentViewSet,
    PermissionCheckViewSet
)

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'user-role-assignments', UserRoleAssignmentViewSet)
router.register(r'permission-checks', PermissionCheckViewSet, basename='permission-check')

urlpatterns = [
    path('', include(router.urls)),
]
