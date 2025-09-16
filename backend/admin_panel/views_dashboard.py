from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .serializers import (
    DashboardMetricsSerializer, UserAnalyticsSerializer, 
    ActivityLogSerializer
)
from users.models import UserProfile
from courses.models import Course, CourseOffering
from assignments.models import Assignment
from academics.models import Department, Program
from .models import SystemLog
from rbac.decorators import require_permissions

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_access_admin_panel'])
def dashboard_metrics(request):
    """
    Get dashboard metrics for admin panel
    """
    try:
        # User metrics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Users by role
        users_by_role = {}
        for role, _ in UserProfile.ROLE_CHOICES:
            count = UserProfile.objects.filter(role=role).count()
            users_by_role[role] = count
        
        # Recent user registrations
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        new_users_today = User.objects.filter(date_joined__date=today).count()
        new_users_this_week = User.objects.filter(date_joined__date__gte=week_ago).count()
        new_users_this_month = User.objects.filter(date_joined__date__gte=month_ago).count()
        
        # Course metrics
        total_courses = Course.objects.count()
        active_courses = Course.objects.filter(is_active=True).count()
        total_enrollments = CourseOffering.objects.aggregate(
            total=Count('enrollments')
        )['total'] or 0
        active_enrollments = CourseOffering.objects.filter(
            enrollments__status='ENROLLED'
        ).count()
        
        # Assignment metrics
        total_assignments = Assignment.objects.count()
        assignments_due_soon = Assignment.objects.filter(
            due_date__lte=timezone.now() + timedelta(days=7),
            due_date__gte=timezone.now()
        ).count()
        total_submissions = Assignment.objects.aggregate(
            total=Count('submissions')
        )['total'] or 0
        pending_grades = Assignment.objects.filter(
            submissions__grade__isnull=True
        ).count()
        
        # System metrics (mock data for now)
        system_uptime = 99.9
        api_response_time = 45.0
        database_response_time = 12.0
        storage_usage_percentage = 78.0
        
        # Activity metrics
        logins_today = SystemLog.objects.filter(
            category='AUTH',
            message__icontains='login',
            created_at__date=today
        ).count()
        logins_this_week = SystemLog.objects.filter(
            category='AUTH',
            message__icontains='login',
            created_at__date__gte=week_ago
        ).count()
        api_requests_today = SystemLog.objects.filter(
            category='API',
            created_at__date=today
        ).count()
        error_count_today = SystemLog.objects.filter(
            level__in=['ERROR', 'CRITICAL'],
            created_at__date=today
        ).count()
        
        # System health data
        import psutil
        system_health = {
            'status': 'healthy' if error_count_today == 0 else 'warning' if error_count_today < 5 else 'critical',
            'uptime': system_uptime,
            'databaseStatus': 'connected',
            'serverLoad': psutil.cpu_percent(),
            'memoryUsage': psutil.virtual_memory().percent,
            'diskUsage': psutil.disk_usage('/').percent,
            'lastBackup': (timezone.now() - timedelta(hours=6)).isoformat(),
            'activeConnections': 45  # Mock data
        }
        
        # User breakdown
        user_breakdown = {
            'students': users_by_role.get('STUDENT', 0),
            'faculty': users_by_role.get('FACULTY', 0),
            'admins': users_by_role.get('ADMIN', 0),
            'parents': users_by_role.get('PARENT', 0),
            'librarians': users_by_role.get('LIBRARIAN', 0),
            'others': sum(v for k, v in users_by_role.items() if k not in ['STUDENT', 'FACULTY', 'ADMIN', 'PARENT', 'LIBRARIAN'])
        }
        
        # Recent activity (mock data for now)
        recent_activity = [
            {
                'id': '1',
                'type': 'user_registration',
                'title': 'New user registration',
                'description': 'John Doe registered as a student',
                'timestamp': (timezone.now() - timedelta(minutes=5)).isoformat(),
                'user': {
                    'id': '1',
                    'name': 'John Doe',
                    'avatar': None
                }
            },
            {
                'id': '2',
                'type': 'course_creation',
                'title': 'New course created',
                'description': 'Introduction to Computer Science course was created',
                'timestamp': (timezone.now() - timedelta(minutes=15)).isoformat(),
                'user': {
                    'id': '2',
                    'name': 'Dr. Smith',
                    'avatar': None
                }
            }
        ]
        
        # Quick stats
        quick_stats = [
            {
                'id': '1',
                'title': 'New Users Today',
                'value': new_users_today,
                'change': 12,
                'changeType': 'positive',
                'icon': 'Users',
                'description': 'Users registered today'
            },
            {
                'id': '2',
                'title': 'Active Courses',
                'value': active_courses,
                'change': 8,
                'changeType': 'positive',
                'icon': 'BookOpen',
                'description': 'Currently active courses'
            },
            {
                'id': '3',
                'title': 'Pending Grades',
                'value': pending_grades,
                'change': -5,
                'changeType': 'negative',
                'icon': 'AlertTriangle',
                'description': 'Assignments awaiting grading'
            }
        ]
        
        metrics_data = {
            'totalUsers': total_users,
            'activeUsers': active_users,
            'totalCourses': total_courses,
            'activeCourses': active_courses,
            'totalDepartments': Department.objects.count(),
            'totalPrograms': Program.objects.count(),
            'totalEnrollments': total_enrollments,
            'pendingApprovals': assignments_due_soon + pending_grades,
            'systemHealth': system_health,
            'userBreakdown': user_breakdown,
            'recentActivity': recent_activity,
            'quickStats': quick_stats
        }
        
        serializer = DashboardMetricsSerializer(metrics_data)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting dashboard metrics: {e}")
        return Response(
            {'error': 'Failed to get dashboard metrics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_generate_reports'])
def user_analytics(request):
    """
    Get user analytics data
    """
    try:
        # User growth over time (last 12 months)
        user_growth_data = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            count = User.objects.filter(
                date_joined__gte=month_start,
                date_joined__lt=month_end
            ).count()
            user_growth_data.append({
                'month': month_start.strftime('%Y-%m'),
                'users': count
            })
        
        # Role distribution
        role_distribution = []
        for role, role_name in UserProfile.ROLE_CHOICES:
            count = UserProfile.objects.filter(role=role).count()
            percentage = (count / User.objects.count() * 100) if User.objects.count() > 0 else 0
            role_distribution.append({
                'role': role,
                'role_name': role_name,
                'count': count,
                'percentage': round(percentage, 1)
            })
        
        # User activity status
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        user_activity_status = {
            'active': active_users,
            'inactive': inactive_users
        }
        
        # Login patterns (mock data for now)
        login_patterns = {
            'daily_average': 150,
            'peak_hour': '10:00 AM',
            'weekend_vs_weekday': {
                'weekday': 200,
                'weekend': 80
            }
        }
        
        analytics_data = {
            'user_growth_data': user_growth_data,
            'role_distribution': role_distribution,
            'user_activity_status': user_activity_status,
            'login_patterns': login_patterns,
            'geographic_distribution': {}  # Would be implemented with IP geolocation
        }
        
        serializer = UserAnalyticsSerializer(analytics_data)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting user analytics: {e}")
        return Response(
            {'error': 'Failed to get user analytics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_generate_reports'])
def activity_logs(request):
    """
    Get recent activity logs
    """
    try:
        # Get recent system logs and convert to activity format
        recent_logs = SystemLog.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-created_at')[:50]
        
        activities = []
        for log in recent_logs:
            # Convert log to activity format
            activity_type = log.category.lower()
            if 'login' in log.message.lower():
                activity_type = 'user_login'
            elif 'register' in log.message.lower():
                activity_type = 'user_registration'
            elif 'create' in log.message.lower():
                activity_type = 'course_created'
            elif 'submit' in log.message.lower():
                activity_type = 'assignment_submitted'
            elif 'message' in log.message.lower():
                activity_type = 'message_sent'
            elif log.level in ['ERROR', 'CRITICAL']:
                activity_type = 'system_alert'
            
            activities.append({
                'id': log.id,
                'type': activity_type,
                'title': log.message[:50] + '...' if len(log.message) > 50 else log.message,
                'description': log.message,
                'timestamp': log.created_at,
                'user_name': log.user.get_full_name() if log.user else 'System',
                'user_id': log.user.id if log.user else None,
                'category': log.category,
                'severity': log.level
            })
        
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting activity logs: {e}")
        return Response(
            {'error': 'Failed to get activity logs'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
