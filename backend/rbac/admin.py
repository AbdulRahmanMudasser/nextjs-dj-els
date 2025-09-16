from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Permission, Role, UserRoleAssignment, PermissionTemplate,
    ContextualPermission, PermissionAudit
)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'codename', 'resource_type', 'action_type', 'is_system_permission', 'created_at']
    list_filter = ['resource_type', 'action_type', 'is_system_permission', 'created_at']
    search_fields = ['name', 'codename', 'description']
    ordering = ['resource_type', 'action_type', 'name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'codename', 'description')
        }),
        ('Permission Details', {
            'fields': ('resource_type', 'action_type', 'is_system_permission')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'priority', 'is_system_role', 'is_active', 'permissions_count', 'created_at']
    list_filter = ['is_system_role', 'is_active', 'priority', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['-priority', 'name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['permissions']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description')
        }),
        ('Role Configuration', {
            'fields': ('permissions', 'parent_role', 'priority', 'is_system_role', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def permissions_count(self, obj):
        return obj.permissions.count()
    permissions_count.short_description = 'Permissions Count'


@admin.register(UserRoleAssignment)
class UserRoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'scope_type', 'is_active', 'is_current', 'start_date', 'end_date', 'created_at']
    list_filter = ['scope_type', 'is_active', 'role', 'created_at']
    search_fields = ['user__username', 'user__email', 'role__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Assignment Details', {
            'fields': ('user', 'role', 'assigned_by')
        }),
        ('Scope Configuration', {
            'fields': ('scope_type', 'scope_object_type', 'scope_object_id')
        }),
        ('Status & Dates', {
            'fields': ('is_active', 'start_date', 'end_date')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_current(self, obj):
        return obj.is_current()
    is_current.boolean = True
    is_current.short_description = 'Currently Active'


@admin.register(PermissionTemplate)
class PermissionTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_default', 'applies_to_role', 'permissions_count', 'created_at']
    list_filter = ['is_default', 'applies_to_role', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['permissions']
    
    fieldsets = (
        ('Template Information', {
            'fields': ('name', 'description', 'is_default')
        }),
        ('Configuration', {
            'fields': ('permissions', 'applies_to_role')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def permissions_count(self, obj):
        return obj.permissions.count()
    permissions_count.short_description = 'Permissions Count'


@admin.register(ContextualPermission)
class ContextualPermissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'permission', 'context_type', 'context_id', 'is_active', 'granted_at', 'expires_at']
    list_filter = ['context_type', 'granted_at', 'expires_at']
    search_fields = ['user__username', 'permission__name']
    ordering = ['-granted_at']
    readonly_fields = ['granted_at']
    
    fieldsets = (
        ('Permission Details', {
            'fields': ('user', 'permission', 'granted_by')
        }),
        ('Context Information', {
            'fields': ('context_type', 'context_id')
        }),
        ('Validity', {
            'fields': ('granted_at', 'expires_at')
        }),
    )
    
    def is_active(self, obj):
        return obj.is_active()
    is_active.boolean = True
    is_active.short_description = 'Currently Active'


@admin.register(PermissionAudit)
class PermissionAuditAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'permission', 'resource_type', 'result', 'timestamp']
    list_filter = ['result', 'action', 'resource_type', 'timestamp']
    search_fields = ['user__username', 'permission', 'action']
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']
    
    fieldsets = (
        ('Audit Information', {
            'fields': ('user', 'action', 'permission', 'result')
        }),
        ('Resource Details', {
            'fields': ('resource_type', 'resource_id')
        }),
        ('Request Information', {
            'fields': ('ip_address', 'user_agent', 'request_path')
        }),
        ('Additional Data', {
            'fields': ('additional_data',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False