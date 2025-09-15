from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'assignments', views.AssignmentViewSet)
router.register(r'submissions', views.SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
