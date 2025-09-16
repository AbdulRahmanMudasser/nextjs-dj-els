from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Notification
from .serializers import NotificationSerializer
from rbac.decorators import require_permissions

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_access_admin_panel'])
def get_notifications(request):
    """
    Get notifications for the current user
    """
    try:
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        return Response(
            {'error': 'Failed to get notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_access_admin_panel'])
def mark_notification_read(request, notification_id):
    """
    Mark a notification as read
    """
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.is_read = True
        notification.save()
        
        return Response({'success': True})
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        return Response(
            {'error': 'Failed to mark notification as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_access_admin_panel'])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for the current user
    """
    try:
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'success': True})
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        return Response(
            {'error': 'Failed to mark all notifications as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_access_admin_panel'])
def delete_notification(request, notification_id):
    """
    Delete a notification
    """
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.delete()
        
        return Response({'success': True})
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting notification: {e}")
        return Response(
            {'error': 'Failed to delete notification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@require_permissions(['can_send_announcements'])
def create_notification(request):
    """
    Create a new notification
    """
    try:
        data = request.data.copy()
        data['user'] = request.user.id
        data['created_by'] = request.user.id
        
        serializer = NotificationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error creating notification: {e}")
        return Response(
            {'error': 'Failed to create notification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
