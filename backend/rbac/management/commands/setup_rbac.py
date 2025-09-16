from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rbac.models import Permission, Role, UserRoleAssignment
from rbac.permission_manager import PermissionManager


class Command(BaseCommand):
    help = 'Setup initial RBAC permissions and roles'

    def handle(self, *args, **options):
        self.stdout.write('Setting up RBAC system...')
        
        # Create permissions
        self.create_permissions()
        
        # Create roles
        self.create_roles()
        
        # Assign default roles to existing users
        self.assign_default_roles()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully set up RBAC system!')
        )

    def create_permissions(self):
        """Create all system permissions"""
        self.stdout.write('Creating permissions...')
        
        permissions_data = [
            # User Management
            ('can_create_users', 'Create Users', 'user', 'CREATE', 'Can create new user accounts'),
            ('can_edit_all_users', 'Edit All Users', 'user', 'UPDATE', 'Can edit any user account'),
            ('can_delete_users', 'Delete Users', 'user', 'DELETE', 'Can delete user accounts'),
            ('can_view_all_users', 'View All Users', 'user', 'READ', 'Can view all user accounts'),
            ('can_assign_roles', 'Assign Roles', 'role', 'EXECUTE', 'Can assign roles to users'),
            
            # Course Management
            ('can_create_courses', 'Create Courses', 'course', 'CREATE', 'Can create new courses'),
            ('can_edit_courses', 'Edit Courses', 'course', 'UPDATE', 'Can edit course information'),
            ('can_delete_courses', 'Delete Courses', 'course', 'DELETE', 'Can delete courses'),
            ('can_view_courses', 'View Courses', 'course', 'READ', 'Can view course information'),
            ('can_manage_course_offerings', 'Manage Course Offerings', 'course_offering', 'EXECUTE', 'Can manage course offerings'),
            ('can_manage_enrollments', 'Manage Enrollments', 'enrollment', 'EXECUTE', 'Can manage student enrollments'),
            
            # Assignment Management
            ('can_create_assignments', 'Create Assignments', 'assignment', 'CREATE', 'Can create assignments'),
            ('can_edit_assignments', 'Edit Assignments', 'assignment', 'UPDATE', 'Can edit assignments'),
            ('can_delete_assignments', 'Delete Assignments', 'assignment', 'DELETE', 'Can delete assignments'),
            ('can_grade_assignments', 'Grade Assignments', 'assignment', 'EXECUTE', 'Can grade student assignments'),
            ('can_view_all_submissions', 'View All Submissions', 'submission', 'READ', 'Can view all assignment submissions'),
            
            # Academic Management
            ('can_manage_departments', 'Manage Departments', 'department', 'EXECUTE', 'Can manage academic departments'),
            ('can_manage_programs', 'Manage Programs', 'program', 'EXECUTE', 'Can manage academic programs'),
            ('can_manage_semesters', 'Manage Semesters', 'semester', 'EXECUTE', 'Can manage academic semesters'),
            
            # Communication
            ('can_moderate_forums', 'Moderate Forums', 'forum', 'EXECUTE', 'Can moderate discussion forums'),
            ('can_send_announcements', 'Send Announcements', 'announcement', 'CREATE', 'Can send system announcements'),
            ('can_message_users', 'Message Users', 'message', 'CREATE', 'Can send messages to other users'),
            
            # System Administration
            ('can_access_admin_panel', 'Access Admin Panel', 'admin', 'READ', 'Can access the admin panel'),
            ('can_modify_system_settings', 'Modify System Settings', 'system', 'UPDATE', 'Can modify system settings'),
            ('can_view_system_logs', 'View System Logs', 'log', 'READ', 'Can view system logs'),
            ('can_generate_reports', 'Generate Reports', 'report', 'EXECUTE', 'Can generate system reports'),
            
            # RBAC Management
            ('can_manage_permissions', 'Manage Permissions', 'permission', 'EXECUTE', 'Can manage system permissions'),
            ('can_manage_roles', 'Manage Roles', 'role', 'EXECUTE', 'Can manage system roles'),
            ('can_view_all_role_assignments', 'View All Role Assignments', 'role_assignment', 'READ', 'Can view all role assignments'),
            ('can_manage_permission_templates', 'Manage Permission Templates', 'permission_template', 'EXECUTE', 'Can manage permission templates'),
            ('can_manage_contextual_permissions', 'Manage Contextual Permissions', 'contextual_permission', 'EXECUTE', 'Can manage contextual permissions'),
            ('can_view_audit_logs', 'View Audit Logs', 'audit_log', 'READ', 'Can view audit logs'),
            ('can_view_all_audit_logs', 'View All Audit Logs', 'audit_log', 'READ', 'Can view all audit logs'),
        ]
        
        created_count = 0
        for codename, name, resource_type, action_type, description in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={
                    'name': name,
                    'description': description,
                    'resource_type': resource_type,
                    'action_type': action_type,
                    'is_system_permission': True,
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(f'Created {created_count} new permissions')

    def create_roles(self):
        """Create system roles with appropriate permissions"""
        self.stdout.write('Creating roles...')
        
        # Admin Role
        admin_role, created = Role.objects.get_or_create(
            code='ADMIN',
            defaults={
                'name': 'Administrator',
                'description': 'Full system access with all permissions',
                'is_system_role': True,
                'priority': 100,
            }
        )
        
        if created:
            # Assign all permissions to admin
            all_permissions = Permission.objects.all()
            admin_role.permissions.set(all_permissions)
            self.stdout.write('Created Admin role with all permissions')
        
        # Faculty Role
        faculty_role, created = Role.objects.get_or_create(
            code='FACULTY',
            defaults={
                'name': 'Faculty',
                'description': 'Faculty member with course and student management permissions',
                'is_system_role': True,
                'priority': 80,
            }
        )
        
        if created:
            faculty_permissions = Permission.objects.filter(
                codename__in=[
                    'can_view_courses', 'can_create_assignments', 'can_edit_assignments',
                    'can_grade_assignments', 'can_view_all_submissions', 'can_manage_course_offerings',
                    'can_moderate_forums', 'can_message_users', 'can_generate_reports'
                ]
            )
            faculty_role.permissions.set(faculty_permissions)
            self.stdout.write('Created Faculty role')
        
        # Student Role
        student_role, created = Role.objects.get_or_create(
            code='STUDENT',
            defaults={
                'name': 'Student',
                'description': 'Student with access to courses and assignments',
                'is_system_role': True,
                'priority': 60,
            }
        )
        
        if created:
            student_permissions = Permission.objects.filter(
                codename__in=[
                    'can_view_courses', 'can_message_users'
                ]
            )
            student_role.permissions.set(student_permissions)
            self.stdout.write('Created Student role')
        
        # Parent Role
        parent_role, created = Role.objects.get_or_create(
            code='PARENT',
            defaults={
                'name': 'Parent',
                'description': 'Parent with access to child information',
                'is_system_role': True,
                'priority': 40,
            }
        )
        
        if created:
            parent_permissions = Permission.objects.filter(
                codename__in=[
                    'can_message_users'
                ]
            )
            parent_role.permissions.set(parent_permissions)
            self.stdout.write('Created Parent role')
        
        # Librarian Role
        librarian_role, created = Role.objects.get_or_create(
            code='LIBRARIAN',
            defaults={
                'name': 'Librarian',
                'description': 'Library staff with resource management permissions',
                'is_system_role': True,
                'priority': 20,
            }
        )
        
        if created:
            librarian_permissions = Permission.objects.filter(
                codename__in=[
                    'can_view_courses', 'can_message_users', 'can_generate_reports'
                ]
            )
            librarian_role.permissions.set(librarian_permissions)
            self.stdout.write('Created Librarian role')

    def assign_default_roles(self):
        """Assign default roles to existing users based on their profile role"""
        self.stdout.write('Assigning default roles to existing users...')
        
        # Get all users with profiles
        users_with_profiles = User.objects.filter(profile__isnull=False).select_related('profile')
        
        assigned_count = 0
        for user in users_with_profiles:
            profile_role = user.profile.role
            
            # Map profile role to RBAC role
            role_mapping = {
                'ADMIN': 'ADMIN',
                'FACULTY': 'FACULTY',
                'STUDENT': 'STUDENT',
                'PARENT': 'PARENT',
                'LIBRARIAN': 'LIBRARIAN',
            }
            
            rbac_role_code = role_mapping.get(profile_role)
            if rbac_role_code:
                try:
                    rbac_role = Role.objects.get(code=rbac_role_code)
                    
                    # Check if user already has this role assignment
                    existing_assignment = UserRoleAssignment.objects.filter(
                        user=user,
                        role=rbac_role,
                        scope_type='GLOBAL'
                    ).first()
                    
                    if not existing_assignment:
                        PermissionManager.assign_role_to_user(
                            user=user,
                            role=rbac_role,
                            scope_type='GLOBAL'
                        )
                        assigned_count += 1
                        
                except Role.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Role {rbac_role_code} not found for user {user.username}')
                    )
        
        self.stdout.write(f'Assigned roles to {assigned_count} users')
