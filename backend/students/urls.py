from django.urls import path
from .views import StudentListCreateView, StudentDetailView, StudentBulkUploadView, StudentBulkUploadSampleView

urlpatterns = [
    path('', StudentListCreateView.as_view()),
    path('bulk-upload/', StudentBulkUploadView.as_view()),
    path('bulk-upload/sample/', StudentBulkUploadSampleView.as_view()),
    path('<int:pk>/', StudentDetailView.as_view()),
]
