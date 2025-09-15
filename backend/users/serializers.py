from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, StudentProfile, FacultyProfile, ParentProfile, LibrarianProfile


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'role', 'employee_id', 'student_id', 'phone_number', 
            'date_of_birth', 'address', 'emergency_contact', 'profile_picture', 
            'is_active', 'created_at', 'updated_at', 'last_login_ip', 
            'terms_accepted', 'privacy_policy_accepted', 'full_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_ip']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentProfile model
    """
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user_profile', 'admission_year', 'graduation_year', 'gpa',
            'parent_contact', 'library_card_number', 'is_alumni'
        ]
        read_only_fields = ['id']


class FacultyProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for FacultyProfile model
    """
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = FacultyProfile
        fields = [
            'id', 'user_profile', 'department', 'designation', 'qualification',
            'experience_years', 'office_location', 'office_hours', 'research_interests',
            'is_department_head'
        ]
        read_only_fields = ['id']


class ParentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for ParentProfile model
    """
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ParentProfile
        fields = [
            'id', 'user_profile', 'occupation', 'workplace', 'relationship_to_student'
        ]
        read_only_fields = ['id']


class LibrarianProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for LibrarianProfile model
    """
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = LibrarianProfile
        fields = [
            'id', 'user_profile', 'library_section', 'employee_number', 'specialization'
        ]
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration
    """
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)
    phone_number = serializers.CharField(max_length=20, required=False)
    terms_accepted = serializers.BooleanField()
    privacy_policy_accepted = serializers.BooleanField()
    
    # Role-specific fields
    employee_id = serializers.CharField(max_length=20, required=False, allow_blank=True)
    student_id = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    # Student-specific fields
    admission_year = serializers.IntegerField(required=False, min_value=2000, max_value=2030)
    
    # Faculty-specific fields
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    designation = serializers.ChoiceField(choices=FacultyProfile.DESIGNATION_CHOICES, required=False)
    qualification = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        if not data.get('terms_accepted'):
            raise serializers.ValidationError("You must accept the terms and conditions")
        
        if not data.get('privacy_policy_accepted'):
            raise serializers.ValidationError("You must accept the privacy policy")
        
        # Role-specific validation
        role = data.get('role')
        if role == 'STUDENT':
            if not data.get('student_id'):
                raise serializers.ValidationError("Student ID is required for students")
            if not data.get('admission_year'):
                raise serializers.ValidationError("Admission year is required for students")
        elif role == 'FACULTY':
            if not data.get('employee_id'):
                raise serializers.ValidationError("Employee ID is required for faculty")
            if not data.get('department'):
                raise serializers.ValidationError("Department is required for faculty")
        
        return data


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login - supports both email and username
    """
    email_or_username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    remember_me = serializers.BooleanField(default=False)
