from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomRole(models.Model):
    """Admin-defined roles with a custom name and permission set."""
    name        = models.CharField(max_length=100, unique=True)
    permissions = models.JSONField(default=list, blank=True)  # list of permission keys
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin',          'Super Admin'),
        ('admin',                'Admin'),
        ('student',              'Student'),
        ('faculty',              'Faculty'),
        ('hr',                   'HR'),
        ('accountant',           'Accountant'),
        ('librarian',            'Librarian'),
        ('hostel_warden',        'Hostel Warden'),
        ('placement_officer',    'Placement Officer'),
        ('transport_incharge',   'Transport Incharge'),
        ('alumni_coordinator',   'Alumni Coordinator'),
        ('parent',               'Parent'),
        ('custom',               'Custom'),
    )

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='admin')
    custom_role = models.ForeignKey(
        CustomRole, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='users'
    )
    linked_student = models.ForeignKey(
        'students.Student', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='parent_accounts'
    )
    # Granular feature-level permissions set by admin
    custom_permissions = models.JSONField(default=list, blank=True)
    # Extra profile info for non-faculty users created directly
    full_name  = models.CharField(max_length=200, blank=True)
    phone      = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)

    APPROVAL_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='approved')


class StudentLinkRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='link_requests')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='link_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.parent.username} -> {self.student.first_name} ({self.status})"
