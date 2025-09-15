from django.db import models
from django.contrib.auth.models import User
from courses.models import Course


class Assignment(models.Model):
    """
    Assignment model
    """
    ASSIGNMENT_TYPES = [
        ('homework', 'Homework'),
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
        ('project', 'Project'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES)
    due_date = models.DateTimeField()
    max_points = models.PositiveIntegerField(default=100)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    class Meta:
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"
        ordering = ['-created_at']


class AssignmentSubmission(models.Model):
    """
    Assignment submission model
    """
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    content = models.TextField()
    file_upload = models.FileField(upload_to='submissions/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.PositiveIntegerField(blank=True, null=True)
    feedback = models.TextField(blank=True)
    is_graded = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.assignment.title} - {self.student.username}"

    class Meta:
        verbose_name = "Assignment Submission"
        verbose_name_plural = "Assignment Submissions"
        unique_together = ['assignment', 'student']