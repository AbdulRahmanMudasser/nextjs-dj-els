from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Department, Program, Semester
from .serializers import (
    DepartmentSerializer, DepartmentDetailSerializer,
    ProgramSerializer, ProgramDetailSerializer,
    SemesterSerializer, SemesterDetailSerializer
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'head_of_department']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DepartmentDetailSerializer
        return DepartmentSerializer

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
    def programs(self, request, pk=None):
        """
        Get all programs for a department
        """
        department = self.get_object()
        programs = department.programs.filter(is_active=True)
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def faculty(self, request, pk=None):
        """
        Get all faculty members in a department
        """
        department = self.get_object()
        from django.contrib.auth.models import User
        faculty = User.objects.filter(
            profile__role='FACULTY',
            facultyprofile__department=department.name
        )
        faculty_data = []
        for member in faculty:
            faculty_data.append({
                'id': member.id,
                'name': f"{member.first_name} {member.last_name}",
                'email': member.email,
                'designation': member.facultyprofile.designation if hasattr(member, 'facultyprofile') else None,
                'is_hod': member == department.head_of_department
            })
        return Response(faculty_data)


class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing programs
    """
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'degree_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'duration_years', 'created_at']
    ordering = ['department', 'name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProgramDetailSerializer
        return ProgramSerializer

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
        Get all students enrolled in a program
        """
        program = self.get_object()
        from django.contrib.auth.models import User
        students = User.objects.filter(
            profile__role='STUDENT',
            studentprofile__admission_year__gte=2020  # Example filter
        )
        student_data = []
        for student in students:
            student_data.append({
                'id': student.id,
                'name': f"{student.first_name} {student.last_name}",
                'email': student.email,
                'student_id': student.profile.student_id,
                'admission_year': student.studentprofile.admission_year if hasattr(student, 'studentprofile') else None
            })
        return Response(student_data)


class SemesterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing semesters
    """
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_current', 'is_active']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SemesterDetailSerializer
        return SemesterSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Get the current semester
        """
        try:
            current_semester = Semester.objects.get(is_current=True, is_active=True)
            serializer = SemesterDetailSerializer(current_semester)
            return Response(serializer.data)
        except Semester.DoesNotExist:
            return Response(
                {'error': 'No current semester found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def course_offerings(self, request, pk=None):
        """
        Get all course offerings for a semester
        """
        semester = self.get_object()
        from courses.serializers import CourseOfferingSerializer
        course_offerings = semester.course_offerings.all()
        serializer = CourseOfferingSerializer(course_offerings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def enrollments(self, request, pk=None):
        """
        Get enrollment statistics for a semester
        """
        semester = self.get_object()
        from courses.models import Enrollment
        
        total_enrollments = Enrollment.objects.filter(
            course_offering__semester=semester
        ).count()
        
        active_enrollments = Enrollment.objects.filter(
            course_offering__semester=semester,
            status='ENROLLED'
        ).count()
        
        completed_enrollments = Enrollment.objects.filter(
            course_offering__semester=semester,
            status='COMPLETED'
        ).count()
        
        return Response({
            'total_enrollments': total_enrollments,
            'active_enrollments': active_enrollments,
            'completed_enrollments': completed_enrollments,
            'completion_rate': (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
        })

    @action(detail=True, methods=['post'])
    def set_current(self, request, pk=None):
        """
        Set this semester as the current semester
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Only admin users can set current semester'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        semester = self.get_object()
        
        # Set all other semesters to not current
        Semester.objects.filter(is_current=True).update(is_current=False)
        
        # Set this semester as current
        semester.is_current = True
        semester.save()
        
        serializer = SemesterSerializer(semester)
        return Response(serializer.data)
