from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class SystemSettings(models.Model):
    """
    System configuration settings
    """
    key = models.CharField(max_length=100, unique=True, help_text="Setting key")
    value = models.TextField(help_text="Setting value")
    description = models.TextField(blank=True, help_text="Setting description")
    category = models.CharField(max_length=50, default='general', help_text="Setting category")
    is_public = models.BooleanField(default=False, help_text="Whether setting is public")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.key}: {self.value}"

    class Meta:
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"
        ordering = ['category', 'key']


class SystemLog(models.Model):
    """
    System activity logs
    """
    LOG_LEVELS = [
        ('DEBUG', 'Debug'),
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Critical'),
    ]

    LOG_CATEGORIES = [
        ('AUTH', 'Authentication'),
        ('USER', 'User Management'),
        ('COURSE', 'Course Management'),
        ('ASSIGNMENT', 'Assignment'),
        ('SYSTEM', 'System'),
        ('SECURITY', 'Security'),
        ('API', 'API'),
    ]

    level = models.CharField(max_length=10, choices=LOG_LEVELS, default='INFO')
    category = models.CharField(max_length=20, choices=LOG_CATEGORIES, default='SYSTEM')
    message = models.TextField(help_text="Log message")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    response_status = models.IntegerField(null=True, blank=True)
    execution_time = models.FloatField(null=True, blank=True, help_text="Execution time in seconds")
    extra_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.level} - {self.message[:50]}"

    class Meta:
        verbose_name = "System Log"
        verbose_name_plural = "System Logs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['level', 'created_at']),
            models.Index(fields=['category', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]


class SystemBackup(models.Model):
    """
    System backup records
    """
    BACKUP_TYPES = [
        ('FULL', 'Full Backup'),
        ('INCREMENTAL', 'Incremental Backup'),
        ('DATABASE', 'Database Only'),
        ('FILES', 'Files Only'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    name = models.CharField(max_length=200, help_text="Backup name")
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPES, default='FULL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    file_path = models.CharField(max_length=500, blank=True, help_text="Backup file path")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="File size in bytes")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.status}"

    class Meta:
        verbose_name = "System Backup"
        verbose_name_plural = "System Backups"
        ordering = ['-created_at']


class SystemAnnouncement(models.Model):
    """
    System-wide announcements
    """
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    title = models.CharField(max_length=200, help_text="Announcement title")
    message = models.TextField(help_text="Announcement message")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    target_roles = models.JSONField(default=list, help_text="Target user roles")
    target_users = models.ManyToManyField(User, blank=True, help_text="Specific target users")
    is_active = models.BooleanField(default=True, help_text="Whether announcement is active")
    scheduled_at = models.DateTimeField(null=True, blank=True, help_text="Scheduled delivery time")
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Expiration time")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_announcements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "System Announcement"
        verbose_name_plural = "System Announcements"
        ordering = ['-created_at']


class EmailTemplate(models.Model):
    """
    Email templates for system communications
    """
    TEMPLATE_TYPES = [
        ('WELCOME', 'Welcome Email'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('GRADE_NOTIFICATION', 'Grade Notification'),
        ('COURSE_ENROLLMENT', 'Course Enrollment'),
        ('ASSIGNMENT_DUE', 'Assignment Due'),
        ('SYSTEM_MAINTENANCE', 'System Maintenance'),
        ('CUSTOM', 'Custom'),
    ]

    name = models.CharField(max_length=100, help_text="Template name")
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPES, default='CUSTOM')
    subject = models.CharField(max_length=200, help_text="Email subject")
    body_html = models.TextField(help_text="HTML email body")
    body_text = models.TextField(help_text="Plain text email body")
    variables = models.JSONField(default=list, help_text="Available template variables")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Email Template"
        verbose_name_plural = "Email Templates"
        ordering = ['template_type', 'name']


class Notification(models.Model):
    """
    User notifications
    """
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_notifications')
    title = models.CharField(max_length=200, help_text="Notification title")
    message = models.TextField(help_text="Notification message")
    type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional notification data")

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
        ]