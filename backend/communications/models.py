from django.db import models
from django.contrib.auth.models import User


class Message(models.Model):
    """
    Message model for user communications
    """
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.subject}"

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['-created_at']


class Notification(models.Model):
    """
    Notification model
    """
    NOTIFICATION_TYPES = [
        ('assignment_due', 'Assignment Due'),
        ('grade_posted', 'Grade Posted'),
        ('course_update', 'Course Update'),
        ('message_received', 'Message Received'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.title}"

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']