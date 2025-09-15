from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from courses.models import CourseOffering


class DiscussionForum(models.Model):
    """
    Discussion forum model for course and general discussions
    """
    course_offering = models.ForeignKey(
        CourseOffering, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='forums',
        help_text="Course offering (null for general forums)"
    )
    title = models.CharField(max_length=200, help_text="Forum title")
    description = models.TextField(help_text="Forum description")
    is_general = models.BooleanField(default=False, help_text="Whether this is a general forum")
    is_private = models.BooleanField(default=False, help_text="Whether forum is private")
    allowed_roles = models.JSONField(
        default=list, 
        help_text="Roles allowed to access this forum"
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_forums')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.course_offering:
            return f"{self.course_offering} - {self.title}"
        return f"General - {self.title}"

    def clean(self):
        super().clean()
        if self.is_general and self.course_offering:
            raise ValidationError("General forums cannot be associated with a course offering")
        
        if not self.is_general and not self.course_offering:
            raise ValidationError("Course-specific forums must be associated with a course offering")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Discussion Forum"
        verbose_name_plural = "Discussion Forums"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course_offering', 'is_general']),
            models.Index(fields=['is_private']),
        ]


class DiscussionThread(models.Model):
    """
    Discussion thread model
    """
    forum = models.ForeignKey(DiscussionForum, on_delete=models.CASCADE, related_name='threads')
    title = models.CharField(max_length=200, help_text="Thread title")
    content = models.TextField(help_text="Thread content")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_threads')
    is_pinned = models.BooleanField(default=False, help_text="Whether thread is pinned")
    is_locked = models.BooleanField(default=False, help_text="Whether thread is locked")
    view_count = models.PositiveIntegerField(default=0, help_text="Number of views")
    last_activity = models.DateTimeField(auto_now=True, help_text="Last activity timestamp")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.forum.title} - {self.title}"

    class Meta:
        verbose_name = "Discussion Thread"
        verbose_name_plural = "Discussion Threads"
        ordering = ['-is_pinned', '-last_activity']
        indexes = [
            models.Index(fields=['forum', 'last_activity']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['is_pinned', 'is_locked']),
        ]


class DiscussionReply(models.Model):
    """
    Discussion reply model for threaded discussions
    """
    thread = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE, related_name='replies')
    parent_reply = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='child_replies',
        help_text="Parent reply for nested discussions"
    )
    content = models.TextField(help_text="Reply content")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_replies')
    is_solution = models.BooleanField(default=False, help_text="Whether this is marked as solution")
    upvotes = models.PositiveIntegerField(default=0, help_text="Number of upvotes")
    downvotes = models.PositiveIntegerField(default=0, help_text="Number of downvotes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reply to {self.thread.title} by {self.author.username}"

    def clean(self):
        super().clean()
        # Check nesting depth (max 3 levels)
        if self.parent_reply:
            depth = 1
            current = self.parent_reply
            while current.parent_reply:
                depth += 1
                current = current.parent_reply
                if depth > 2:  # 3 levels total (0, 1, 2)
                    raise ValidationError("Maximum nesting depth of 3 levels exceeded")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Discussion Reply"
        verbose_name_plural = "Discussion Replies"
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['thread', 'created_at']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['is_solution']),
        ]


class Notification(models.Model):
    """
    Enhanced notification model
    """
    NOTIFICATION_TYPES = [
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('SUCCESS', 'Success'),
        ('ERROR', 'Error'),
    ]

    CATEGORY_CHOICES = [
        ('ASSIGNMENT', 'Assignment'),
        ('GRADE', 'Grade'),
        ('ENROLLMENT', 'Enrollment'),
        ('SYSTEM', 'System'),
        ('MESSAGE', 'Message'),
        ('FORUM', 'Forum'),
        ('COURSE', 'Course'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200, help_text="Notification title")
    message = models.TextField(help_text="Notification message")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='INFO')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='SYSTEM')
    read = models.BooleanField(default=False, help_text="Whether notification has been read")
    read_at = models.DateTimeField(blank=True, null=True, help_text="When notification was read")
    action_url = models.CharField(max_length=500, blank=True, null=True, help_text="URL for action")
    sender = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='sent_notifications',
        help_text="User who sent the notification (null for system notifications)"
    )
    related_object_type = models.ForeignKey(
        ContentType, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Type of related object"
    )
    related_object_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID of related object")
    related_object = GenericForeignKey('related_object_type', 'related_object_id')
    expires_at = models.DateTimeField(blank=True, null=True, help_text="When notification expires")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recipient.username}: {self.title}"

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'read', 'created_at']),
            models.Index(fields=['category', 'notification_type']),
            models.Index(fields=['expires_at']),
        ]


class PrivateMessage(models.Model):
    """
    Private message model for direct user communication
    """
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200, help_text="Message subject")
    content = models.TextField(help_text="Message content")
    attachments = models.JSONField(default=list, help_text="Message attachment URLs")
    is_read = models.BooleanField(default=False, help_text="Whether message has been read")
    read_at = models.DateTimeField(blank=True, null=True, help_text="When message was read")
    parent_message = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='replies',
        help_text="Parent message for replies"
    )
    is_deleted_by_sender = models.BooleanField(default=False, help_text="Whether deleted by sender")
    is_deleted_by_recipient = models.BooleanField(default=False, help_text="Whether deleted by recipient")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.subject}"

    def clean(self):
        super().clean()
        if self.sender == self.recipient:
            raise ValidationError("Users cannot send messages to themselves")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Private Message"
        verbose_name_plural = "Private Messages"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['recipient', 'is_read', 'created_at']),
            models.Index(fields=['parent_message']),
        ]