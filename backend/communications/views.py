from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import (
    DiscussionForum, DiscussionThread, DiscussionReply,
    Notification, PrivateMessage
)
from .serializers import (
    DiscussionForumSerializer, DiscussionThreadSerializer, DiscussionReplySerializer,
    NotificationSerializer, PrivateMessageSerializer
)


class DiscussionForumViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing discussion forums
    """
    queryset = DiscussionForum.objects.all()
    serializer_class = DiscussionForumSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course_offering', 'is_general', 'is_private']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filter forums based on user access
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        # Filter based on user role and forum access
        if hasattr(user, 'profile'):
            user_role = user.profile.role
            
            # General forums accessible to all
            general_forums = queryset.filter(is_general=True)
            
            # Course-specific forums for enrolled students
            course_forums = queryset.filter(
                is_general=False,
                course_offering__enrollments__student=user,
                course_offering__enrollments__status='ENROLLED'
            )
            
            # Private forums based on allowed roles
            private_forums = queryset.filter(
                is_private=True,
                allowed_roles__contains=[user_role]
            )
            
            queryset = general_forums | course_forums | private_forums
        
        return queryset.distinct()


class DiscussionThreadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing discussion threads
    """
    queryset = DiscussionThread.objects.all()
    serializer_class = DiscussionThreadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['forum', 'author', 'is_pinned', 'is_locked']
    search_fields = ['title', 'content']
    ordering_fields = ['title', 'created_at', 'last_activity']
    ordering = ['-is_pinned', '-last_activity']

    def get_queryset(self):
        """
        Filter threads based on forum access
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        # Get accessible forums for the user
        accessible_forums = DiscussionForumViewSet().get_queryset()
        return queryset.filter(forum__in=accessible_forums)


class DiscussionReplyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing discussion replies
    """
    queryset = DiscussionReply.objects.all()
    serializer_class = DiscussionReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['thread', 'author', 'is_solution']
    search_fields = ['content']
    ordering_fields = ['created_at', 'upvotes']
    ordering = ['created_at']


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'notification_type', 'read']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'read']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filter notifications for current user
        """
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark notification as read
        """
        notification = self.get_object()
        notification.read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response({'message': 'Notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Mark all notifications as read
        """
        updated = Notification.objects.filter(
            recipient=request.user,
            read=False
        ).update(
            read=True,
            read_at=timezone.now()
        )
        return Response({'message': f'{updated} notifications marked as read'})


class PrivateMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing private messages
    """
    queryset = PrivateMessage.objects.all()
    serializer_class = PrivateMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sender', 'recipient', 'is_read', 'parent_message']
    search_fields = ['subject', 'content']
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filter messages for current user
        """
        user = self.request.user
        return PrivateMessage.objects.filter(
            sender=user
        ) | PrivateMessage.objects.filter(
            recipient=user
        )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark message as read
        """
        message = self.get_object()
        if message.recipient == request.user:
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            return Response({'message': 'Message marked as read'})
        return Response(
            {'error': 'You can only mark your own received messages as read'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['post'])
    def delete_for_me(self, request, pk=None):
        """
        Soft delete message for current user
        """
        message = self.get_object()
        user = request.user
        
        if message.sender == user:
            message.is_deleted_by_sender = True
        elif message.recipient == user:
            message.is_deleted_by_recipient = True
        else:
            return Response(
                {'error': 'You can only delete your own messages'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.save()
        return Response({'message': 'Message deleted'})