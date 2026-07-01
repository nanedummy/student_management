from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import TimetableViewSet, TimetableBulkUploadView, TimetableBulkUploadSampleView

router = DefaultRouter()
router.register('', TimetableViewSet, basename='timetable')

urlpatterns = [
    path('bulk-upload/', TimetableBulkUploadView.as_view(), name='timetable-bulk-upload'),
    path('bulk-upload/sample/', TimetableBulkUploadSampleView.as_view(), name='timetable-bulk-upload-sample'),
] + router.urls
