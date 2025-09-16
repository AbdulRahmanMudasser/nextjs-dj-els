from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError
from django.utils import timezone


class Permission(models.Model):
    """
    Custom permission model for granular access control
    """
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('READ', 'Read'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('EXECUTE', 'Execute'),
    ]

    name = models.CharField(max_length=200, unique=True, help_text="Human-readable permission name")
    codename = models.CharField(max_length=100, unique=True, help_text="Permission codename for programmatic use")
    description = models.TextField(help_text="Detailed description of the permission")
    resource_type = models.CharField(max_length=50, help_text="Type of resource this permission applies to")
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES, help_text="Type of action allowed")
    is_system_permission = models.BooleanField(default=False, help_text="Whether this is a system-level permission")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.codename})"

    class Meta:
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        ordering = ['resource_type', 'action_type', 'name']
        indexes = [
            models.Index(fields=['codename']),
            models.Index(fields=['resource_type', 'action_type']),
            models.Index(fields=['is_system_permission']),
        ]


class Role(models.Model):
    """
    Role model for grouping permissions
    """
    name = models.CharField(max_length=100, unique=True, help_text="Role name")
    code = models.CharField(max_length=50, unique=True, help_text="Role code for programmatic use")
    description = models.TextField(help_text="Role description")
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')
    is_system_role = models.BooleanField(default=False, help_text="Whether this is a system-defined role")
    parent_role = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='child_roles', help_text="Parent role for hierarchy")
    priority = models.IntegerField(default=0, help_text="Role priority (higher number = higher priority)")
    is_active = models.BooleanField(default=True, help_text="Whether this role is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    def get_all_permissions(self):
        """
        Get all permissions including inherited from parent roles
        """
        permissions = set(self.permissions.all())
        
        # Add permissions from parent roles
        if self.parent_role:
            permissions.update(self.parent_role.get_all_permissions())
        
        return permissions

    def clean(self):
        super().clean()
        # Prevent circular references in role hierarchy
        if self.parent_role:
            if self.parent_role == self:
                raise ValidationError("Role cannot be its own parent")
            
            # Check for circular references
            current = self.parent_role
            while current:
                if current == self:
                    raise ValidationError("Circular reference detected in role hierarchy")
                current = current.parent_role

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ['-priority', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_system_role']),
            models.Index(fields=['is_active']),
            models.Index(fields=['priority']),
        ]


class UserRoleAssignment(models.Model):
    """
    Model for assigning roles to users with scope
    """
    SCOPE_CHOICES = [
        ('GLOBAL', 'Global'),
        ('DEPARTMENT', 'Department'),
        ('COURSE', 'Course'),
        ('CUSTOM', 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='role_assignments')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='assigned_roles', help_text="User who assigned this role")
    scope_type = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='GLOBAL',
                                 help_text="Scope of the role assignment")
    scope_object_id = models.PositiveIntegerField(null=True, blank=True, 
                                                 help_text="ID of the scope object")
    scope_object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True,
                                         help_text="Type of the scope object")
    scope_object = GenericForeignKey('scope_object_type', 'scope_object_id')
    is_active = models.BooleanField(default=True, help_text="Whether this assignment is active")
    start_date = models.DateTimeField(default=timezone.now, help_text="When this assignment starts")
    end_date = models.DateTimeField(null=True, blank=True, help_text="When this assignment ends")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        scope_info = f" ({self.scope_type})" if self.scope_type != 'GLOBAL' else ""
        return f"{self.user.username} - {self.role.name}{scope_info}"

    def is_current(self):
        """
        Check if this role assignment is currently active
        """
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True

    def clean(self):
        super().clean()
        # Validate scope requirements
        if self.scope_type != 'GLOBAL':
            if not self.scope_object_id or not self.scope_object_type:
                raise ValidationError(f"Scope object is required for {self.scope_type} scope")
        
        # Validate date range
        if self.end_date and self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date")

    class Meta:
        verbose_name = "User Role Assignment"
        verbose_name_plural = "User Role Assignments"
        unique_together = ['user', 'role', 'scope_type', 'scope_object_id', 'scope_object_type']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['role', 'is_active']),
            models.Index(fields=['scope_type', 'scope_object_id']),
            models.Index(fields=['start_date', 'end_date']),
        ]


class PermissionTemplate(models.Model):
    """
    Template for quick role setup with predefined permissions
    """
    name = models.CharField(max_length=200, help_text="Template name")
    description = models.TextField(help_text="Template description")
    permissions = models.ManyToManyField(Permission, related_name='templates')
    is_default = models.BooleanField(default=False, help_text="Whether this is a default template")
    applies_to_role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True,
                                       related_name='templates', help_text="Role this template applies to")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Permission Template"
        verbose_name_plural = "Permission Templates"
        ordering = ['name']


class ContextualPermission(models.Model):
    """
    Model for temporary or context-specific permissions
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contextual_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='contextual_grants')
    context_type = models.CharField(max_length=50, help_text="Type of context (course, department, etc.)")
    context_id = models.PositiveIntegerField(help_text="ID of the context object")
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='granted_permissions', help_text="User who granted this permission")
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When this permission expires")

    def __str__(self):
        return f"{self.user.username} - {self.permission.name} ({self.context_type})"

    def is_active(self):
        """
        Check if this contextual permission is currently active
        """
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    class Meta:
        verbose_name = "Contextual Permission"
        verbose_name_plural = "Contextual Permissions"
        unique_together = ['user', 'permission', 'context_type', 'context_id']
        indexes = [
            models.Index(fields=['user', 'context_type', 'context_id']),
            models.Index(fields=['expires_at']),
        ]


class PermissionAudit(models.Model):
    """
    Model for auditing permission checks and changes
    """
    RESULT_CHOICES = [
        ('GRANTED', 'Granted'),
        ('DENIED', 'Denied'),
        ('ERROR', 'Error'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                            related_name='permission_audits')
    action = models.CharField(max_length=100, help_text="Action performed")
    permission = models.CharField(max_length=100, help_text="Permission that was checked")
    resource_type = models.CharField(max_length=50, help_text="Type of resource accessed")
    resource_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID of the resource")
    result = models.CharField(max_length=20, choices=RESULT_CHOICES, help_text="Result of the permission check")
    ip_address = models.GenericIPAddressField(null=True, blank=True, help_text="IP address of the request")
    user_agent = models.CharField(max_length=500, blank=True, help_text="User agent string")
    request_path = models.CharField(max_length=500, help_text="Request path")
    additional_data = models.JSONField(default=dict, blank=True, help_text="Additional audit data")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.action} - {self.result}"

    class Meta:
        verbose_name = "Permission Audit"
        verbose_name_plural = "Permission Audits"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['permission', 'result']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['timestamp']),
        ]