from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_system import (
    SystemSettingsViewSet, SystemLogViewSet, SystemBackupViewSet,
    SystemAnnouncementViewSet, EmailTemplateViewSet
)
from .views_dashboard import dashboard_metrics, user_analytics, activity_logs
from .views_users import AdminUserViewSet
from .views_notifications import (
    get_notifications, mark_notification_read, mark_all_notifications_read,
    delete_notification, create_notification
)
from .views_search import search
from rbac.views import RoleViewSet, PermissionViewSet

router = DefaultRouter()
router.register(r'settings', SystemSettingsViewSet)
router.register(r'logs', SystemLogViewSet)
router.register(r'backups', SystemBackupViewSet)
router.register(r'announcements', SystemAnnouncementViewSet)
router.register(r'email-templates', EmailTemplateViewSet)
router.register(r'users', AdminUserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'permissions', PermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('dashboard/', dashboard_metrics, name='dashboard_metrics'),
    path('analytics/users/', user_analytics, name='user_analytics'),
    path('activity-logs/', activity_logs, name='activity_logs'),
    
    # Notifications
    path('notifications/', get_notifications, name='admin-notifications'),
    path('notifications/<int:notification_id>/mark-read/', mark_notification_read, name='admin-mark-notification-read'),
    path('notifications/mark-all-read/', mark_all_notifications_read, name='admin-mark-all-notifications-read'),
    path('notifications/<int:notification_id>/', delete_notification, name='admin-delete-notification'),
    path('notifications/create/', create_notification, name='admin-create-notification'),
    
    # Search
    path('search/', search, name='admin-search'),
]
