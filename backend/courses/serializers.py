from rest_framework import serializers
from .models import Course, CourseOffering, Enrollment, CourseModule


class CourseModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for CourseModule model
    """
    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'description', 'order', 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    prerequisites_names = serializers.SerializerMethodField()
    corequisites_names = serializers.SerializerMethodField()
    offering_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'department', 'department_name', 'department_code',
            'credit_hours', 'course_type', 'level', 'description', 'prerequisites',
            'prerequisites_names', 'corequisites', 'corequisites_names', 'syllabus_file',
            'learning_outcomes', 'is_active', 'offering_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'offering_count']

    def get_prerequisites_names(self, obj):
        return [f"{course.name} ({course.code})" for course in obj.prerequisites.all()]

    def get_corequisites_names(self, obj):
        return [f"{course.name} ({course.code})" for course in obj.corequisites.all()]

    def get_offering_count(self, obj):
        return obj.offerings.count()

    def validate_code(self, value):
        """Validate course code is uppercase"""
        return value.upper()


class CourseOfferingSerializer(serializers.ModelSerializer):
    """
    Serializer for CourseOffering model
    """
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    semester_code = serializers.CharField(source='semester.code', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    enrollment_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseOffering
        fields = [
            'id', 'course', 'course_name', 'course_code', 'semester', 'semester_name',
            'semester_code', 'section', 'instructor', 'instructor_name', 'max_enrollment',
            'current_enrollment', 'enrollment_percentage', 'class_schedule', 'room_number',
            'meeting_pattern', 'start_time', 'end_time', 'enrollment_open',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_enrollment', 'created_at', 'updated_at']

    def get_instructor_name(self, obj):
        return f"{obj.instructor.first_name} {obj.instructor.last_name}"

    def get_enrollment_percentage(self, obj):
        if obj.max_enrollment > 0:
            return round((obj.current_enrollment / obj.max_enrollment) * 100, 2)
        return 0


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Enrollment model
    """
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.profile.student_id', read_only=True)
    course_offering_name = serializers.CharField(source='course_offering.__str__', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'student_id', 'course_offering',
            'course_offering_name', 'enrollment_date', 'status', 'grade',
            'grade_points', 'attendance_percentage', 'is_audit', 'drop_date',
            'completion_date'
        ]
        read_only_fields = ['id', 'enrollment_date']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class CourseDetailSerializer(CourseSerializer):
    """
    Detailed serializer for Course with related data
    """
    offerings = CourseOfferingSerializer(many=True, read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['offerings', 'modules']


class CourseOfferingDetailSerializer(CourseOfferingSerializer):
    """
    Detailed serializer for CourseOffering with enrollments
    """
    enrollments = EnrollmentSerializer(many=True, read_only=True)
    
    class Meta(CourseOfferingSerializer.Meta):
        fields = CourseOfferingSerializer.Meta.fields + ['enrollments']
