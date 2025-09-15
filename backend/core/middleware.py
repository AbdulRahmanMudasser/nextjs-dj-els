"""
Custom middleware for the LMS application
"""
import time
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings


class RateLimitMiddleware:
    """
    Rate limiting middleware to prevent abuse
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip rate limiting for certain paths
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return self.get_response(request)

        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Rate limit: 100 requests per minute per IP
        rate_limit_key = f"rate_limit_{client_ip}"
        current_time = time.time()
        
        # Get current request count
        request_count = cache.get(rate_limit_key, 0)
        
        if request_count >= 100:  # 100 requests per minute
            return JsonResponse({
                'error': 'Rate limit exceeded. Please try again later.'
            }, status=429)
        
        # Increment request count
        cache.set(rate_limit_key, request_count + 1, 60)  # 60 seconds
        
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        """Get the client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityHeadersMiddleware:
    """
    Add security headers to all responses
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Add HSTS header for HTTPS
        if not settings.DEBUG and request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        return response


class RequestLoggingMiddleware:
    """
    Log API requests for monitoring and debugging
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log API requests
        if request.path.startswith('/api/'):
            import logging
            logger = logging.getLogger('api_requests')
            logger.info(f"{request.method} {request.path} - IP: {self.get_client_ip(request)}")
        
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        """Get the client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
