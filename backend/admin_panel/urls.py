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
from .views_reports import standard_reports_data, standard_reports_list, custom_reports_list, analytics_data
from .views_system import system_settings, system_metrics, system_alerts, system_logs, backup_status
from .views_communications import announcements_list, create_announcement, email_templates_list, email_history_list
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
    
    # Reports endpoints
    path('reports/standard/data/', standard_reports_data, name='standard-reports-data'),
    path('reports/standard/list/', standard_reports_list, name='standard-reports-list'),
    path('reports/custom/', custom_reports_list, name='custom-reports-list'),
    path('reports/analytics/', analytics_data, name='analytics-data'),
    
    # System endpoints
    path('system/settings/', system_settings, name='system-settings'),
    path('system/monitoring/metrics/', system_metrics, name='system-metrics'),
    path('system/monitoring/alerts/', system_alerts, name='system-alerts'),
    path('system/logs/', system_logs, name='system-logs'),
    path('system/backups/', backup_status, name='backup-status'),
    
    # Communications endpoints
    path('communications/announcements/', announcements_list, name='announcements-list'),
    path('communications/announcements/create/', create_announcement, name='create-announcement'),
    path('communications/templates/', email_templates_list, name='email-templates-list'),
    path('communications/email-history/', email_history_list, name='email-history-list'),
]
