import os
import django
import random
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from placement.models import Company, PlacementDrive, PlacementApplication
from alumni.models import AlumniProfile, AlumniEvent, AlumniEventRegistration
from students.models import Student

def seed_data():
    print("Seeding Placement and Alumni Data...")

    # --- PLACEMENT ---
    companies_data = [
        {'name': 'Tech Mahindra', 'industry': 'IT Services', 'website': 'https://techmahindra.com', 'contact_person': 'Amit Patil', 'contact_email': 'hr@techmahindra.com', 'contact_phone': '9876543210'},
        {'name': 'Google India', 'industry': 'Technology', 'website': 'https://careers.google.com', 'contact_person': 'Sundar R', 'contact_email': 'careers-in@google.com', 'contact_phone': '9876543211'},
        {'name': 'TCS', 'industry': 'IT Services', 'website': 'https://tcs.com', 'contact_person': 'Ratan T', 'contact_email': 'recruitment@tcs.com', 'contact_phone': '9876543212'},
        {'name': 'Wipro', 'industry': 'IT Services', 'website': 'https://wipro.com', 'contact_person': 'Azim P', 'contact_email': 'careers@wipro.com', 'contact_phone': '9876543213'},
        {'name': 'Amazon', 'industry': 'E-Commerce', 'website': 'https://amazon.jobs', 'contact_person': 'Jeff B', 'contact_email': 'jobs@amazon.in', 'contact_phone': '9876543214'},
    ]
    companies = []
    for cd in companies_data:
        comp, _ = Company.objects.update_or_create(name=cd['name'], defaults=cd)
        companies.append(comp)
    
    print(f"Created {len(companies)} Companies.")

    today = datetime.date.today()
    drives_data = [
        {'title': 'Software Engineer Fresher Hiring', 'company': companies[0], 'drive_date': today + datetime.timedelta(days=10), 'package_lpa': 4.5, 'min_cgpa': 6.5, 'status': 'upcoming'},
        {'title': 'SDE 1 Recruitment', 'company': companies[1], 'drive_date': today + datetime.timedelta(days=25), 'package_lpa': 25.0, 'min_cgpa': 8.0, 'status': 'upcoming'},
        {'title': 'Ninja Hiring 2026', 'company': companies[2], 'drive_date': today - datetime.timedelta(days=15), 'package_lpa': 3.6, 'min_cgpa': 6.0, 'status': 'completed'},
    ]

    drives = []
    for dd in drives_data:
        drive, _ = PlacementDrive.objects.get_or_create(
            company=dd['company'],
            title=dd['title'],
            defaults={
                'drive_date': dd['drive_date'],
                'package_lpa': dd['package_lpa'],
                'min_cgpa': dd['min_cgpa'],
                'status': dd['status']
            }
        )
        drives.append(drive)
    print(f"Created {len(drives)} Placement Drives.")

    students = list(Student.objects.all())
    if students:
        for drive in drives:
            if PlacementApplication.objects.filter(drive=drive).count() == 0:
                eligible_students = [s for s in students if (s.cgpa or 0) >= drive.min_cgpa][:10]
                for s in eligible_students:
                    status = 'applied'
                    if drive.status == 'completed':
                        status = random.choice(['selected', 'rejected', 'rejected'])
                    
                    PlacementApplication.objects.create(
                        drive=drive,
                        student_name=f"{s.first_name} {s.last_name}",
                        student_id=s.register_number,
                        course=s.course,
                        cgpa=s.cgpa or 0,
                        status=status,
                        package_lpa=drive.package_lpa if status == 'selected' else None,
                        offer_letter=True if status == 'selected' else False
                    )
        print("Created Placement Applications.")
    else:
        print("No students found to apply for placements.")

    # --- ALUMNI ---
    if AlumniProfile.objects.count() == 0:
        alumni_data = [
            {'first_name': 'Ravi', 'last_name': 'Kumar', 'email': 'ravi.kumar@example.com', 'batch_year': 2022, 'course': 'B.Tech', 'current_company': 'Google India', 'designation': 'Software Engineer'},
            {'first_name': 'Priya', 'last_name': 'Singh', 'email': 'priya.s@example.com', 'batch_year': 2021, 'course': 'MBA', 'current_company': 'HDFC Bank', 'designation': 'Manager'},
            {'first_name': 'Ankit', 'last_name': 'Sharma', 'email': 'ankit.sh@example.com', 'batch_year': 2023, 'course': 'B.Tech', 'current_company': 'TCS', 'designation': 'System Engineer'},
            {'first_name': 'Neha', 'last_name': 'Verma', 'email': 'neha.v@example.com', 'batch_year': 2020, 'course': 'B.Sc', 'current_company': 'Self Employed', 'designation': 'Founder', 'employment_status': 'self_employed'},
        ]
        alumni_profiles = []
        for ad in alumni_data:
            prof, _ = AlumniProfile.objects.get_or_create(email=ad['email'], defaults=ad)
            alumni_profiles.append(prof)
        print(f"Created {len(alumni_profiles)} Alumni Profiles.")
    else:
        alumni_profiles = list(AlumniProfile.objects.all())
        print("Alumni profiles already exist.")

    events_data = [
        {'title': 'Annual Alumni Meet 2026', 'event_date': today + datetime.timedelta(days=60), 'venue': 'Main Auditorium', 'status': 'upcoming'},
        {'title': 'Tech Connect Batch 2020-2022', 'event_date': today - datetime.timedelta(days=120), 'venue': 'Virtual', 'status': 'completed'},
    ]

    for ed in events_data:
        event, created = AlumniEvent.objects.get_or_create(title=ed['title'], defaults=ed)
        if created:
            for prof in random.sample(alumni_profiles, min(2, len(alumni_profiles))):
                AlumniEventRegistration.objects.create(event=event, alumni=prof, attended=(event.status == 'completed'))
    print("Created Alumni Events and Registrations.")

    print("Data seeded successfully!")

if __name__ == '__main__':
    seed_data()
