from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from rbac.permission_manager import PermissionManager
from rbac.decorators import require_permissions, require_roles
from .models import Course, CourseOffering, Enrollment
from .serializers import (
    CourseSerializer, CourseDetailSerializer,
    CourseOfferingSerializer, CourseOfferingDetailSerializer,
    EnrollmentSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'course_type', 'level', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'credit_hours', 'created_at']
    ordering = ['department', 'code']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_create_courses', 'can_edit_courses', 'can_delete_courses'])(permission()) for permission in permission_classes]
        else:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_view_courses'])(permission()) for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def prerequisites(self, request, pk=None):
        """
        Get prerequisites for a course
        """
        course = self.get_object()
        prerequisites = course.prerequisites.all()
        serializer = CourseSerializer(prerequisites, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def offerings(self, request, pk=None):
        """
        Get all offerings for a course
        """
        course = self.get_object()
        offerings = course.offerings.all()
        serializer = CourseOfferingSerializer(offerings, many=True)
        return Response(serializer.data)


class CourseOfferingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing course offerings
    """
    queryset = CourseOffering.objects.all()
    serializer_class = CourseOfferingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'semester', 'instructor', 'enrollment_open']
    search_fields = ['course__name', 'course__code', 'section']
    ordering_fields = ['course__name', 'start_time', 'end_time', 'created_at']
    ordering = ['semester', 'course', 'section']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseOfferingDetailSerializer
        return CourseOfferingSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        Get all enrolled students for a course offering
        """
        offering = self.get_object()
        enrollments = offering.enrollments.filter(status='ENROLLED')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Enroll current user in a course offering
        """
        offering = self.get_object()
        user = request.user
        
        # Check if user is a student
        if not hasattr(user, 'profile') or user.profile.role != 'STUDENT':
            return Response(
                {'error': 'Only students can enroll in courses'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if enrollment is open
        if not offering.enrollment_open:
            return Response(
                {'error': 'Enrollment is not open for this course'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course_offering=offering).exists():
            return Response(
                {'error': 'Already enrolled in this course'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check enrollment capacity
        if offering.current_enrollment >= offering.max_enrollment:
            return Response(
                {'error': 'Course is full'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=user,
            course_offering=offering,
            status='ENROLLED'
        )
        
        # Update current enrollment count
        offering.current_enrollment += 1
        offering.save()
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing enrollments
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'course_offering', 'status', 'is_audit']
    search_fields = ['student__first_name', 'student__last_name', 'course_offering__course__name']
    ordering_fields = ['enrollment_date', 'status', 'grade']
    ordering = ['-enrollment_date']

    def get_queryset(self):
        """
        Filter enrollments based on user role
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        if hasattr(user, 'profile'):
            if user.profile.role == 'STUDENT':
                # Students can only see their own enrollments
                queryset = queryset.filter(student=user)
            elif user.profile.role == 'FACULTY':
                # Faculty can see enrollments for their courses
                queryset = queryset.filter(
                    course_offering__instructor=user
                )
        
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
    def drop(self, request, pk=None):
        """
        Drop enrollment (student action)
        """
        enrollment = self.get_object()
        user = request.user
        
        # Check if user is the student or admin
        if enrollment.student != user and not user.is_staff:
            return Response(
                {'error': 'You can only drop your own enrollments'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if enrollment.status != 'ENROLLED':
            return Response(
                {'error': 'Can only drop enrolled courses'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update enrollment status
        enrollment.status = 'DROPPED'
        enrollment.save()
        
        # Update course offering enrollment count
        offering = enrollment.course_offering
        offering.current_enrollment -= 1
        offering.save()
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data)