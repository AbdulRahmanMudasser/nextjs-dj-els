"""
Views for System module
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import psutil
import os
from django.utils import timezone


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_settings(request):
    """Get system settings"""
    try:
        settings_data = {
            'general': {
                'siteName': 'LMS Admin Panel',
                'siteDescription': 'Learning Management System Administration',
                'timezone': 'UTC',
                'language': 'en',
                'maintenanceMode': False
            },
            'email': {
                'smtpHost': 'smtp.gmail.com',
                'smtpPort': 587,
                'smtpUsername': '',
                'smtpPassword': '',
                'smtpUseTls': True,
                'fromEmail': 'noreply@lms.com',
                'fromName': 'LMS System'
            },
            'security': {
                'sessionTimeout': 30,
                'maxLoginAttempts': 5,
                'passwordMinLength': 8,
                'requireTwoFactor': False,
                'allowedFileTypes': ['pdf', 'doc', 'docx', 'jpg', 'png'],
                'maxFileSize': 10
            },
            'database': {
                'backupFrequency': 'daily',
                'backupRetention': 30,
                'autoOptimize': True,
                'queryTimeout': 30
            }
        }
        
        return Response(settings_data)
    except Exception as e:
        return Response(
            {'error': f'Error getting system settings: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_metrics(request):
    """Get real-time system metrics"""
    try:
        # Get CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        cpu_cores = psutil.cpu_count()
        
        # Get memory usage
        memory = psutil.virtual_memory()
        
        # Get disk usage
        disk = psutil.disk_usage('/')
        
        # Get network stats
        network = psutil.net_io_counters()
        
        # Get system uptime
        boot_time = psutil.boot_time()
        uptime = timezone.now().timestamp() - boot_time
        
        metrics = {
            'cpu': {
                'usage': cpu_usage,
                'cores': cpu_cores,
                'temperature': 45
            },
            'memory': {
                'total': memory.total,
                'used': memory.used,
                'available': memory.available,
                'percentage': memory.percent
            },
            'disk': {
                'total': disk.total,
                'used': disk.used,
                'available': disk.free,
                'percentage': (disk.used / disk.total) * 100
            },
            'network': {
                'bytesIn': network.bytes_recv,
                'bytesOut': network.bytes_sent,
                'packetsIn': network.packets_recv,
                'packetsOut': network.packets_sent
            },
            'database': {
                'connections': 15,
                'maxConnections': 100,
                'queries': 45,
                'slowQueries': 2
            },
            'uptime': uptime,
            'loadAverage': [0.5, 0.8, 1.2]
        }
        
        return Response(metrics)
    except Exception as e:
        return Response(
            {'error': f'Error getting system metrics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )