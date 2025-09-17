"""
Views for Reports module
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json

from users.models import UserProfile
from academics.models import Department, Program, Course
from courses.models import Enrollment
from admin_panel.models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def standard_reports_data(request):
    """Get data for standard reports dashboard"""
    try:
        # Calculate metrics
        total_users = UserProfile.objects.count()
        active_users = UserProfile.objects.filter(user__is_active=True).count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        
        # Calculate growth rate (mock data for now)
        growth_rate = 12.5
        
        # Mock revenue data
        revenue = 45230
        
        data = {
            'totalUsers': total_users,
            'activeUsers': active_users,
            'totalCourses': total_courses,
            'totalEnrollments': total_enrollments,
            'revenue': revenue,
            'growthRate': growth_rate
        }
        
        return Response(data)
    except Exception as e:
        return Response(
            {'error': f'Error getting reports data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def standard_reports_list(request):
    """Get list of available standard reports"""
    try:
        reports = [
            {
                'id': 1,
                'name': 'User Activity Report',
                'description': 'Comprehensive overview of user activities and engagement',
                'category': 'Users',
                'icon': 'Users',
                'lastGenerated': '2024-01-15',
                'frequency': 'Weekly',
                'status': 'available',
                'parameters': ['Date Range', 'User Type', 'Activity Type']
            },
            {
                'id': 2,
                'name': 'Course Enrollment Report',
                'description': 'Detailed analysis of course enrollments and trends',
                'category': 'Academic',
                'icon': 'BookOpen',
                'lastGenerated': '2024-01-14',
                'frequency': 'Monthly',
                'status': 'available',
                'parameters': ['Semester', 'Department', 'Program']
            },
            {
                'id': 3,
                'name': 'System Performance Report',
                'description': 'System metrics, performance indicators, and health status',
                'category': 'System',
                'icon': 'TrendingUp',
                'lastGenerated': '2024-01-13',
                'frequency': 'Daily',
                'status': 'available',
                'parameters': ['Time Period', 'Metrics', 'Thresholds']
            },
            {
                'id': 4,
                'name': 'Financial Summary Report',
                'description': 'Revenue, expenses, and financial performance analysis',
                'category': 'Financial',
                'icon': 'DollarSign',
                'lastGenerated': '2024-01-12',
                'frequency': 'Monthly',
                'status': 'available',
                'parameters': ['Period', 'Revenue Type', 'Expense Category']
            }
        ]
        
        return Response(reports)
    except Exception as e:
        return Response(
            {'error': f'Error getting reports list: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def custom_reports_list(request):
    """Get list of custom reports"""
    try:
        # Mock data for now - in real implementation, this would come from database
        reports = [
            {
                'id': 1,
                'name': 'Custom User Analytics',
                'description': 'Custom report for user behavior analysis',
                'query': 'SELECT * FROM users WHERE created_at > NOW() - INTERVAL 30 DAY',
                'parameters': [],
                'schedule': 'weekly',
                'isActive': True,
                'lastRun': '2024-01-15',
                'nextRun': '2024-01-22',
                'createdBy': request.user.username,
                'createdAt': '2024-01-01',
                'format': 'pdf'
            }
        ]
        
        return Response(reports)
    except Exception as e:
        return Response(
            {'error': f'Error getting custom reports: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_data(request):
    """Get analytics data for dashboard"""
    try:
        # Mock analytics data
        data = {
            'userGrowth': {
                'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'data': [120, 150, 180, 220, 280, 320]
            },
            'courseEnrollment': {
                'labels': ['CS101', 'MATH201', 'ENG301', 'PHYS401'],
                'data': [245, 189, 167, 143]
            },
            'revenue': {
                'labels': ['Q1', 'Q2', 'Q3', 'Q4'],
                'data': [12000, 15000, 18000, 22000]
            },
            'systemPerformance': {
                'cpu': 45,
                'memory': 67,
                'disk': 23,
                'uptime': 99.9
            },
            'topCourses': [
                {'name': 'Introduction to Computer Science', 'enrollments': 245, 'revenue': 12250},
                {'name': 'Data Structures and Algorithms', 'enrollments': 189, 'revenue': 9450},
                {'name': 'Web Development Fundamentals', 'enrollments': 167, 'revenue': 8350}
            ],
            'userActivity': [
                {'date': '2024-01-15', 'activeUsers': 1247, 'newUsers': 23, 'sessions': 3456},
                {'date': '2024-01-14', 'activeUsers': 1189, 'newUsers': 18, 'sessions': 3123},
                {'date': '2024-01-13', 'activeUsers': 1156, 'newUsers': 31, 'sessions': 2987}
            ]
        }
        
        return Response(data)
    except Exception as e:
        return Response(
            {'error': f'Error getting analytics data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


