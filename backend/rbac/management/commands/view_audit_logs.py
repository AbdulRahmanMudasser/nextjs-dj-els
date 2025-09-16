from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from rbac.models import PermissionAudit


class Command(BaseCommand):
    help = 'View permission audit logs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=str,
            help='Filter by username',
        )
        parser.add_argument(
            '--permission',
            type=str,
            help='Filter by permission',
        )
        parser.add_argument(
            '--result',
            type=str,
            choices=['GRANTED', 'DENIED', 'ERROR'],
            help='Filter by result',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to look back (default: 7)',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=50,
            help='Maximum number of logs to show (default: 50)',
        )

    def handle(self, *args, **options):
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=options['days'])
        
        # Build queryset
        queryset = PermissionAudit.objects.filter(
            timestamp__range=[start_date, end_date]
        ).order_by('-timestamp')
        
        # Apply filters
        if options['user']:
            queryset = queryset.filter(user__username__icontains=options['user'])
        
        if options['permission']:
            queryset = queryset.filter(permission__icontains=options['permission'])
        
        if options['result']:
            queryset = queryset.filter(result=options['result'])
        
        # Limit results
        queryset = queryset[:options['limit']]
        
        # Display results
        self.stdout.write(
            self.style.SUCCESS(f'Permission Audit Logs (Last {options["days"]} days)')
        )
        self.stdout.write('=' * 80)
        
        if not queryset.exists():
            self.stdout.write(self.style.WARNING('No audit logs found for the specified criteria.'))
            return
        
        for audit in queryset:
            user_info = audit.user.username if audit.user else 'Anonymous'
            timestamp = audit.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            
            result_color = {
                'GRANTED': self.style.SUCCESS,
                'DENIED': self.style.ERROR,
                'ERROR': self.style.WARNING,
            }.get(audit.result, self.style.NORMAL)
            
            self.stdout.write(
                f'{timestamp} | {user_info} | {audit.permission} | '
                f'{result_color(audit.result)} | {audit.action}'
            )
            
            if audit.resource_type and audit.resource_id:
                self.stdout.write(f'  Resource: {audit.resource_type} #{audit.resource_id}')
            
            if audit.ip_address:
                self.stdout.write(f'  IP: {audit.ip_address}')
        
        # Show summary
        total_logs = PermissionAudit.objects.filter(
            timestamp__range=[start_date, end_date]
        ).count()
        
        granted_count = PermissionAudit.objects.filter(
            timestamp__range=[start_date, end_date],
            result='GRANTED'
        ).count()
        
        denied_count = PermissionAudit.objects.filter(
            timestamp__range=[start_date, end_date],
            result='DENIED'
        ).count()
        
        error_count = PermissionAudit.objects.filter(
            timestamp__range=[start_date, end_date],
            result='ERROR'
        ).count()
        
        self.stdout.write('=' * 80)
        self.stdout.write(f'Summary: {total_logs} total logs')
        self.stdout.write(f'  Granted: {granted_count}')
        self.stdout.write(f'  Denied: {denied_count}')
        self.stdout.write(f'  Errors: {error_count}')
