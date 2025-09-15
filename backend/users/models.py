from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class UserProfile(models.Model):
    """
    Extended user profile model for LMS
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('FACULTY', 'Faculty'),
        ('STUDENT', 'Student'),
        ('PARENT', 'Parent'),
        ('LIBRARIAN', 'Librarian'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    employee_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    terms_accepted = models.BooleanField(default=False)
    privacy_policy_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['student_id']),
            models.Index(fields=['employee_id']),
        ]


class StudentProfile(models.Model):
    """
    Extended profile for students
    """
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='student_profile')
    admission_year = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2030)])
    graduation_year = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(2000), MaxValueValidator(2030)])
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'), 
                              validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('4.00'))])
    parent_contact = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, 
                                      related_name='children')
    library_card_number = models.CharField(max_length=20, blank=True, null=True)
    is_alumni = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user_profile.user.get_full_name()} - Student"

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"
        indexes = [
            models.Index(fields=['admission_year']),
            models.Index(fields=['graduation_year']),
        ]


class FacultyProfile(models.Model):
    """
    Extended profile for faculty members
    """
    DESIGNATION_CHOICES = [
        ('PROFESSOR', 'Professor'),
        ('ASSOCIATE_PROFESSOR', 'Associate Professor'),
        ('ASSISTANT_PROFESSOR', 'Assistant Professor'),
        ('LECTURER', 'Lecturer'),
        ('INSTRUCTOR', 'Instructor'),
        ('VISITING_PROFESSOR', 'Visiting Professor'),
    ]

    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='faculty_profile')
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=30, choices=DESIGNATION_CHOICES, default='LECTURER')
    qualification = models.TextField()
    experience_years = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    office_location = models.CharField(max_length=100, blank=True)
    office_hours = models.TextField(blank=True)
    research_interests = models.TextField(blank=True)
    is_department_head = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user_profile.user.get_full_name()} - {self.get_designation_display()}"

    class Meta:
        verbose_name = "Faculty Profile"
        verbose_name_plural = "Faculty Profiles"
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['designation']),
        ]


class ParentProfile(models.Model):
    """
    Extended profile for parents
    """
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='parent_profile')
    occupation = models.CharField(max_length=100, blank=True)
    workplace = models.CharField(max_length=100, blank=True)
    relationship_to_student = models.CharField(max_length=50, default='Parent')

    def __str__(self):
        return f"{self.user_profile.user.get_full_name()} - Parent"

    class Meta:
        verbose_name = "Parent Profile"
        verbose_name_plural = "Parent Profiles"


class LibrarianProfile(models.Model):
    """
    Extended profile for librarians
    """
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='librarian_profile')
    library_section = models.CharField(max_length=100, blank=True)
    employee_number = models.CharField(max_length=20, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user_profile.user.get_full_name()} - Librarian"

    class Meta:
        verbose_name = "Librarian Profile"
        verbose_name_plural = "Librarian Profiles"