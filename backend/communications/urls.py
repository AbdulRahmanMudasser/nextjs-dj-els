from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'forums', views.DiscussionForumViewSet)
router.register(r'threads', views.DiscussionThreadViewSet)
router.register(r'replies', views.DiscussionReplyViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'messages', views.PrivateMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
