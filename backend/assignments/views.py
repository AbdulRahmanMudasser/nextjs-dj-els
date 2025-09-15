from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, AssignmentDetailSerializer, SubmissionSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assignments
    """
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course_offering', 'assignment_type', 'published']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'due_date', 'created_at']
    ordering = ['due_date']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AssignmentDetailSerializer
        return AssignmentSerializer

    def get_queryset(self):
        """
        Filter assignments based on user role
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        if hasattr(user, 'profile'):
            if user.profile.role == 'STUDENT':
                # Students can only see published assignments for their enrolled courses
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user,
                    status='ENROLLED'
                ).values_list('course_offering', flat=True)
                queryset = queryset.filter(
                    course_offering__in=enrolled_courses,
                    published=True
                )
            elif user.profile.role == 'FACULTY':
                # Faculty can see assignments for their courses
                queryset = queryset.filter(course_offering__instructor=user)
        
        return queryset

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]  # Faculty can manage
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """
        Get all submissions for an assignment
        """
        assignment = self.get_object()
        user = request.user
        
        # Check permissions
        if hasattr(user, 'profile'):
            if user.profile.role == 'STUDENT':
                # Students can only see their own submissions
                submissions = assignment.submissions.filter(student=user)
            elif user.profile.role == 'FACULTY':
                # Faculty can see all submissions for their assignments
                if assignment.course_offering.instructor != user:
                    return Response(
                        {'error': 'You can only view submissions for your own assignments'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                submissions = assignment.submissions.all()
            else:
                submissions = assignment.submissions.all()
        else:
            submissions = assignment.submissions.all()
        
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Submit assignment
        """
        assignment = self.get_object()
        user = request.user
        
        # Check if user is a student
        if not hasattr(user, 'profile') or user.profile.role != 'STUDENT':
            return Response(
                {'error': 'Only students can submit assignments'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if assignment is published
        if not assignment.published:
            return Response(
                {'error': 'Assignment is not published'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if assignment is past due and late submission not allowed
        if timezone.now() > assignment.due_date and not assignment.late_submission_allowed:
            return Response(
                {'error': 'Assignment is past due and late submissions are not allowed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check attempt limit
        existing_submissions = assignment.submissions.filter(student=user).count()
        if existing_submissions >= assignment.max_attempts:
            return Response(
                {'error': f'Maximum attempts ({assignment.max_attempts}) exceeded'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create submission
        submission_data = {
            'assignment': assignment.id,
            'student': user.id,
            'content': request.data.get('content', ''),
            'files': request.data.get('files', []),
            'attempt_number': existing_submissions + 1,
            'is_group_submission': request.data.get('is_group_submission', False),
            'group_members': request.data.get('group_members', [])
        }
        
        serializer = SubmissionSerializer(data=submission_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing submissions
    """
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['assignment', 'student', 'is_late', 'is_group_submission']
    search_fields = ['assignment__title', 'student__first_name', 'student__last_name']
    ordering_fields = ['submission_date', 'grade', 'attempt_number']
    ordering = ['-submission_date']

    def get_queryset(self):
        """
        Filter submissions based on user role
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        if hasattr(user, 'profile'):
            if user.profile.role == 'STUDENT':
                # Students can only see their own submissions
                queryset = queryset.filter(student=user)
            elif user.profile.role == 'FACULTY':
                # Faculty can see submissions for their assignments
                queryset = queryset.filter(assignment__course_offering__instructor=user)
        
        return queryset

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """
        Grade a submission (faculty only)
        """
        submission = self.get_object()
        user = request.user
        
        # Check if user is faculty and owns the assignment
        if not hasattr(user, 'profile') or user.profile.role != 'FACULTY':
            return Response(
                {'error': 'Only faculty can grade submissions'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if submission.assignment.course_offering.instructor != user:
            return Response(
                {'error': 'You can only grade submissions for your own assignments'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update grade and feedback
        grade = request.data.get('grade')
        feedback = request.data.get('feedback', '')
        
        if grade is not None:
            if grade < 0 or grade > submission.assignment.total_points:
                return Response(
                    {'error': f'Grade must be between 0 and {submission.assignment.total_points}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            submission.grade = grade
            submission.graded_by = user
            submission.graded_at = timezone.now()
        
        if feedback:
            submission.feedback = feedback
        
        submission.save()
        
        serializer = SubmissionSerializer(submission)
        return Response(serializer.data)