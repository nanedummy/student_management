import os
import django
import random
from datetime import date, timedelta, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from examination.models import Exam, ExamResult
from students.models import Student

def seed():
    ExamResult.objects.all().delete()
    Exam.objects.all().delete()

    students = list(Student.objects.all())
    if not students:
        print("No students found. Please seed students first.")
        return

    subjects = [
        ('Data Structures', 'CS101'),
        ('Mechanics', 'ME101'),
        ('Thermodynamics', 'ME102'),
        ('Circuit Theory', 'EE101'),
        ('Database Systems', 'CS102')
    ]

    exams = []
    # Create some exams
    for i in range(5):
        sub_name, sub_code = random.choice(subjects)
        status = random.choice(['scheduled', 'completed', 'completed'])
        
        exam = Exam.objects.create(
            name=f"Mid Term {i+1}",
            exam_type='internal',
            course='B.Tech',
            department='Computer Science',
            semester=3,
            subject=sub_name,
            subject_code=sub_code,
            exam_date=date.today() - timedelta(days=random.randint(-10, 10)),
            start_time=time(9, 0),
            end_time=time(12, 0),
            room=f"Room {100+i}",
            max_marks=100,
            pass_marks=40,
            status=status,
            academic_year='2024-25'
        )
        exams.append(exam)
    
    # Create results only for completed exams
    completed_exams = [e for e in exams if e.status == 'completed']
    
    for exam in completed_exams:
        for student in students[:10]: # Pick up to 10 students
            marks = random.randint(30, 95) # Some will fail, some pass
            ExamResult.objects.create(
                exam=exam,
                student=student,
                marks_obtained=marks,
                remarks='Good' if marks > 60 else 'Needs Improvement',
                entered_by='Admin'
            )

    print(f"Seeded {Exam.objects.count()} exams and {ExamResult.objects.count()} results.")

if __name__ == '__main__':
    seed()
