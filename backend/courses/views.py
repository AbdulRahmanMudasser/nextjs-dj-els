from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Enroll current user in a course
        """
        course = self.get_object()
        # Add enrollment logic here
        return Response({'message': f'Enrolled in {course.title}'})