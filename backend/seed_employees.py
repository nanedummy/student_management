import os
import django
import random
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from hr.models import Employee, PayrollConfig, Payroll
from faculty.models import Faculty
from departments.models import Department

def seed_employees():
    print("Seeding Employees...")

    # Create Administrative Departments
    admin_dept, _ = Department.objects.get_or_create(name='Administration', defaults={'code': 'ADM'})
    hr_dept, _ = Department.objects.get_or_create(name='Human Resources', defaults={'code': 'HR'})
    finance_dept, _ = Department.objects.get_or_create(name='Finance', defaults={'code': 'FIN'})

    non_teaching_staff = [
        ('John', 'Doe', 'john.admin@collegems.com', admin_dept, 'Registrar', 80000),
        ('Jane', 'Smith', 'jane.hr@collegems.com', hr_dept, 'HR Manager', 60000),
        ('Robert', 'Johnson', 'robert.finance@collegems.com', finance_dept, 'Chief Accountant', 75000),
        ('Emily', 'Davis', 'emily.hr@collegems.com', hr_dept, 'HR Executive', 45000),
        ('Michael', 'Wilson', 'michael.finance@collegems.com', finance_dept, 'Accountant', 50000),
        ('Sarah', 'Taylor', 'sarah.admin@collegems.com', admin_dept, 'Clerk', 35000),
    ]

    for i, (fname, lname, email, dept, desig, salary) in enumerate(non_teaching_staff):
        emp_id = f"EMP-S{i+1:04d}"
        emp, created = Employee.objects.get_or_create(
            email=email,
            defaults={
                'employee_id': emp_id,
                'first_name': fname,
                'last_name': lname,
                'phone': f"98765432{i:02d}",
                'department': dept,
                'designation': desig,
                'employment_type': 'full_time',
                'date_of_joining': datetime.date(2022, 1, 15),
                'basic_salary': salary,
                'status': 'active',
            }
        )
        if created:
            PayrollConfig.objects.create(employee=emp)

    # Sync existing faculty
    print("Syncing existing Faculty to Employee records...")
    for faculty in Faculty.objects.all():
        dept_name = faculty.department or 'General'
        try:
            dept_obj = Department.objects.get(name=dept_name)
        except Department.DoesNotExist:
            code = dept_name[:3].upper()
            if Department.objects.filter(code=code).exists():
                code = f"{code}{random.randint(10, 99)}"
            dept_obj = Department.objects.create(name=dept_name, code=code)
        
        emp_id = f"EMP-F{faculty.id:04d}"
        
        emp, created = Employee.objects.get_or_create(
            email=faculty.email,
            defaults={
                'employee_id': emp_id,
                'first_name': faculty.first_name,
                'last_name': faculty.last_name,
                'phone': faculty.phone,
                'department': dept_obj,
                'designation': faculty.designation,
                'employment_type': 'full_time',
                'date_of_joining': datetime.date(2023, 8, 1),
                'basic_salary': 55000 + (faculty.experience * 2000),
                'status': 'active',
                'faculty': faculty
            }
        )
        if created:
            PayrollConfig.objects.create(employee=emp)
            print(f"Created Employee record for Faculty: {faculty.first_name} {faculty.last_name}")
        else:
            if not emp.faculty:
                emp.faculty = faculty
                emp.save(update_fields=['faculty'])
                print(f"Linked existing Employee record to Faculty: {faculty.first_name} {faculty.last_name}")

    print(f"Total Employees in system: {Employee.objects.count()}")

if __name__ == '__main__':
    seed_employees()
