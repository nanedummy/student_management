import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import Student
from faculty.models import Faculty

def main():
    print("Creating User accounts for existing students...")
    students = Student.objects.all()
    s_count = 0
    for s in students:
        username = s.email.split('@')[0] if s.email else s.register_number
        if not User.objects.filter(username=username).exists() and not User.objects.filter(email=s.email).exists():
            u = User.objects.create_user(
                username=username,
                email=s.email,
                password='password123',
                role='student',
                linked_student=s,
                approval_status='approved'
            )
            s_count += 1

    print(f"Created {s_count} student user accounts.")

    print("Creating User accounts for existing faculty...")
    faculties = Faculty.objects.all()
    f_count = 0
    for f in faculties:
        username = f.email.split('@')[0] if f.email else f.first_name.lower()
        if not User.objects.filter(username=username).exists() and not User.objects.filter(email=f.email).exists():
            u = User.objects.create_user(
                username=username,
                email=f.email,
                password='password123',
                role='faculty',
                approval_status='approved',
                full_name=f"{f.first_name} {f.last_name}",
                department=f.department,
                phone=f.phone
            )
            f_count += 1
            
    print(f"Created {f_count} faculty user accounts.")

if __name__ == '__main__':
    main()
