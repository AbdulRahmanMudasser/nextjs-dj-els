from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from .models import SystemSettings, SystemLog, SystemBackup, SystemAnnouncement, EmailTemplate, Notification
from users.models import UserProfile
from courses.models import Course, CourseOffering
from assignments.models import Assignment


class SystemSettingsSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = '__all__'


class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SystemLog
        fields = '__all__'


class SystemBackupSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemBackup
        fields = '__all__'
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None


class SystemAnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    target_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemAnnouncement
        fields = '__all__'
    
    def get_target_users_count(self, obj):
        return obj.target_users.count()


class EmailTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = EmailTemplate
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'


class DashboardMetricsSerializer(serializers.Serializer):
    """Serializer for dashboard metrics"""
    
    # User metrics
    totalUsers = serializers.IntegerField()
    activeUsers = serializers.IntegerField()
    totalCourses = serializers.IntegerField()
    activeCourses = serializers.IntegerField()
    totalDepartments = serializers.IntegerField()
    totalPrograms = serializers.IntegerField()
    totalEnrollments = serializers.IntegerField()
    pendingApprovals = serializers.IntegerField()
    
    # System health
    systemHealth = serializers.DictField()
    
    # User breakdown
    userBreakdown = serializers.DictField()
    
    # Recent activity
    recentActivity = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Quick stats
    quickStats = serializers.ListField(
        child=serializers.DictField()
    )


class UserAnalyticsSerializer(serializers.Serializer):
    """Serializer for user analytics data"""
    
    # User growth over time
    user_growth_data = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Role distribution
    role_distribution = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Active vs inactive users
    user_activity_status = serializers.DictField()
    
    # Login frequency patterns
    login_patterns = serializers.DictField()
    
    # Geographic distribution (if available)
    geographic_distribution = serializers.DictField()


class AcademicAnalyticsSerializer(serializers.Serializer):
    """Serializer for academic analytics data"""
    
    # Course enrollment trends
    enrollment_trends = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Assignment submission rates
    submission_rates = serializers.DictField()
    
    # Grade distribution
    grade_distribution = serializers.DictField()
    
    # Faculty workload
    faculty_workload = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Student performance trends
    performance_trends = serializers.DictField()


class SystemAnalyticsSerializer(serializers.Serializer):
    """Serializer for system analytics data"""
    
    # API usage statistics
    api_usage = serializers.DictField()
    
    # Response time trends
    response_times = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Error rate monitoring
    error_rates = serializers.DictField()
    
    # Feature usage
    feature_usage = serializers.DictField()
    
    # Peak usage hours
    peak_usage = serializers.DictField()


class ActivityLogSerializer(serializers.Serializer):
    """Serializer for activity log entries"""
    
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    timestamp = serializers.DateTimeField()
    user_name = serializers.CharField()
    user_id = serializers.IntegerField()
    category = serializers.CharField()
    severity = serializers.CharField()


class BulkUserImportSerializer(serializers.Serializer):
    """Serializer for bulk user import"""
    
    file = serializers.FileField()
    role = serializers.CharField(required=False)
    department = serializers.IntegerField(required=False)
    send_welcome_email = serializers.BooleanField(default=True)
    validate_only = serializers.BooleanField(default=False)


class BulkUserImportResultSerializer(serializers.Serializer):
    """Serializer for bulk import results"""
    
    total_rows = serializers.IntegerField()
    successful_imports = serializers.IntegerField()
    failed_imports = serializers.IntegerField()
    errors = serializers.ListField(
        child=serializers.DictField()
    )
    warnings = serializers.ListField(
        child=serializers.DictField()
    )
    imported_users = serializers.ListField(
        child=serializers.DictField()
    )
