from django.apps import AppConfig


class RbacConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rbac'
    verbose_name = 'Role-Based Access Control'
    
    def ready(self):
        """
        Import signal handlers when the app is ready
        """
        try:
            import rbac.signals
        except ImportError:
            pass