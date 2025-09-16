from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.utils import timezone
from .models import Permission, Role, UserRoleAssignment, ContextualPermission, PermissionAudit
import logging

logger = logging.getLogger(__name__)


class PermissionManager:
    """
    Centralized permission management system
    """
    
    @staticmethod
    def user_has_permission(user, permission_codename, resource=None, scope=None):
        """
        Check if user has a specific permission
        
        Args:
            user: User instance
            permission_codename: Permission codename to check
            resource: Resource object (optional)
            scope: Scope information (optional)
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        if not user or not user.is_authenticated:
            return False
        
        try:
            # Get the permission object
            permission = Permission.objects.get(codename=permission_codename)
            
            # Check if user has the permission through roles
            if PermissionManager._check_role_permissions(user, permission, resource, scope):
                PermissionManager._log_permission_check(user, permission_codename, resource, 'GRANTED')
                return True
            
            # Check contextual permissions
            if PermissionManager._check_contextual_permissions(user, permission, resource, scope):
                PermissionManager._log_permission_check(user, permission_codename, resource, 'GRANTED')
                return True
            
            PermissionManager._log_permission_check(user, permission_codename, resource, 'DENIED')
            return False
            
        except Permission.DoesNotExist:
            logger.warning(f"Permission '{permission_codename}' does not exist")
            PermissionManager._log_permission_check(user, permission_codename, resource, 'ERROR')
            return False
        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            PermissionManager._log_permission_check(user, permission_codename, resource, 'ERROR')
            return False
    
    @staticmethod
    def _check_role_permissions(user, permission, resource=None, scope=None):
        """
        Check if user has permission through role assignments
        """
        # Get all active role assignments for the user
        role_assignments = UserRoleAssignment.objects.filter(
            user=user,
            is_active=True
        ).filter(
            Q(start_date__lte=timezone.now()) &
            (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
        )
        
        for assignment in role_assignments:
            # Check if assignment is in the correct scope
            if not PermissionManager._check_scope_match(assignment, resource, scope):
                continue
            
            # Get all permissions for this role (including inherited)
            role_permissions = assignment.role.get_all_permissions()
            
            if permission in role_permissions:
                return True
        
        return False
    
    @staticmethod
    def _check_contextual_permissions(user, permission, resource=None, scope=None):
        """
        Check if user has contextual permissions
        """
        contextual_permissions = ContextualPermission.objects.filter(
            user=user,
            permission=permission,
            granted_at__lte=timezone.now()
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )
        
        for contextual in contextual_permissions:
            # Check if contextual permission matches the resource context
            if resource and hasattr(resource, contextual.context_type.lower()):
                context_obj = getattr(resource, contextual.context_type.lower())
                if context_obj and context_obj.id == contextual.context_id:
                    return True
            elif not resource and contextual.context_type == 'GLOBAL':
                return True
        
        return False
    
    @staticmethod
    def _check_scope_match(assignment, resource=None, scope=None):
        """
        Check if role assignment scope matches the requested resource/scope
        """
        if assignment.scope_type == 'GLOBAL':
            return True
        
        if not resource:
            return False
        
        if assignment.scope_type == 'DEPARTMENT':
            if hasattr(resource, 'department'):
                return resource.department.id == assignment.scope_object_id
            elif hasattr(resource, 'course_offering') and hasattr(resource.course_offering, 'course'):
                return resource.course_offering.course.department.id == assignment.scope_object_id
        
        elif assignment.scope_type == 'COURSE':
            if hasattr(resource, 'course_offering'):
                return resource.course_offering.id == assignment.scope_object_id
            elif hasattr(resource, 'course'):
                return resource.course.id == assignment.scope_object_id
        
        return False
    
    @staticmethod
    def get_user_permissions(user, scope=None):
        """
        Get all permissions for a user
        
        Args:
            user: User instance
            scope: Scope information (optional)
            
        Returns:
            set: Set of permission codenames
        """
        if not user or not user.is_authenticated:
            return set()
        
        permissions = set()
        
        # Get permissions from roles
        role_assignments = UserRoleAssignment.objects.filter(
            user=user,
            is_active=True
        ).filter(
            Q(start_date__lte=timezone.now()) &
            (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
        )
        
        for assignment in role_assignments:
            role_permissions = assignment.role.get_all_permissions()
            permissions.update([p.codename for p in role_permissions])
        
        # Get contextual permissions
        contextual_permissions = ContextualPermission.objects.filter(
            user=user,
            granted_at__lte=timezone.now()
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )
        
        permissions.update([cp.permission.codename for cp in contextual_permissions])
        
        return permissions
    
    @staticmethod
    def check_scope_permission(user, action, resource_type, resource_id):
        """
        Check if user can perform action on specific resource
        
        Args:
            user: User instance
            action: Action to perform (create, read, update, delete)
            resource_type: Type of resource
            resource_id: ID of the resource
            
        Returns:
            bool: True if user can perform action, False otherwise
        """
        permission_codename = f"{action}_{resource_type.lower()}"
        return PermissionManager.user_has_permission(user, permission_codename)
    
    @staticmethod
    def get_accessible_resources(user, resource_type, action):
        """
        Get IDs of resources user can access
        
        Args:
            user: User instance
            resource_type: Type of resource
            action: Action to perform
            
        Returns:
            QuerySet: IDs of accessible resources
        """
        if not user or not user.is_authenticated:
            return []
        
        # This would need to be implemented based on specific resource types
        # For now, return empty list as this requires model-specific logic
        return []
    
    @staticmethod
    def assign_role_to_user(user, role, assigned_by=None, scope_type='GLOBAL', 
                           scope_object=None, start_date=None, end_date=None):
        """
        Assign a role to a user
        
        Args:
            user: User to assign role to
            role: Role to assign
            assigned_by: User who is making the assignment
            scope_type: Scope of the assignment
            scope_object: Object for scoped assignments
            start_date: When assignment starts
            end_date: When assignment ends
            
        Returns:
            UserRoleAssignment: Created assignment
        """
        if start_date is None:
            start_date = timezone.now()
        
        assignment = UserRoleAssignment.objects.create(
            user=user,
            role=role,
            assigned_by=assigned_by,
            scope_type=scope_type,
            scope_object=scope_object,
            start_date=start_date,
            end_date=end_date
        )
        
        logger.info(f"Role '{role.name}' assigned to user '{user.username}' by '{assigned_by.username if assigned_by else 'system'}'")
        return assignment
    
    @staticmethod
    def grant_contextual_permission(user, permission, context_type, context_id, 
                                   granted_by=None, expires_at=None):
        """
        Grant a contextual permission to a user
        
        Args:
            user: User to grant permission to
            permission: Permission to grant
            context_type: Type of context
            context_id: ID of context object
            granted_by: User who is granting the permission
            expires_at: When permission expires
            
        Returns:
            ContextualPermission: Created permission
        """
        contextual = ContextualPermission.objects.create(
            user=user,
            permission=permission,
            context_type=context_type,
            context_id=context_id,
            granted_by=granted_by,
            expires_at=expires_at
        )
        
        logger.info(f"Contextual permission '{permission.name}' granted to user '{user.username}' for {context_type} {context_id}")
        return contextual
    
    @staticmethod
    def _log_permission_check(user, permission_codename, resource, result, request=None):
        """
        Log permission check for audit purposes
        """
        try:
            audit_data = {
                'user': user,
                'action': 'permission_check',
                'permission': permission_codename,
                'resource_type': resource.__class__.__name__ if resource else 'None',
                'resource_id': resource.id if resource and hasattr(resource, 'id') else None,
                'result': result,
            }
            
            if request:
                audit_data.update({
                    'ip_address': request.META.get('REMOTE_ADDR'),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'request_path': request.path,
                })
            
            PermissionAudit.objects.create(**audit_data)
        except Exception as e:
            logger.error(f"Failed to log permission check: {e}")


# Convenience functions for common permission checks
def has_permission(user, permission_codename, resource=None, scope=None):
    """Convenience function for permission checking"""
    return PermissionManager.user_has_permission(user, permission_codename, resource, scope)


def get_user_permissions(user, scope=None):
    """Convenience function for getting user permissions"""
    return PermissionManager.get_user_permissions(user, scope)


def assign_role(user, role, assigned_by=None, **kwargs):
    """Convenience function for role assignment"""
    return PermissionManager.assign_role_to_user(user, role, assigned_by, **kwargs)
