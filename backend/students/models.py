from django.db import models


class Student(models.Model):
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]
    RESIDENCE_CHOICES = [('day_scholar', 'Day Scholar'), ('hosteler', 'Hosteler')]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    residence_type = models.CharField(max_length=20, choices=RESIDENCE_CHOICES, default='day_scholar')
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    course = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True)
    year = models.PositiveIntegerField(default=1)
    roll_number = models.CharField(max_length=50, unique=True, default='')
    register_number = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='students/', null=True, blank=True)
    
    # Extra Personal Details
    community = models.CharField(max_length=100, blank=True, default='')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    religion = models.CharField(max_length=50, blank=True, default='')
    aadhar_id = models.CharField(max_length=50, blank=True, default='')
    
    # Bank Details
    bank_account_holder_name = models.CharField(max_length=100, blank=True, default='')
    bank_account_number = models.CharField(max_length=50, blank=True, default='')
    bank_name = models.CharField(max_length=100, blank=True, default='')
    bank_branch_name = models.CharField(max_length=100, blank=True, default='')
    bank_ifsc_code = models.CharField(max_length=20, blank=True, default='')
    bank_account_type = models.CharField(max_length=50, blank=True, default='')

    caste = models.CharField(max_length=50, blank=True, default='')
    board_curriculum = models.CharField(max_length=50, blank=True, default='')
    nationality = models.CharField(max_length=50, blank=True, default='')
    mother_tongue = models.CharField(max_length=50, blank=True, default='')
    identification_mark = models.CharField(max_length=200, blank=True, default='')

    # Documents
    marksheet_10th = models.FileField(upload_to='students/marksheets/', null=True, blank=True)
    marksheet_12th = models.FileField(upload_to='students/marksheets/', null=True, blank=True)

    # Parents Details
    father_name = models.CharField(max_length=100, blank=True, default='')
    father_occupation = models.CharField(max_length=100, blank=True, default='')
    father_annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    mother_name = models.CharField(max_length=100, blank=True, default='')
    mother_occupation = models.CharField(max_length=100, blank=True, default='')
    mother_annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Guardian Details
    has_guardian = models.BooleanField(default=False)
    guardian_name = models.CharField(max_length=100, blank=True, default='')
    guardian_number = models.CharField(max_length=20, blank=True, default='')
    guardian_relationship = models.CharField(max_length=50, blank=True, default='')
    guardian_occupation = models.CharField(max_length=100, blank=True, default='')
    guardian_annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Keep register_number in sync with roll_number if not set
        if not self.register_number:
            self.register_number = self.roll_number
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Student)
def create_user_for_student(sender, instance, created, **kwargs):
    if created and instance.email:
        from accounts.models import User
        username = instance.email.split('@')[0] if instance.email else instance.register_number
        if not User.objects.filter(username=username).exists() and not User.objects.filter(email=instance.email).exists():
            User.objects.create_user(
                username=username,
                email=instance.email,
                password='password123',
                role='student',
                linked_student=instance,
                approval_status='approved'
            )
