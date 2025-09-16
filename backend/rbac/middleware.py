from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from .permission_manager import PermissionManager
import logging

logger = logging.getLogger(__name__)


class PermissionCheckMiddleware(MiddlewareMixin):
    """
    Middleware to validate user permissions for API requests
    """
    
    def process_request(self, request):
        """
        Process request to check permissions
        """
        # Skip permission checks for certain paths
        skip_paths = [
            '/admin/',
            '/api/v1/users/auth/login/',
            '/api/v1/users/auth/register/',
            '/api/v1/users/auth/logout/',
            '/static/',
            '/media/',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Skip if not an API request
        if not request.path.startswith('/api/'):
            return None
        
        # Skip for anonymous users (handled by authentication middleware)
        if isinstance(request.user, AnonymousUser):
            return None
        
        # Add user permissions to request for easy access
        if request.user.is_authenticated:
            request.user_permissions = PermissionManager.get_user_permissions(request.user)
        
        return None


class ScopeValidationMiddleware(MiddlewareMixin):
    """
    Middleware to validate scope-specific permissions
    """
    
    def process_request(self, request):
        """
        Process request to validate scope permissions
        """
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
        
        # Skip for anonymous users
        if isinstance(request.user, AnonymousUser):
            return None
        
        # Skip for GET requests (read-only)
        if request.method == 'GET':
            return None
        
        # Add scope validation logic here if needed
        # This would be implemented based on specific business requirements
        
        return None


class RoleHierarchyMiddleware(MiddlewareMixin):
    """
    Middleware to handle role hierarchy and inheritance
    """
    
    def process_request(self, request):
        """
        Process request to handle role hierarchy
        """
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
        
        # Skip for anonymous users
        if isinstance(request.user, AnonymousUser):
            return None
        
        if request.user.is_authenticated:
            # Add role hierarchy information to request
            from .models import UserRoleAssignment
            from django.utils import timezone
            from django.db.models import Q
            
            role_assignments = UserRoleAssignment.objects.filter(
                user=request.user,
                is_active=True
            ).filter(
                Q(start_date__lte=timezone.now()) &
                (Q(end_date__isnull=True) | Q(end_date__gt=timezone.now()))
            ).select_related('role')
            
            # Get all roles including inherited ones
            all_roles = set()
            for assignment in role_assignments:
                all_roles.add(assignment.role)
                # Add parent roles
                current_role = assignment.role
                while current_role.parent_role:
                    all_roles.add(current_role.parent_role)
                    current_role = current_role.parent_role
            
            request.user_roles = list(all_roles)
            request.user_role_codes = [role.code for role in all_roles]
        
        return None


class AuditLogMiddleware(MiddlewareMixin):
    """
    Middleware to log permission checks and violations
    """
    
    def process_request(self, request):
        """
        Log incoming requests for audit purposes
        """
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
        
        # Skip for anonymous users
        if isinstance(request.user, AnonymousUser):
            return None
        
        # Log request details
        logger.info(f"API Request: {request.method} {request.path} by user {request.user.username}")
        
        return None
    
    def process_response(self, request, response):
        """
        Log response details for audit purposes
        """
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return response
        
        # Skip for anonymous users
        if isinstance(request.user, AnonymousUser):
            return response
        
        # Log response details
        if response.status_code >= 400:
            logger.warning(f"API Error: {request.method} {request.path} returned {response.status_code} for user {request.user.username}")
        else:
            logger.info(f"API Success: {request.method} {request.path} returned {response.status_code} for user {request.user.username}")
        
        return response


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers for API responses
    """
    
    def process_response(self, request, response):
        """
        Add security headers to API responses
        """
        # Only add headers for API requests
        if request.path.startswith('/api/'):
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
            response['X-XSS-Protection'] = '1; mode=block'
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Add permission-related headers
            if hasattr(request, 'user_permissions'):
                response['X-User-Permissions-Count'] = str(len(request.user_permissions))
            
            if hasattr(request, 'user_role_codes'):
                response['X-User-Roles'] = ','.join(request.user_role_codes)
        
        return response
