from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
from courses.models import CourseOffering


class Assignment(models.Model):
    """
    Assignment model for course assessments
    """
    ASSIGNMENT_TYPES = [
        ('HOMEWORK', 'Homework'),
        ('QUIZ', 'Quiz'),
        ('EXAM', 'Exam'),
        ('PROJECT', 'Project'),
        ('LAB', 'Laboratory'),
        ('PRESENTATION', 'Presentation'),
        ('REPORT', 'Report'),
    ]
    
    course_offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200, help_text="Assignment title")
    description = models.TextField(help_text="Assignment description")
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, help_text="Type of assignment")
    total_points = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Total points for this assignment"
    )
    due_date = models.DateTimeField(help_text="Assignment due date and time")
    late_submission_allowed = models.BooleanField(default=True, help_text="Whether late submissions are allowed")
    late_penalty_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('10.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        help_text="Late penalty percentage"
    )
    max_attempts = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Maximum number of submission attempts"
    )
    is_group_assignment = models.BooleanField(default=False, help_text="Whether this is a group assignment")
    max_group_size = models.PositiveIntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(2)],
        help_text="Maximum group size (if group assignment)"
    )
    instructions = models.TextField(help_text="Detailed assignment instructions")
    attachments = models.JSONField(default=list, help_text="Assignment attachment URLs")
    rubric = models.JSONField(default=dict, blank=True, null=True, help_text="Grading rubric")
    auto_grade = models.BooleanField(default=False, help_text="Whether assignment can be auto-graded")
    published = models.BooleanField(default=False, help_text="Whether assignment is published to students")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course_offering} - {self.title}"

    def clean(self):
        super().clean()
        if self.total_points <= 0:
            raise ValidationError("Total points must be positive")
        
        if self.late_penalty_percentage < 0 or self.late_penalty_percentage > 100:
            raise ValidationError("Late penalty must be between 0 and 100 percent")
        
        if self.is_group_assignment and not self.max_group_size:
            raise ValidationError("Group assignments must specify maximum group size")
        
        if self.is_group_assignment and self.max_group_size and self.max_group_size < 2:
            raise ValidationError("Group size must be at least 2")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"
        ordering = ['course_offering', 'due_date']
        indexes = [
            models.Index(fields=['course_offering', 'due_date']),
            models.Index(fields=['published', 'due_date']),
            models.Index(fields=['assignment_type']),
        ]


class Submission(models.Model):
    """
    Assignment submission model
    """
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    submission_date = models.DateTimeField(auto_now_add=True)
    content = models.TextField(blank=True, null=True, help_text="Text content submission")
    files = models.JSONField(default=list, help_text="Submitted file URLs")
    is_late = models.BooleanField(default=False, help_text="Whether submission is late")
    attempt_number = models.PositiveIntegerField(default=1, help_text="Submission attempt number")
    plagiarism_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        help_text="Plagiarism detection score"
    )
    plagiarism_report = models.JSONField(default=dict, blank=True, null=True, help_text="Plagiarism detection report")
    grade = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Assignment grade"
    )
    graded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='graded_submissions',
        help_text="User who graded this submission"
    )
    graded_at = models.DateTimeField(blank=True, null=True, help_text="When submission was graded")
    feedback = models.TextField(blank=True, null=True, help_text="Instructor feedback")
    is_group_submission = models.BooleanField(default=False, help_text="Whether this is a group submission")
    group_members = models.ManyToManyField(
        User, 
        blank=True, 
        related_name='group_submissions',
        help_text="Other group members (excluding submitter)"
    )

    def __str__(self):
        return f"{self.assignment.title} - {self.student.username} (Attempt {self.attempt_number})"

    def clean(self):
        super().clean()
        # Check if student is actually a student
        if not hasattr(self.student, 'profile') or self.student.profile.role != 'STUDENT':
            raise ValidationError("Only students can submit assignments")
        
        # Check plagiarism score
        if self.plagiarism_score is not None:
            if self.plagiarism_score < 0 or self.plagiarism_score > 100:
                raise ValidationError("Plagiarism score must be between 0 and 100")
        
        # Check grade
        if self.grade is not None:
            if self.grade < 0 or self.grade > self.assignment.total_points:
                raise ValidationError(f"Grade must be between 0 and {self.assignment.total_points}")
        
        # Check attempt number
        if self.attempt_number > self.assignment.max_attempts:
            raise ValidationError(f"Attempt number cannot exceed {self.assignment.max_attempts}")

    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Check if submission is late
        if self.submission_date > self.assignment.due_date:
            self.is_late = True
        
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Submission"
        verbose_name_plural = "Submissions"
        unique_together = ['assignment', 'student', 'attempt_number']
        ordering = ['-submission_date']
        indexes = [
            models.Index(fields=['assignment', 'student']),
            models.Index(fields=['submission_date']),
            models.Index(fields=['is_late']),
            models.Index(fields=['grade']),
        ]