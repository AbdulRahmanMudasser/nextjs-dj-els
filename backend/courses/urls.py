from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'course-offerings', views.CourseOfferingViewSet)
router.register(r'enrollments', views.EnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
