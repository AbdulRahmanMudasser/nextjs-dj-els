from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal


class Department(models.Model):
    """
    Department model for academic organization
    """
    name = models.CharField(max_length=200, help_text="Department name (e.g., Computer Science)")
    code = models.CharField(max_length=10, unique=True, help_text="Department code (e.g., CS)")
    description = models.TextField(blank=True, help_text="Department description")
    head_of_department = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='headed_departments',
        help_text="Head of Department (must be faculty)"
    )
    established_date = models.DateField(help_text="Date when department was established")
    contact_email = models.EmailField(help_text="Department contact email")
    contact_phone = models.CharField(max_length=20, help_text="Department contact phone")
    location = models.CharField(max_length=200, help_text="Building/Floor information")
    is_active = models.BooleanField(default=True, help_text="Whether department is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        super().clean()
        if self.head_of_department:
            # Check if HOD is faculty
            if not hasattr(self.head_of_department, 'profile') or self.head_of_department.profile.role != 'FACULTY':
                raise ValidationError("Head of Department must be a faculty member")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]


class Program(models.Model):
    """
    Academic program model
    """
    DEGREE_TYPES = [
        ('BACHELOR', 'Bachelor'),
        ('MASTER', 'Master'),
        ('PHD', 'PhD'),
        ('CERTIFICATE', 'Certificate'),
        ('DIPLOMA', 'Diploma'),
    ]

    name = models.CharField(max_length=200, help_text="Program name (e.g., Bachelor of Computer Science)")
    code = models.CharField(max_length=20, unique=True, help_text="Program code (e.g., BCS)")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    degree_type = models.CharField(max_length=20, choices=DEGREE_TYPES, help_text="Type of degree")
    duration_years = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Program duration in years"
    )
    total_credit_hours = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(200)],
        help_text="Total credit hours required"
    )
    description = models.TextField(help_text="Program description")
    admission_requirements = models.TextField(help_text="Admission requirements")
    is_active = models.BooleanField(default=True, help_text="Whether program is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        super().clean()
        if self.duration_years <= 0:
            raise ValidationError("Duration must be a positive integer")
        if self.total_credit_hours <= 0:
            raise ValidationError("Total credit hours must be positive")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Program"
        verbose_name_plural = "Programs"
        ordering = ['department', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['department', 'is_active']),
        ]


class Semester(models.Model):
    """
    Academic semester model
    """
    name = models.CharField(max_length=100, help_text="Semester name (e.g., Fall 2024)")
    code = models.CharField(max_length=20, unique=True, help_text="Semester code (e.g., FA24)")
    start_date = models.DateField(help_text="Semester start date")
    end_date = models.DateField(help_text="Semester end date")
    registration_start = models.DateTimeField(help_text="Registration start date and time")
    registration_end = models.DateTimeField(help_text="Registration end date and time")
    is_current = models.BooleanField(default=False, help_text="Whether this is the current semester")
    is_active = models.BooleanField(default=True, help_text="Whether semester is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        super().clean()
        if self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date")
        
        if self.registration_end <= self.registration_start:
            raise ValidationError("Registration end must be after registration start")
        
        # Check if registration period is within semester dates
        if self.registration_start.date() < self.start_date:
            raise ValidationError("Registration start cannot be before semester start")
        
        if self.registration_end.date() > self.end_date:
            raise ValidationError("Registration end cannot be after semester end")

    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Ensure only one current semester
        if self.is_current:
            Semester.objects.filter(is_current=True).update(is_current=False)
        
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Semester"
        verbose_name_plural = "Semesters"
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_current']),
            models.Index(fields=['start_date', 'end_date']),
        ]
