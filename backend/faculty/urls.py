from django.urls import path
from .views import FacultyListCreateView, FacultyDetailView, FacultyBulkUploadView, FacultyBulkUploadSampleView

urlpatterns = [
    path('bulk-upload/', FacultyBulkUploadView.as_view(), name='faculty-bulk-upload'),
    path('bulk-upload/sample/', FacultyBulkUploadSampleView.as_view(), name='faculty-bulk-upload-sample'),
    path('', FacultyListCreateView.as_view()),
    path('<int:pk>/', FacultyDetailView.as_view()),
]
