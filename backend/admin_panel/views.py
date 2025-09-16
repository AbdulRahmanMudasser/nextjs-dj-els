from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count, Q, Avg, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import SystemSettings, SystemLog, SystemBackup, SystemAnnouncement, EmailTemplate
from .serializers import (
    SystemSettingsSerializer, SystemLogSerializer, SystemBackupSerializer,
    SystemAnnouncementSerializer, EmailTemplateSerializer, DashboardMetricsSerializer,
    UserAnalyticsSerializer, AcademicAnalyticsSerializer, SystemAnalyticsSerializer,
    ActivityLogSerializer, BulkUserImportSerializer, BulkUserImportResultSerializer
)
from users.models import UserProfile
from courses.models import Course, CourseOffering
from assignments.models import Assignment
from communications.models import Notification
from rbac.decorators import require_permissions
from rbac.permission_manager import PermissionManager

logger = logging.getLogger(__name__)