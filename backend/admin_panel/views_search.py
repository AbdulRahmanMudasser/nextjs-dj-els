from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
import logging

from users.models import UserProfile
from courses.models import Course
from academics.models import Department, Program
from rbac.decorators import require_permissions

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_access_admin_panel'])
def search(request):
    """
    Search across users, courses, departments, and programs
    """
    try:
        query = request.GET.get('q', '').strip()
        if not query:
            return Response([])
        
        results = []
        
        # Search users
        users = User.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(username__icontains=query) |
            Q(email__icontains=query)
        )[:5]
        
        for user in users:
            try:
                profile = user.userprofile
                results.append({
                    'id': str(user.id),
                    'type': 'user',
                    'title': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'description': f"{profile.get_role_display()} - {user.email}",
                    'url': f"/admin/users/{user.id}",
                    'metadata': {
                        'role': profile.role,
                        'email': user.email,
                        'is_active': user.is_active
                    }
                })
            except UserProfile.DoesNotExist:
                results.append({
                    'id': str(user.id),
                    'type': 'user',
                    'title': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'description': f"User - {user.email}",
                    'url': f"/admin/users/{user.id}",
                    'metadata': {
                        'role': 'UNKNOWN',
                        'email': user.email,
                        'is_active': user.is_active
                    }
                })
        
        # Search courses
        courses = Course.objects.filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query)
        )[:5]
        
        for course in courses:
            results.append({
                'id': str(course.id),
                'type': 'course',
                'title': course.name,
                'description': f"{course.code} - {course.description[:100] if course.description else 'No description'}",
                'url': f"/admin/academic/courses/{course.id}",
                'metadata': {
                    'code': course.code,
                    'is_active': course.is_active,
                    'credits': course.credits
                }
            })
        
        # Search departments
        departments = Department.objects.filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query)
        )[:5]
        
        for dept in departments:
            results.append({
                'id': str(dept.id),
                'type': 'department',
                'title': dept.name,
                'description': f"{dept.code} - {dept.description[:100] if dept.description else 'No description'}",
                'url': f"/admin/academic/departments/{dept.id}",
                'metadata': {
                    'code': dept.code,
                    'is_active': dept.is_active
                }
            })
        
        # Search programs
        programs = Program.objects.filter(
            Q(name__icontains=query) |
            Q(code__icontains=query) |
            Q(description__icontains=query)
        )[:5]
        
        for program in programs:
            results.append({
                'id': str(program.id),
                'type': 'program',
                'title': program.name,
                'description': f"{program.code} - {program.description[:100] if program.description else 'No description'}",
                'url': f"/admin/academic/programs/{program.id}",
                'metadata': {
                    'code': program.code,
                    'is_active': program.is_active,
                    'duration_years': program.duration_years
                }
            })
        
        # Sort results by relevance (exact matches first, then partial matches)
        def sort_key(result):
            title_lower = result['title'].lower()
            query_lower = query.lower()
            
            if title_lower == query_lower:
                return 0
            elif title_lower.startswith(query_lower):
                return 1
            elif query_lower in title_lower:
                return 2
            else:
                return 3
        
        results.sort(key=sort_key)
        
        return Response(results[:20])  # Limit to 20 results
        
    except Exception as e:
        logger.error(f"Error performing search: {e}")
        return Response(
            {'error': 'Failed to perform search'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
