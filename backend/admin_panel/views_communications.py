"""
Views for Communications module
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def announcements_list(request):
    """Get list of announcements"""
    try:
        # Mock announcements data - in real implementation, this would come from database
        announcements = [
            {
                'id': 1,
                'title': 'System Maintenance Notice',
                'content': 'The system will be under maintenance on Sunday from 2 AM to 4 AM.',
                'type': 'warning',
                'priority': 'high',
                'targetAudience': ['all_users'],
                'scheduledFor': None,
                'status': 'sent',
                'sentAt': '2024-01-15T10:00:00Z',
                'createdBy': 'admin',
                'createdAt': '2024-01-15T09:30:00Z',
                'readCount': 1247,
                'totalRecipients': 1500
            },
            {
                'id': 2,
                'title': 'New Course Available',
                'content': 'Introduction to Machine Learning course is now available for enrollment.',
                'type': 'info',
                'priority': 'medium',
                'targetAudience': ['students'],
                'scheduledFor': None,
                'status': 'sent',
                'sentAt': '2024-01-14T14:00:00Z',
                'createdBy': 'admin',
                'createdAt': '2024-01-14T13:30:00Z',
                'readCount': 856,
                'totalRecipients': 1200
            }
        ]
        
        return Response(announcements)
    except Exception as e:
        return Response(
            {'error': f'Error getting announcements: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_announcement(request):
    """Create a new announcement"""
    try:
        # In real implementation, this would save to database
        announcement_data = request.data
        
        # Mock response
        new_announcement = {
            'id': 3,
            'title': announcement_data.get('title', ''),
            'content': announcement_data.get('content', ''),
            'type': announcement_data.get('type', 'info'),
            'priority': announcement_data.get('priority', 'medium'),
            'targetAudience': announcement_data.get('targetAudience', []),
            'scheduledFor': announcement_data.get('scheduledFor'),
            'status': 'draft',
            'sentAt': None,
            'createdBy': request.user.username,
            'createdAt': timezone.now().isoformat(),
            'readCount': 0,
            'totalRecipients': 0
        }
        
        return Response(new_announcement, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': f'Error creating announcement: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_templates_list(request):
    """Get list of email templates"""
    try:
        # Mock templates data
        templates = [
            {
                'id': 1,
                'name': 'Welcome Email',
                'subject': 'Welcome to LMS',
                'content': 'Welcome {{user_name}} to our Learning Management System!',
                'type': 'welcome',
                'variables': ['user_name', 'login_url'],
                'createdAt': '2024-01-01T00:00:00Z',
                'updatedAt': '2024-01-15T10:00:00Z'
            },
            {
                'id': 2,
                'name': 'Password Reset',
                'subject': 'Reset Your Password',
                'content': 'Click here to reset your password: {{reset_url}}',
                'type': 'password_reset',
                'variables': ['reset_url', 'user_name'],
                'createdAt': '2024-01-01T00:00:00Z',
                'updatedAt': '2024-01-10T15:30:00Z'
            }
        ]
        
        return Response(templates)
    except Exception as e:
        return Response(
            {'error': f'Error getting email templates: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_history_list(request):
    """Get email history"""
    try:
        # Mock email history data
        emails = [
            {
                'id': 1,
                'to': 'user@example.com',
                'subject': 'Welcome to LMS',
                'status': 'delivered',
                'sentAt': '2024-01-15T10:00:00Z',
                'openedAt': '2024-01-15T10:15:00Z',
                'template': 'Welcome Email'
            },
            {
                'id': 2,
                'to': 'student@example.com',
                'subject': 'Course Enrollment Confirmation',
                'status': 'delivered',
                'sentAt': '2024-01-15T09:30:00Z',
                'openedAt': None,
                'template': 'Enrollment Confirmation'
            }
        ]
        
        return Response(emails)
    except Exception as e:
        return Response(
            {'error': f'Error getting email history: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


