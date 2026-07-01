import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import Student
from attendance.models import AttendanceSession, StudentAttendance
from examination.models import Exam, ExamResult

def seed_student_data():
    students = list(Student.objects.all())
    if not students:
        print("No students found.")
        return

    print(f"Seeding data for {len(students)} students...")

    # Create some Exams if none exist or just use existing
    exams = []
    for subject in ["Mathematics", "Physics", "Computer Science"]:
        exam, created = Exam.objects.get_or_create(
            name="Midterm 2026",
            subject=subject,
            defaults={
                "exam_type": "internal",
                "course": "B.Tech",
                "exam_date": date.today() - timedelta(days=30),
                "max_marks": 100,
                "pass_marks": 40,
                "status": "completed"
            }
        )
        exams.append(exam)
    
    # Create some Exam Results
    for student in students:
        for exam in exams:
            # Random marks
            marks = random.randint(35, 95)
            ExamResult.objects.get_or_create(
                exam=exam,
                student=student,
                defaults={
                    "marks_obtained": marks
                }
            )

    # Create Attendance Sessions
    sessions = []
    for day in range(1, 15):
        d = date.today() - timedelta(days=day)
        for subject in ["Mathematics", "Physics", "Computer Science"]:
            session, created = AttendanceSession.objects.get_or_create(
                date=d,
                course="B.Tech",
                period=random.randint(1, 4),
                defaults={
                    "subject": subject,
                    "faculty_name": "Dr. Smith"
                }
            )
            sessions.append(session)
    
    # Create Attendance Records
    for student in students:
        for session in sessions:
            status = random.choices(['present', 'absent', 'late'], weights=[80, 15, 5])[0]
            StudentAttendance.objects.get_or_create(
                session=session,
                student=student,
                defaults={
                    "status": status
                }
            )

    print("Data seeded successfully!")

if __name__ == '__main__':
    seed_student_data()
