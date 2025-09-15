from rest_framework import serializers
from .models import Assignment, Submission


class SubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for Submission model
    """
    student_name = serializers.SerializerMethodField()
    student_id = serializers.CharField(source='student.profile.student_id', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    
    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name', 'student_id',
            'submission_date', 'content', 'files', 'is_late', 'attempt_number',
            'plagiarism_score', 'plagiarism_report', 'grade', 'graded_by', 'graded_at',
            'feedback', 'is_group_submission', 'group_members'
        ]
        read_only_fields = ['id', 'submission_date', 'is_late']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class AssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Assignment model
    """
    course_offering_name = serializers.CharField(source='course_offering.__str__', read_only=True)
    course_name = serializers.CharField(source='course_offering.course.name', read_only=True)
    semester_name = serializers.CharField(source='course_offering.semester.name', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    submissions = SubmissionSerializer(many=True, read_only=True)
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'course_offering', 'course_offering_name', 'course_name', 'semester_name',
            'title', 'description', 'assignment_type', 'total_points', 'due_date',
            'late_submission_allowed', 'late_penalty_percentage', 'max_attempts',
            'is_group_assignment', 'max_group_size', 'instructions', 'attachments',
            'rubric', 'auto_grade', 'published', 'instructor_name', 'submissions',
            'submission_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submission_count']

    def get_instructor_name(self, obj):
        instructor = obj.course_offering.instructor
        return f"{instructor.first_name} {instructor.last_name}"

    def get_submission_count(self, obj):
        return obj.submissions.count()


class AssignmentDetailSerializer(AssignmentSerializer):
    """
    Detailed serializer for Assignment with all submissions
    """
    class Meta(AssignmentSerializer.Meta):
        fields = AssignmentSerializer.Meta.fields
