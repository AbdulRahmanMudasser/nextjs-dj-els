from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from academics.models import Department, Program


class Course(models.Model):
    """
    Course model for academic courses
    """
    COURSE_TYPES = [
        ('CORE', 'Core'),
        ('ELECTIVE', 'Elective'),
        ('LAB', 'Laboratory'),
        ('PROJECT', 'Project'),
        ('THESIS', 'Thesis'),
    ]

    LEVEL_CHOICES = [
        ('UNDERGRADUATE', 'Undergraduate'),
        ('GRADUATE', 'Graduate'),
        ('POSTGRADUATE', 'Postgraduate'),
    ]

    name = models.CharField(max_length=200, help_text="Course name (e.g., Data Structures and Algorithms)")
    code = models.CharField(max_length=20, unique=True, help_text="Course code (e.g., CS201)")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    credit_hours = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)],
        help_text="Credit hours for this course"
    )
    course_type = models.CharField(max_length=20, choices=COURSE_TYPES, default='CORE')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='UNDERGRADUATE')
    description = models.TextField(help_text="Course description")
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='prerequisite_for')
    corequisites = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='corequisite_for')
    syllabus_file = models.FileField(upload_to='syllabi/', blank=True, null=True)
    learning_outcomes = models.TextField(help_text="Learning outcomes for this course")
    is_active = models.BooleanField(default=True, help_text="Whether course is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        super().clean()
        if self.credit_hours <= 0:
            raise ValidationError("Credit hours must be positive")
        
        # Check for circular prerequisites
        if self.pk:
            self._check_circular_prerequisites()

    def _check_circular_prerequisites(self):
        """Check for circular prerequisite dependencies"""
        visited = set()
        stack = [self]
        
        while stack:
            current = stack.pop()
            if current in visited:
                raise ValidationError("Circular prerequisite dependency detected")
            visited.add(current)
            stack.extend(current.prerequisites.all())

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ['department', 'code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['department', 'is_active']),
            models.Index(fields=['course_type', 'level']),
        ]


class CourseOffering(models.Model):
    """
    Course offering for a specific semester
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='offerings')
    semester = models.ForeignKey('academics.Semester', on_delete=models.CASCADE, related_name='course_offerings')
    section = models.CharField(max_length=10, help_text="Section identifier (e.g., A, B, C)")
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taught_offerings')
    max_enrollment = models.PositiveIntegerField(help_text="Maximum number of students")
    current_enrollment = models.PositiveIntegerField(default=0, help_text="Current number of enrolled students")
    class_schedule = models.JSONField(default=dict, help_text="Class schedule (days, times, rooms)")
    room_number = models.CharField(max_length=50, help_text="Classroom number")
    meeting_pattern = models.CharField(max_length=20, help_text="Meeting pattern (e.g., MWF, TTH)")
    start_time = models.TimeField(help_text="Class start time")
    end_time = models.TimeField(help_text="Class end time")
    enrollment_open = models.BooleanField(default=True, help_text="Whether enrollment is open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.name} - {self.semester.code} - Section {self.section}"

    def clean(self):
        super().clean()
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time")
        
        if self.current_enrollment > self.max_enrollment:
            raise ValidationError("Current enrollment cannot exceed maximum enrollment")
        
        # Check if instructor is faculty
        if not hasattr(self.instructor, 'profile') or self.instructor.profile.role != 'FACULTY':
            raise ValidationError("Instructor must be a faculty member")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Course Offering"
        verbose_name_plural = "Course Offerings"
        unique_together = ['course', 'semester', 'section']
        ordering = ['semester', 'course', 'section']
        indexes = [
            models.Index(fields=['semester', 'course']),
            models.Index(fields=['instructor', 'semester']),
            models.Index(fields=['enrollment_open']),
        ]


class Enrollment(models.Model):
    """
    Student enrollment in course offerings
    """
    STATUS_CHOICES = [
        ('ENROLLED', 'Enrolled'),
        ('DROPPED', 'Dropped'),
        ('COMPLETED', 'Completed'),
        ('WITHDRAWN', 'Withdrawn'),
        ('AUDIT', 'Audit'),
    ]

    GRADE_CHOICES = [
        ('A+', 'A+'),
        ('A', 'A'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B', 'B'),
        ('B-', 'B-'),
        ('C+', 'C+'),
        ('C', 'C'),
        ('C-', 'C-'),
        ('D+', 'D+'),
        ('D', 'D'),
        ('F', 'F'),
        ('W', 'Withdrawn'),
        ('I', 'Incomplete'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course_offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ENROLLED')
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES, blank=True, null=True)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    is_audit = models.BooleanField(default=False, help_text="Whether this is an audit enrollment")
    drop_date = models.DateTimeField(blank=True, null=True)
    completion_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.course_offering}"

    def clean(self):
        super().clean()
        # Check if student is actually a student
        if not hasattr(self.student, 'profile') or self.student.profile.role != 'STUDENT':
            raise ValidationError("Only students can enroll in courses")
        
        # Check attendance percentage
        if self.attendance_percentage < 0 or self.attendance_percentage > 100:
            raise ValidationError("Attendance percentage must be between 0 and 100")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        unique_together = ['student', 'course_offering']
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course_offering', 'status']),
            models.Index(fields=['enrollment_date']),
        ]


class CourseModule(models.Model):
    """
    Course module model
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField()
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    class Meta:
        verbose_name = "Course Module"
        verbose_name_plural = "Course Modules"
        ordering = ['course', 'order']