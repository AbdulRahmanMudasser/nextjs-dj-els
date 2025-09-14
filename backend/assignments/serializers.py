from rest_framework import serializers
from .models import Assignment, AssignmentSubmission


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for AssignmentSubmission model
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student', 'student_name', 'content', 'file_upload', 
                 'submitted_at', 'grade', 'feedback', 'is_graded']
        read_only_fields = ['id', 'submitted_at']


class AssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Assignment model
    """
    course_title = serializers.CharField(source='course.title', read_only=True)
    submissions = AssignmentSubmissionSerializer(many=True, read_only=True)
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'course', 'course_title', 'assignment_type', 
                 'due_date', 'max_points', 'is_published', 'submissions', 'submission_count', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_submission_count(self, obj):
        return obj.submissions.count()
