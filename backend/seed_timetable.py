import os
import django
import random
from datetime import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from timetable.models import TimetableEntry
from academics.models import Subject
from accounts.models import User

# Clear existing timetable entries
print("Clearing existing timetable entries...")
TimetableEntry.objects.all().delete()

COURSE = "B.Tech - Computer Science & Engineering"
DEPARTMENT = "Computer Science"
SEMESTER = 1
ACADEMIC_YEAR = "2024-25"

DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

# Predefined subjects for CS Sem 1
SUBJECTS_DATA = [
    ("Mathematics I", "MAT101"),
    ("Physics", "PHY101"),
    ("Programming in C", "CS101"),
    ("Engineering Graphics", "ME101"),
    ("English Communication", "ENG101")
]

# Ensure subjects exist
print("Ensuring subjects exist...")
subjects = []
for name, code in SUBJECTS_DATA:
    subject, created = Subject.objects.get_or_create(
        code=code,
        defaults={
            'name': name,
            'department': DEPARTMENT,
            'course': COURSE,
            'credits': 3,
            'semester': SEMESTER,
            'subject_type': 'theory'
        }
    )
    subjects.append(subject)

# Get some faculty
print("Fetching faculty...")
faculties = list(User.objects.filter(role='faculty'))
if not faculties:
    print("No faculty found. Please add faculty first.")
    # create dummy faculty
    for i in range(3):
        f, _ = User.objects.get_or_create(
            username=f"faculty{i}",
            defaults={
                'email': f"faculty{i}@example.com",
                'role': 'faculty',
                'first_name': f"Dr. Faculty",
                'last_name': str(i+1),
                'department': DEPARTMENT
            }
        )
        if f not in faculties:
            faculties.append(f)

# Periods 1 to 8 timing
PERIOD_TIMES = {
    1: (time(9, 0), time(9, 50)),
    2: (time(9, 50), time(10, 40)),
    3: (time(10, 50), time(11, 40)),
    4: (time(11, 40), time(12, 30)),
    5: (time(13, 30), time(14, 20)),
    6: (time(14, 20), time(15, 10)),
    7: (time(15, 20), time(16, 10)),
    8: (time(16, 10), time(17, 0)),
}

print(f"Generating timetable for {COURSE} Sem {SEMESTER}...")
for day in DAYS:
    # 5 classes a day
    periods_today = random.sample(range(1, 9), 5)
    for p in periods_today:
        subject = random.choice(subjects)
        faculty = random.choice(faculties)
        start_time, end_time = PERIOD_TIMES[p]
        
        TimetableEntry.objects.create(
            course=COURSE,
            department=DEPARTMENT,
            semester=SEMESTER,
            day=day,
            period=p,
            start_time=start_time,
            end_time=end_time,
            subject=subject.name,
            subject_code=subject.code,
            faculty_name=f"{faculty.first_name} {faculty.last_name}",
            room=f"Room {random.randint(101, 110)}",
            academic_year=ACADEMIC_YEAR
        )

print("Timetable generated successfully!")
