from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import logging
import csv
import io

from .serializers import BulkUserImportSerializer, BulkUserImportResultSerializer
from users.models import UserProfile, StudentProfile, FacultyProfile
from users.serializers import UserProfileSerializer, UserSerializer
from rbac.decorators import require_permissions

logger = logging.getLogger(__name__)


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin user management
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_active', 'role', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['user__username', 'user__email', 'created_at', 'user__last_login']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_create_users'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by role if provided
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by status if provided
        status = self.request.query_params.get('status')
        if status == 'active':
            queryset = queryset.filter(is_active=True)
        elif status == 'inactive':
            queryset = queryset.filter(is_active=False)
        
        return queryset.select_related('user')
    
    def perform_create(self, serializer):
        # Create user profile
        profile = serializer.save()
        
        # Create role-specific profile if needed
        role = profile.role
        if role == 'STUDENT':
            StudentProfile.objects.create(
                user_profile=profile,
                admission_year=self.request.data.get('admission_year', timezone.now().year)
            )
        elif role == 'FACULTY':
            FacultyProfile.objects.create(
                user_profile=profile,
                department=self.request.data.get('department', ''),
                designation=self.request.data.get('designation', 'LECTURER'),
                qualification=self.request.data.get('qualification', '')
            )
        
        # Log the user creation
        from .models import SystemLog
        SystemLog.objects.create(
            level='INFO',
            category='USER',
            message=f'User created: {profile.user.username}',
            user=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            request_path=self.request.path,
            request_method=self.request.method
        )
    
    def perform_update(self, serializer):
        profile = serializer.save()
        
        # Log the user update
        from .models import SystemLog
        SystemLog.objects.create(
            level='INFO',
            category='USER',
            message=f'User updated: {profile.user.username}',
            user=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            request_path=self.request.path,
            request_method=self.request.method
        )
    
    def perform_destroy(self, instance):
        username = instance.user.username
        
        # Log the user deletion
        from .models import SystemLog
        SystemLog.objects.create(
            level='WARNING',
            category='USER',
            message=f'User deleted: {username}',
            user=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            request_path=self.request.path,
            request_method=self.request.method
        )
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user account"""
        profile = self.get_object()
        profile.is_active = True
        profile.save()
        
        # Log the activation
        from .models import SystemLog
        SystemLog.objects.create(
            level='INFO',
            category='USER',
            message=f'User activated: {profile.user.username}',
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            request_path=request.path,
            request_method=request.method
        )
        
        return Response({'message': 'User activated successfully'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user account"""
        profile = self.get_object()
        profile.is_active = False
        profile.save()
        
        # Log the deactivation
        from .models import SystemLog
        SystemLog.objects.create(
            level='WARNING',
            category='USER',
            message=f'User deactivated: {profile.user.username}',
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            request_path=request.path,
            request_method=request.method
        )
        
        return Response({'message': 'User deactivated successfully'})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        profile = self.get_object()
        user = profile.user
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({'error': 'New password is required'}, status=400)
        
        user.set_password(new_password)
        user.save()
        
        # Log the password reset
        from .models import SystemLog
        SystemLog.objects.create(
            level='INFO',
            category='USER',
            message=f'Password reset for user: {user.username}',
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            request_path=request.path,
            request_method=request.method
        )
        
        return Response({'message': 'Password reset successfully'})
    
    @action(detail=False, methods=['post'])
    def bulk_import(self, request):
        """Bulk import users from CSV/Excel file"""
        serializer = BulkUserImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        file = request.FILES.get('file')
        role = request.data.get('role')
        department = request.data.get('department')
        send_welcome_email = request.data.get('send_welcome_email', 'true').lower() == 'true'
        validate_only = request.data.get('validate_only', 'false').lower() == 'true'
        
        try:
            result = self.process_bulk_import(
                file, role, department, send_welcome_email, validate_only, request.user
            )
            
            result_serializer = BulkUserImportResultSerializer(result)
            return Response(result_serializer.data)
            
        except Exception as e:
            logger.error(f"Bulk import error: {e}")
            return Response(
                {'error': 'Failed to process import file'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def process_bulk_import(self, file, role, department, send_welcome_email, validate_only, admin_user):
        """Process the bulk import file"""
        errors = []
        warnings = []
        imported_users = []
        successful_imports = 0
        failed_imports = 0
        
        # Read CSV file
        try:
            if file.name.endswith('.csv'):
                content = file.read().decode('utf-8')
                csv_reader = csv.DictReader(io.StringIO(content))
                rows = list(csv_reader)
            else:
                # Handle Excel files here if needed
                return {
                    'total_rows': 0,
                    'successful_imports': 0,
                    'failed_imports': 0,
                    'errors': [{'row': 0, 'field': 'file', 'message': 'Excel files not supported yet'}],
                    'warnings': [],
                    'imported_users': []
                }
        except Exception as e:
            return {
                'total_rows': 0,
                'successful_imports': 0,
                'failed_imports': 0,
                'errors': [{'row': 0, 'field': 'file', 'message': f'Error reading file: {str(e)}'}],
                'warnings': [],
                'imported_users': []
            }
        
        total_rows = len(rows)
        
        for row_num, row_data in enumerate(rows, start=2):  # Start from 2 (header is row 1)
            try:
                # Validate required fields
                required_fields = ['username', 'email', 'first_name', 'last_name']
                for field in required_fields:
                    if not row_data.get(field):
                        errors.append({
                            'row': row_num,
                            'field': field,
                            'message': f'{field} is required'
                        })
                        failed_imports += 1
                        continue
                
                if any(error['row'] == row_num for error in errors):
                    continue
                
                # Check for existing user
                if User.objects.filter(username=row_data['username']).exists():
                    errors.append({
                        'row': row_num,
                        'field': 'username',
                        'message': 'Username already exists'
                    })
                    failed_imports += 1
                    continue
                
                if User.objects.filter(email=row_data['email']).exists():
                    errors.append({
                        'row': row_num,
                        'field': 'email',
                        'message': 'Email already exists'
                    })
                    failed_imports += 1
                    continue
                
                if not validate_only:
                    # Create user
                    user = User.objects.create(
                        username=row_data['username'],
                        email=row_data['email'],
                        first_name=row_data['first_name'],
                        last_name=row_data['last_name'],
                        is_active=True
                    )
                    
                    # Create profile
                    user_role = role or row_data.get('role', 'STUDENT')
                    profile = UserProfile.objects.create(
                        user=user,
                        role=user_role,
                        phone_number=row_data.get('phone_number', ''),
                        address=row_data.get('address', ''),
                        emergency_contact=row_data.get('emergency_contact', ''),
                        student_id=row_data.get('student_id', ''),
                        employee_id=row_data.get('employee_id', ''),
                    )
                    
                    # Create role-specific profile
                    if user_role == 'STUDENT':
                        StudentProfile.objects.create(
                            user_profile=profile,
                            admission_year=int(row_data.get('admission_year', timezone.now().year))
                        )
                    elif user_role == 'FACULTY':
                        FacultyProfile.objects.create(
                            user_profile=profile,
                            department=department or row_data.get('department', ''),
                            designation=row_data.get('designation', 'LECTURER'),
                            qualification=row_data.get('qualification', '')
                        )
                    
                    imported_users.append({
                        'username': user.username,
                        'email': user.email,
                        'name': f"{user.first_name} {user.last_name}"
                    })
                    
                    successful_imports += 1
                    
                    # Log the import
                    from .models import SystemLog
                    SystemLog.objects.create(
                        level='INFO',
                        category='USER',
                        message=f'User imported: {user.username}',
                        user=admin_user,
                        ip_address=admin_user.profile.last_login_ip,
                        request_path='/admin/users/bulk-import/',
                        request_method='POST'
                    )
                else:
                    # Validation only
                    successful_imports += 1
                    
            except Exception as e:
                errors.append({
                    'row': row_num,
                    'field': 'general',
                    'message': f'Error processing row: {str(e)}'
                })
                failed_imports += 1
        
        return {
            'total_rows': total_rows,
            'successful_imports': successful_imports,
            'failed_imports': failed_imports,
            'errors': errors,
            'warnings': warnings,
            'imported_users': imported_users
        }
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export users to CSV"""
        from django.http import HttpResponse
        import io
        
        queryset = self.get_queryset()
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Username', 'Email', 'First Name', 'Last Name', 'Role', 
            'Active', 'Date Joined', 'Last Login', 'Student ID', 'Employee ID'
        ])
        
        for profile in queryset:
            user = profile.user
            writer.writerow([
                user.username,
                user.email,
                user.first_name,
                user.last_name,
                profile.role,
                profile.is_active,
                user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
                user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '',
                profile.student_id or '',
                profile.employee_id or '',
            ])
        
        return response
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on selected users"""
        profile_ids = request.data.get('user_ids', [])
        action = request.data.get('action')
        
        if not profile_ids:
            return Response({'error': 'No users selected'}, status=400)
        
        profiles = UserProfile.objects.filter(id__in=profile_ids)
        
        if action == 'activate':
            profiles.update(is_active=True)
            message = f'Activated {profiles.count()} users'
        elif action == 'deactivate':
            profiles.update(is_active=False)
            message = f'Deactivated {profiles.count()} users'
        elif action == 'delete':
            count = profiles.count()
            profiles.delete()
            message = f'Deleted {count} users'
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        # Log the bulk action
        from .models import SystemLog
        SystemLog.objects.create(
            level='INFO',
            category='USER',
            message=f'Bulk action: {message}',
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            request_path=request.path,
            request_method=request.method
        )
        
        return Response({'message': message})
