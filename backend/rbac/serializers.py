from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Permission, Role, UserRoleAssignment, PermissionTemplate, 
    ContextualPermission, PermissionAudit
)


class PermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for Permission model
    """
    
    class Meta:
        model = Permission
        fields = [
            'id', 'name', 'codename', 'description', 'resource_type', 
            'action_type', 'is_system_permission', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer for Role model
    """
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    parent_role_name = serializers.CharField(source='parent_role.name', read_only=True)
    child_roles_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'code', 'description', 'permissions', 'permission_ids',
            'is_system_role', 'parent_role', 'parent_role_name', 'priority',
            'is_active', 'child_roles_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_child_roles_count(self, obj):
        return obj.child_roles.count()
    
    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)
        
        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            role.permissions.set(permissions)
        
        return role
    
    def update(self, instance, validated_data):
        permission_ids = validated_data.pop('permission_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if permission_ids is not None:
            permissions = Permission.objects.filter(id__in=permission_ids)
            instance.permissions.set(permissions)
        
        return instance


class UserRoleAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for UserRoleAssignment model
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    role_name = serializers.CharField(source='role.name', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    scope_object_name = serializers.SerializerMethodField()
    is_current = serializers.SerializerMethodField()
    
    class Meta:
        model = UserRoleAssignment
        fields = [
            'id', 'user', 'user_username', 'user_full_name', 'role', 'role_name',
            'assigned_by', 'assigned_by_username', 'scope_type', 'scope_object_id',
            'scope_object_type', 'scope_object_name', 'is_active', 'start_date',
            'end_date', 'is_current', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_scope_object_name(self, obj):
        if obj.scope_object:
            return str(obj.scope_object)
        return None
    
    def get_is_current(self, obj):
        return obj.is_current()
    
    def validate(self, data):
        # Validate scope requirements
        if data.get('scope_type') != 'GLOBAL':
            if not data.get('scope_object_id') or not data.get('scope_object_type'):
                raise serializers.ValidationError(
                    f"Scope object is required for {data['scope_type']} scope"
                )
        
        # Validate date range
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    "End date must be after start date"
                )
        
        return data


class PermissionTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for PermissionTemplate model
    """
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    applies_to_role_name = serializers.CharField(source='applies_to_role.name', read_only=True)
    
    class Meta:
        model = PermissionTemplate
        fields = [
            'id', 'name', 'description', 'permissions', 'permission_ids',
            'is_default', 'applies_to_role', 'applies_to_role_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        template = PermissionTemplate.objects.create(**validated_data)
        
        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            template.permissions.set(permissions)
        
        return template
    
    def update(self, instance, validated_data):
        permission_ids = validated_data.pop('permission_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if permission_ids is not None:
            permissions = Permission.objects.filter(id__in=permission_ids)
            instance.permissions.set(permissions)
        
        return instance


class ContextualPermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for ContextualPermission model
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    permission_name = serializers.CharField(source='permission.name', read_only=True)
    granted_by_username = serializers.CharField(source='granted_by.username', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = ContextualPermission
        fields = [
            'id', 'user', 'user_username', 'permission', 'permission_name',
            'context_type', 'context_id', 'granted_by', 'granted_by_username',
            'granted_at', 'expires_at', 'is_active'
        ]
        read_only_fields = ['id', 'granted_at']
    
    def get_is_active(self, obj):
        return obj.is_active()
    
    def validate(self, data):
        # Validate expiration date
        if data.get('expires_at') and data['expires_at'] <= data.get('granted_at', timezone.now()):
            raise serializers.ValidationError(
                "Expiration date must be after grant date"
            )
        
        return data


class PermissionAuditSerializer(serializers.ModelSerializer):
    """
    Serializer for PermissionAudit model
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = PermissionAudit
        fields = [
            'id', 'user', 'user_username', 'action', 'permission', 'resource_type',
            'resource_id', 'result', 'ip_address', 'user_agent', 'request_path',
            'additional_data', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class UserPermissionSummarySerializer(serializers.Serializer):
    """
    Serializer for user permission summary
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    roles = serializers.ListField(child=serializers.CharField())
    permissions = serializers.ListField(child=serializers.CharField())
    active_role_assignments = UserRoleAssignmentSerializer(many=True, read_only=True)
    contextual_permissions = ContextualPermissionSerializer(many=True, read_only=True)


class RolePermissionSummarySerializer(serializers.Serializer):
    """
    Serializer for role permission summary
    """
    role_id = serializers.IntegerField()
    role_name = serializers.CharField()
    role_code = serializers.CharField()
    permissions = PermissionSerializer(many=True, read_only=True)
    user_count = serializers.IntegerField()
    is_system_role = serializers.BooleanField()
    parent_role_name = serializers.CharField(read_only=True)
    child_roles_count = serializers.IntegerField()


# Utility serializers for permission checking
class PermissionCheckSerializer(serializers.Serializer):
    """
    Serializer for permission check requests
    """
    permission = serializers.CharField(max_length=100)
    resource_type = serializers.CharField(max_length=50, required=False)
    resource_id = serializers.IntegerField(required=False)
    scope_type = serializers.CharField(max_length=20, required=False)


class BulkPermissionCheckSerializer(serializers.Serializer):
    """
    Serializer for bulk permission check requests
    """
    permissions = serializers.ListField(
        child=serializers.CharField(max_length=100)
    )
    resource_type = serializers.CharField(max_length=50, required=False)
    resource_id = serializers.IntegerField(required=False)
    require_all = serializers.BooleanField(default=True)
