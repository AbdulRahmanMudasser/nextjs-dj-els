from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import SystemSettings, SystemLog, SystemBackup, SystemAnnouncement, EmailTemplate
from .serializers import (
    SystemSettingsSerializer, SystemLogSerializer, SystemBackupSerializer,
    SystemAnnouncementSerializer, EmailTemplateSerializer
)
from rbac.decorators import require_permissions

logger = logging.getLogger(__name__)


class SystemSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system settings
    """
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'is_public']
    search_fields = ['key', 'description']
    ordering_fields = ['key', 'category', 'updated_at']
    ordering = ['category', 'key']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_modify_system_settings'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get settings grouped by category"""
        categories = {}
        for setting in self.get_queryset():
            if setting.category not in categories:
                categories[setting.category] = []
            categories[setting.category].append(SystemSettingsSerializer(setting).data)
        return Response(categories)


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing system logs
    """
    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['level', 'category', 'user']
    search_fields = ['message']
    ordering_fields = ['created_at', 'level']
    ordering = ['-created_at']
    
    def get_permissions(self):
        permission_classes = [permissions.IsAuthenticated]
        return [require_permissions(['can_view_system_logs'])(permission()) for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def recent_errors(self, request):
        """Get recent error logs"""
        errors = self.get_queryset().filter(
            level__in=['ERROR', 'CRITICAL']
        )[:50]
        serializer = self.get_serializer(errors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_level(self, request):
        """Get logs grouped by level"""
        levels = {}
        for log in self.get_queryset()[:1000]:  # Limit for performance
            if log.level not in levels:
                levels[log.level] = []
            levels[log.level].append(SystemLogSerializer(log).data)
        return Response(levels)


class SystemBackupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system backups
    """
    queryset = SystemBackup.objects.all()
    serializer_class = SystemBackupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['backup_type', 'status']
    search_fields = ['name']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_modify_system_settings'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start_backup(self, request, pk=None):
        """Start a backup process"""
        backup = self.get_object()
        if backup.status != 'PENDING':
            return Response({'error': 'Backup is not in pending status'}, status=400)
        
        # Here you would implement the actual backup logic
        backup.status = 'RUNNING'
        backup.started_at = timezone.now()
        backup.save()
        
        # Log the backup start
        SystemLog.objects.create(
            level='INFO',
            category='SYSTEM',
            message=f'Backup started: {backup.name}',
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            request_path=request.path,
            request_method=request.method
        )
        
        return Response({'message': 'Backup started successfully'})


class SystemAnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system announcements
    """
    queryset = SystemAnnouncement.objects.all()
    serializer_class = SystemAnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['priority', 'is_active']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_send_announcements'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send_announcement(self, request, pk=None):
        """Send an announcement to target users"""
        announcement = self.get_object()
        
        # Here you would implement the actual sending logic
        # For now, just mark as sent and log it
        
        SystemLog.objects.create(
            level='INFO',
            category='SYSTEM',
            message=f'Announcement sent: {announcement.title}',
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            request_path=request.path,
            request_method=request.method
        )
        
        return Response({'message': 'Announcement sent successfully'})


class EmailTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing email templates
    """
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['template_type', 'is_active']
    search_fields = ['name', 'subject']
    ordering_fields = ['name', 'template_type', 'updated_at']
    ordering = ['template_type', 'name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            return [require_permissions(['can_send_announcements'])(permission()) for permission in permission_classes]
        return [permission() for permission in self.permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
