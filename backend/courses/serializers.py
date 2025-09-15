from rest_framework import serializers
from .models import Course, CourseModule


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
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'instructor_name', 'students', 
                 'start_date', 'end_date', 'is_active', 'modules', 'student_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_student_count(self, obj):
        return obj.students.count()
