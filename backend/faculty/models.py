from django.db import models


class Faculty(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100)
    qualification = models.CharField(max_length=100, blank=True)
    experience = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Faculty)
def sync_faculty_to_user(sender, instance, created, **kwargs):
    """Ensure the associated User account stays in sync with the Faculty's department and name."""
    from accounts.models import User
    try:
        user = User.objects.get(email=instance.email)
        changed = False
        if user.department != instance.department:
            user.department = instance.department
            changed = True
        
        full_name = f"{instance.first_name} {instance.last_name}"
        if user.full_name != full_name:
            user.full_name = full_name
            changed = True
            
        if user.phone != instance.phone:
            user.phone = instance.phone
            changed = True
            
        if changed:
            user.save(update_fields=['department', 'full_name', 'phone'])
    except User.DoesNotExist:
        if created and instance.email:
            username = instance.email.split('@')[0] if instance.email else instance.first_name.lower()
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username,
                    email=instance.email,
                    password='password123',
                    role='faculty',
                    approval_status='approved',
                    full_name=f"{instance.first_name} {instance.last_name}",
                    department=instance.department,
                    phone=instance.phone
                )

@receiver(post_save, sender=Faculty)
def sync_faculty_to_employee(sender, instance, created, **kwargs):
    """Ensure the Faculty member has a linked Employee record for HR & Payroll."""
    from hr.models import Employee, PayrollConfig
    from departments.models import Department
    import datetime

    if created:
        dept_name = instance.department or 'General'
        try:
            dept_obj = Department.objects.get(name=dept_name)
        except Department.DoesNotExist:
            import random
            code = dept_name[:3].upper()
            if Department.objects.filter(code=code).exists():
                code = f"{code}{random.randint(10, 99)}"
            dept_obj = Department.objects.create(name=dept_name, code=code)
        
        emp_id = f"EMP-F{instance.id:04d}"
        
        emp, emp_created = Employee.objects.get_or_create(
            email=instance.email,
            defaults={
                'employee_id': emp_id,
                'first_name': instance.first_name,
                'last_name': instance.last_name,
                'phone': instance.phone,
                'department': dept_obj,
                'designation': instance.designation,
                'employment_type': 'full_time',
                'date_of_joining': datetime.date.today(),
                'basic_salary': 50000 + (instance.experience * 2000),
                'status': 'active',
                'faculty': instance
            }
        )
        
        if emp_created:
            PayrollConfig.objects.create(employee=emp)
        elif not emp.faculty:
            emp.faculty = instance
            emp.save(update_fields=['faculty'])
