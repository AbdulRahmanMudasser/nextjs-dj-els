from functools import wraps
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework import status
from .permission_manager import PermissionManager
import logging

logger = logging.getLogger(__name__)


def require_permissions(permissions, require_all=True):
    """
    Decorator to require specific permissions for API views
    
    Args:
        permissions: List of permission codenames or single permission
        require_all: If True, user must have all permissions. If False, user needs any one.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Convert single permission to list
            if isinstance(permissions, str):
                permission_list = [permissions]
            else:
                permission_list = permissions
            
            # Check permissions
            has_permissions = []
            for permission in permission_list:
                has_permission = PermissionManager.user_has_permission(
                    request.user, permission, request=request
                )
                has_permissions.append(has_permission)
            
            # Check if user meets permission requirements
            if require_all:
                if not all(has_permissions):
                    missing_permissions = [
                        perm for perm, has_perm in zip(permission_list, has_permissions)
                        if not has_perm
                    ]
                    return Response(
                        {
                            'error': 'Insufficient permissions',
                            'missing_permissions': missing_permissions
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                if not any(has_permissions):
                    return Response(
                        {
                            'error': 'Insufficient permissions',
                            'required_permissions': permission_list
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_roles(roles, require_all=True):
    """
    Decorator to require specific roles for API views
    
    Args:
        roles: List of role codes or single role
        require_all: If True, user must have all roles. If False, user needs any one.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Convert single role to list
            if isinstance(roles, str):
                role_list = [roles]
            else:
                role_list = roles
            
            # Get user's roles
            user_roles = set()
            from .models import UserRoleAssignment
            from django.utils import timezone
            from django.db.models import Q
            
            role_assignments = UserRoleAssignment.objects.filter(
                user=request.user,
                is_active=True
            ).filter(
                Q(start_date__lte=timezone.now()) &
                (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
            )
            
            for assignment in role_assignments:
                user_roles.add(assignment.role.code)
            
            # Check if user meets role requirements
            if require_all:
                if not all(role in user_roles for role in role_list):
                    missing_roles = [role for role in role_list if role not in user_roles]
                    return Response(
                        {
                            'error': 'Insufficient roles',
                            'missing_roles': missing_roles
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                if not any(role in user_roles for role in role_list):
                    return Response(
                        {
                            'error': 'Insufficient roles',
                            'required_roles': role_list
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_scope_permission(resource_type, action):
    """
    Decorator to require scope-specific permissions
    
    Args:
        resource_type: Type of resource (e.g., 'course', 'assignment')
        action: Action to perform (e.g., 'view', 'edit', 'delete')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get resource ID from URL parameters
            resource_id = kwargs.get('pk') or kwargs.get('id')
            
            if not resource_id:
                return Response(
                    {'error': 'Resource ID required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check scope permission
            has_permission = PermissionManager.check_scope_permission(
                request.user, action, resource_type, resource_id
            )
            
            if not has_permission:
                return Response(
                    {
                        'error': 'Access denied',
                        'resource_type': resource_type,
                        'action': action,
                        'resource_id': resource_id
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_ownership_or_permission(permission_codename):
    """
    Decorator to require either ownership of resource or specific permission
    
    Args:
        permission_codename: Permission required if user doesn't own the resource
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get resource ID from URL parameters
            resource_id = kwargs.get('pk') or kwargs.get('id')
            
            if not resource_id:
                return Response(
                    {'error': 'Resource ID required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Try to get the resource object
            # This is a simplified version - in practice, you'd need to know the model
            # and implement proper resource retrieval logic
            
            # For now, check if user has the permission
            has_permission = PermissionManager.user_has_permission(
                request.user, permission_codename, request=request
            )
            
            if not has_permission:
                return Response(
                    {
                        'error': 'Access denied',
                        'permission_required': permission_codename
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# Django view decorators (for non-DRF views)
def django_require_permissions(permissions, require_all=True):
    """
    Django view decorator for permission checking (non-DRF)
    """
    def decorator(view_func):
        @login_required
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Convert single permission to list
            if isinstance(permissions, str):
                permission_list = [permissions]
            else:
                permission_list = permissions
            
            # Check permissions
            has_permissions = []
            for permission in permission_list:
                has_permission = PermissionManager.user_has_permission(
                    request.user, permission, request=request
                )
                has_permissions.append(has_permission)
            
            # Check if user meets permission requirements
            if require_all:
                if not all(has_permissions):
                    missing_permissions = [
                        perm for perm, has_perm in zip(permission_list, has_permissions)
                        if not has_perm
                    ]
                    return JsonResponse(
                        {
                            'error': 'Insufficient permissions',
                            'missing_permissions': missing_permissions
                        },
                        status=403
                    )
            else:
                if not any(has_permissions):
                    return JsonResponse(
                        {
                            'error': 'Insufficient permissions',
                            'required_permissions': permission_list
                        },
                        status=403
                    )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def django_require_roles(roles, require_all=True):
    """
    Django view decorator for role checking (non-DRF)
    """
    def decorator(view_func):
        @login_required
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Convert single role to list
            if isinstance(roles, str):
                role_list = [roles]
            else:
                role_list = roles
            
            # Get user's roles
            user_roles = set()
            from .models import UserRoleAssignment
            from django.utils import timezone
            from django.db.models import Q
            
            role_assignments = UserRoleAssignment.objects.filter(
                user=request.user,
                is_active=True
            ).filter(
                Q(start_date__lte=timezone.now()) &
                (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
            )
            
            for assignment in role_assignments:
                user_roles.add(assignment.role.code)
            
            # Check if user meets role requirements
            if require_all:
                if not all(role in user_roles for role in role_list):
                    missing_roles = [role for role in role_list if role not in user_roles]
                    return JsonResponse(
                        {
                            'error': 'Insufficient roles',
                            'missing_roles': missing_roles
                        },
                        status=403
                    )
            else:
                if not any(role in user_roles for role in role_list):
                    return JsonResponse(
                        {
                            'error': 'Insufficient roles',
                            'required_roles': role_list
                        },
                        status=403
                    )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
