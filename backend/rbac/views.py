from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.utils import timezone
from .models import (
    Permission, Role, UserRoleAssignment, PermissionTemplate, 
    ContextualPermission, PermissionAudit
)
from .serializers import (
    PermissionSerializer, RoleSerializer, UserRoleAssignmentSerializer,
    PermissionTemplateSerializer, ContextualPermissionSerializer,
    PermissionAuditSerializer, UserPermissionSummarySerializer,
    RolePermissionSummarySerializer, PermissionCheckSerializer,
    BulkPermissionCheckSerializer
)
from .permission_manager import PermissionManager
from .decorators import require_permissions, require_roles
import logging

logger = logging.getLogger(__name__)


class PermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing permissions
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['resource_type', 'action_type', 'is_system_permission']
    search_fields = ['name', 'codename', 'description']
    ordering_fields = ['name', 'codename', 'created_at']
    ordering = ['resource_type', 'action_type', 'name']
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_manage_permissions'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    @action(detail=False, methods=['get'])
    def by_resource_type(self, request):
        """
        Get permissions grouped by resource type
        """
        resource_type = request.query_params.get('resource_type')
        if not resource_type:
            return Response({'error': 'resource_type parameter required'}, status=400)
        
        permissions = self.get_queryset().filter(resource_type=resource_type)
        serializer = self.get_serializer(permissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def system_permissions(self, request):
        """
        Get all system permissions
        """
        permissions = self.get_queryset().filter(is_system_permission=True)
        serializer = self.get_serializer(permissions, many=True)
        return Response(serializer.data)


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing roles
    """
    queryset = Role.objects.all().prefetch_related('permissions', 'parent_role')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_system_role', 'is_active', 'priority']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'priority', 'created_at']
    ordering = ['-priority', 'name']
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_manage_roles'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    @action(detail=True, methods=['post'])
    def assign_to_user(self, request, pk=None):
        """
        Assign this role to a user
        """
        role = self.get_object()
        user_id = request.data.get('user_id')
        scope_type = request.data.get('scope_type', 'GLOBAL')
        scope_object_id = request.data.get('scope_object_id')
        scope_object_type = request.data.get('scope_object_type')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        if not user_id:
            return Response({'error': 'user_id required'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
        # Parse dates if provided
        if start_date:
            start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        assignment = PermissionManager.assign_role_to_user(
            user=user,
            role=role,
            assigned_by=request.user,
            scope_type=scope_type,
            scope_object_id=scope_object_id,
            start_date=start_date,
            end_date=end_date
        )
        
        serializer = UserRoleAssignmentSerializer(assignment)
        return Response(serializer.data, status=201)
    
    @action(detail=False, methods=['get'])
    def system_roles(self, request):
        """
        Get all system roles
        """
        roles = self.get_queryset().filter(is_system_role=True)
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """
        Get users assigned to this role
        """
        role = self.get_object()
        assignments = UserRoleAssignment.objects.filter(
            role=role,
            is_active=True
        ).select_related('user')
        
        serializer = UserRoleAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class UserRoleAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user role assignments
    """
    queryset = UserRoleAssignment.objects.all().select_related('user', 'role', 'assigned_by')
    serializer_class = UserRoleAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['user', 'role', 'scope_type', 'is_active']
    search_fields = ['user__username', 'role__name']
    ordering_fields = ['created_at', 'start_date', 'end_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter assignments based on user permissions
        """
        queryset = super().get_queryset()
        
        # If user is not admin, only show their own assignments
        if not PermissionManager.user_has_permission(self.request.user, 'can_view_all_role_assignments'):
            queryset = queryset.filter(user=self.request.user)
        
        return queryset
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_assign_roles'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a role assignment
        """
        assignment = self.get_object()
        assignment.is_active = False
        assignment.save()
        
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """
        Get current user's role assignments
        """
        assignments = self.get_queryset().filter(
            user=request.user,
            is_active=True
        ).filter(
            Q(start_date__lte=timezone.now()) &
            (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
        )
        
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)


class PermissionCheckViewSet(viewsets.ViewSet):
    """
    ViewSet for checking user permissions
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def check_permission(self, request):
        """
        Check if current user has a specific permission
        """
        serializer = PermissionCheckSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            has_permission = PermissionManager.user_has_permission(
                request.user,
                data['permission'],
                resource_type=data.get('resource_type'),
                resource_id=data.get('resource_id')
            )
            
            return Response({
                'has_permission': has_permission,
                'permission': data['permission'],
                'user': request.user.username
            })
        
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'])
    def my_permissions(self, request):
        """
        Get all permissions for current user
        """
        user_permissions = PermissionManager.get_user_permissions(request.user)
        
        return Response({
            'permissions': list(user_permissions),
            'user': request.user.username,
            'count': len(user_permissions)
        })
    
    @action(detail=False, methods=['get'])
    def my_roles(self, request):
        """
        Get all roles for current user
        """
        from .models import UserRoleAssignment
        from django.db.models import Q
        
        role_assignments = UserRoleAssignment.objects.filter(
            user=request.user,
            is_active=True
        ).filter(
            Q(start_date__lte=timezone.now()) &
            (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
        ).select_related('role')
        
        roles = [assignment.role for assignment in role_assignments]
        role_data = RoleSerializer(roles, many=True).data
        
        return Response({
            'roles': role_data,
            'user': request.user.username,
            'count': len(roles)
        })