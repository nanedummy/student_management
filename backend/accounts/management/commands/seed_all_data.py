import random
import uuid
import calendar
from datetime import date, timedelta, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from students.models import Student
from faculty.models import Faculty
from academics.models import Subject
from fees.models import Fee, FeeStructure
from attendance.models import AttendanceSession, StudentAttendance
from departments.models import Department
from hr.models import Employee, Attendance as HRAttendance, LeaveRequest, PayrollConfig, Payroll
from placement.models import Company, PlacementDrive, PlacementApplication

User = get_user_model()

DEPARTMENTS = [
    {'name': 'Computer Science', 'course': 'B.Tech', 'spec': 'Computer Science & Engineering', 'prefix': 'CS'},
    {'name': 'Electronics',      'course': 'B.Tech', 'spec': 'Electronics & Communication Engineering', 'prefix': 'EC'},
    {'name': 'Mechanical',       'course': 'B.Tech', 'spec': 'Mechanical Engineering', 'prefix': 'ME'},
    {'name': 'Mathematics',      'course': 'B.Sc',   'spec': 'Mathematics', 'prefix': 'MA'},
    {'name': 'Commerce',         'course': 'B.Com',  'spec': 'Accounting & Finance', 'prefix': 'CO'},
    {'name': 'Management',       'course': 'MBA',    'spec': 'General Management', 'prefix': 'MB'},
]

SUBJECTS_DATA = {
    'Computer Science': [
        ('CS101', 'Introduction to Programming', 'theory', 4),
        ('CS102', 'Data Structures & Algorithms', 'theory', 4),
        ('CS103', 'Database Management Systems', 'theory', 3),
        ('CS104', 'Operating Systems Laboratory', 'practical', 2),
        ('CS105', 'Web Technology Elective', 'elective', 3),
    ],
    'Electronics': [
        ('EC101', 'Basic Electronics & Network Theory', 'theory', 4),
        ('EC102', 'Digital System Design', 'theory', 3),
        ('EC103', 'Microprocessors & Microcontrollers', 'theory', 4),
        ('EC104', 'Integrated Circuits Laboratory', 'practical', 2),
        ('EC105', 'Embedded Systems Elective', 'elective', 3),
    ],
    'Mechanical': [
        ('ME101', 'Engineering Mechanics & Drawing', 'theory', 4),
        ('ME102', 'Engineering Thermodynamics', 'theory', 4),
        ('ME103', 'Strength of Materials', 'theory', 3),
        ('ME104', 'Fluid Machinery Laboratory', 'practical', 2),
        ('ME105', 'Robotics & Automation Elective', 'elective', 3),
    ],
    'Mathematics': [
        ('MA101', 'Calculus & Multivariable Analysis', 'theory', 4),
        ('MA102', 'Probability, Statistics & Stochastic Processes', 'theory', 4),
        ('MA103', 'Real & Complex Analysis', 'theory', 3),
        ('MA104', 'Computational Mathematics Laboratory', 'practical', 2),
        ('MA105', 'Discrete Mathematics Elective', 'elective', 3),
    ],
    'Commerce': [
        ('CO101', 'Advanced Financial Accounting', 'theory', 4),
        ('CO102', 'Managerial Economics', 'theory', 3),
        ('CO103', 'Corporate Laws & Governance', 'theory', 3),
        ('CO104', 'Tally & Computerized Accounting', 'practical', 2),
        ('CO105', 'Investment Banking Elective', 'elective', 3),
    ],
    'Management': [
        ('MB101', 'Organizational Behaviour', 'theory', 3),
        ('MB102', 'Strategic Management', 'theory', 3),
        ('MB103', 'Marketing Management', 'theory', 3),
        ('MB104', 'HR & Industrial Relations', 'theory', 3),
        ('MB105', 'Financial Risk Management', 'elective', 4),
    ],
}

FIRST_NAMES = [
    'Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya',
    'Suresh', 'Meena', 'Rajesh', 'Kavya', 'Arun', 'Pooja', 'Manoj', 'Lakshmi',
    'Deepak', 'Nisha', 'Sanjay', 'Riya', 'Amit', 'Swathi', 'Naveen', 'Harini',
    'Ganesh', 'Pavithra', 'Vijay', 'Keerthi', 'Ramesh', 'Sowmya', 'Dinesh', 'Revathi',
    'Prasad', 'Geetha', 'Mohan', 'Saranya', 'Bala', 'Indira', 'Ravi', 'Chitra'
]

LAST_NAMES = [
    'Kumar', 'Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Pillai', 'Menon',
    'Singh', 'Gupta', 'Verma', 'Joshi', 'Rao', 'Naidu', 'Krishnan', 'Bhat',
    'Murugan', 'Selvam', 'Pandian', 'Arumugam'
]

QUALIFICATIONS = ['Ph.D', 'M.Tech', 'M.Sc', 'M.Phil', 'MBA', 'M.Com']
GENDERS = ['male', 'female']
DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']
SYSTEM_USERS = [
    # (username,          password,          role,                 email,                              is_staff, is_superuser)
    ('superadmin',        'SuperAdmin@123',   'super_admin',        'superadmin@collegems.com',         True,     True),
    ('admin',             'Admin@123',        'admin',              'admin@collegems.com',              True,     False),
    ('hr_manager',        'HR@123',           'hr',                 'hr@collegems.com',                 False,    False),
    ('accountant',        'Accounts@123',     'accountant',         'accounts@collegems.com',           False,    False),
    ('librarian',         'Library@123',      'librarian',          'library@collegems.com',            False,    False),
    ('hostel_warden',     'Hostel@123',       'hostel_warden',      'hostel@collegems.com',             False,    False),
    ('placement_officer', 'Placement@123',    'placement_officer',  'placement@collegems.com',          False,    False),
    ('transport',         'Transport@123',    'transport_incharge', 'transport@collegems.com',          False,    False),
    ('alumni_coord',      'Alumni@123',       'alumni_coordinator', 'alumni@collegems.com',             False,    False),
]

def rand_name(used_names):
    for _ in range(1000):
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        if (fn, ln) not in used_names:
            used_names.add((fn, ln))
            return fn, ln
    return f'Name_{random.randint(100, 999)}', 'Test'


# Salary bands by designation (annual approx, stored as monthly basic)
SALARY_BANDS = {
    'HOD':                  (85000, 120000),
    'Professor':            (70000, 95000),
    'Associate Professor':  (55000, 75000),
    'Assistant Professor':  (40000, 58000),
    'Lecturer':             (30000, 42000),
    # Non-teaching staff
    'HR Manager':           (50000, 65000),
    'Accountant':           (35000, 50000),
    'Librarian':            (30000, 45000),
    'Hostel Warden':        (28000, 40000),
    'Placement Officer':    (40000, 55000),
    'Transport Incharge':   (28000, 38000),
    'Lab Assistant':        (22000, 32000),
    'Office Assistant':     (20000, 28000),
}

# Non-teaching staff to seed (name prefix, designation, department_name)
NON_TEACHING_STAFF = [
    ('Lakshmi',  'Sharma',   'HR Manager',         'Administration'),
    ('Ravi',     'Krishnan', 'Accountant',          'Administration'),
    ('Chitra',   'Nair',     'Librarian',           'Library'),
    ('Dinesh',   'Pillai',   'Hostel Warden',       'Hostel & Facilities'),
    ('Saranya',  'Gupta',    'Placement Officer',   'Administration'),
    ('Bala',     'Menon',    'Transport Incharge',  'Administration'),
    ('Indira',   'Rao',      'Lab Assistant',       'Computer Science'),
    ('Prasad',   'Verma',    'Lab Assistant',       'Electronics'),
    ('Revathi',  'Bhat',     'Office Assistant',    'Administration'),
]

# Realistic leave request reasons
LEAVE_REASONS = {
    'sick':   ['Fever and body pain', 'Dental appointment', 'Medical check-up', 'Recovering from viral infection', 'Eye specialist consultation'],
    'casual': ['Family function', 'Personal work at bank', 'House shifting', 'Attending a wedding', 'Parent-teacher meeting'],
    'earned': ['Annual vacation trip', 'Festival celebration at hometown', 'Family reunion', 'Pilgrimage trip'],
    'unpaid': ['Extended personal leave', 'Visa processing for conference', 'Family emergency'],
}


class Command(BaseCommand):
    help = 'Wipe database and seed with meaningful system users, faculty, students, subjects, attendance, fee history, and HR & Payroll data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Clearing all existing database records...'))
        # HR models first (depend on Employee -> Department)
        Payroll.objects.all().delete()
        PayrollConfig.objects.all().delete()
        LeaveRequest.objects.all().delete()
        HRAttendance.objects.all().delete()
        Employee.objects.all().delete()
        Department.objects.all().delete()
        # Academic models
        StudentAttendance.objects.all().delete()
        AttendanceSession.objects.all().delete()
        Fee.objects.all().delete()
        FeeStructure.objects.all().delete()
        Subject.objects.all().delete()
        Faculty.objects.all().delete()
        User.objects.all().delete()
        Student.objects.all().delete()
        # Placement models
        PlacementApplication.objects.all().delete()
        PlacementDrive.objects.all().delete()
        Company.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared successfully.'))

        # 1. Create System Users
        self.stdout.write('Seeding system users...')
        for username, password, role, email, is_staff, is_superuser in SYSTEM_USERS:
            User.objects.create_user(
                username=username,
                password=password,
                email=email,
                role=role,
                is_staff=is_staff,
                is_superuser=is_superuser,
                full_name=username.replace('_', ' ').title(),
                phone=f'98765{random.randint(10000, 99999)}'
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(SYSTEM_USERS)} system users.'))

        used_names = set()
        used_emails = set()
        used_reg = set()

        faculty_instances = {}  # department -> list of faculty objects
        subject_instances = {}  # department -> list of subject objects

        # 2. Create Faculty & Subjects
        self.stdout.write('Seeding faculty and subjects...')
        for dept in DEPARTMENTS:
            dname = dept['name']
            course = dept['course']
            prefix = dept['prefix']
            
            faculty_instances[dname] = []
            subject_instances[dname] = []

            # Create HOD first
            fn, ln = rand_name(used_names)
            email = f"{fn.lower()}.{ln.lower()}@{prefix.lower()}hod.college.edu"
            used_emails.add(email)
            hod = Faculty.objects.create(
                first_name=fn,
                last_name=ln,
                email=email,
                phone=f'9{random.randint(100000000, 999999999)}',
                department=dname,
                course=course,
                designation='HOD',
                qualification='Ph.D',
                experience=random.randint(12, 20),
                status='active'
            )
            faculty_instances[dname].append(hod)
            # Create user account for HOD
            User.objects.create_user(
                username=f"{fn.lower()}_{ln.lower()}",
                password='Faculty@123',
                email=email,
                role='faculty',
                is_staff=False,
                full_name=f"{fn} {ln}",
                phone=hod.phone,
                department=dname
            )

            # Create 3 other teaching faculty members
            for i in range(1, 4):
                fn, ln = rand_name(used_names)
                email = f"{fn.lower()}.{ln.lower()}.{prefix.lower()}{i}@college.edu"
                used_emails.add(email)
                fac = Faculty.objects.create(
                    first_name=fn,
                    last_name=ln,
                    email=email,
                    phone=f'9{random.randint(100000000, 999999999)}',
                    department=dname,
                    course=course,
                    designation=random.choice(DESIGNATIONS),
                    qualification=random.choice(QUALIFICATIONS),
                    experience=random.randint(2, 11),
                    status='active'
                )
                faculty_instances[dname].append(fac)
                # Create user account for faculty
                User.objects.create_user(
                    username=f"{fn.lower()}_{ln.lower()}",
                    password='Faculty@123',
                    email=email,
                    role='faculty',
                    is_staff=False,
                    full_name=f"{fn} {ln}",
                    phone=fac.phone,
                    department=dname
                )

            # Create subjects for this department and assign to faculty
            subjects_info = SUBJECTS_DATA.get(dname, [])
            for code, name, sub_type, credits in subjects_info:
                assigned_faculty = random.choice(faculty_instances[dname])
                sub = Subject.objects.create(
                    code=code,
                    name=name,
                    course=course,
                    department=dname,
                    semester=random.randint(1, 8) if course == 'B.Tech' else random.randint(1, 4),
                    credits=credits,
                    subject_type=sub_type,
                    faculty_name=f"{assigned_faculty.first_name} {assigned_faculty.last_name}",
                    is_active=True
                )
                subject_instances[dname].append(sub)

        self.stdout.write(self.style.SUCCESS(f"Seeded faculty and subjects across {len(DEPARTMENTS)} departments."))

        # 3. Create Fee Structures
        self.stdout.write('Seeding fee structures...')
        fee_structures = []
        # General B.Tech structures
        fee_structures.append(FeeStructure.objects.create(name='B.Tech Tuition Fee', fee_type='tuition', amount=65000.00, course='B.Tech', department='', academic_year='2024-25'))
        fee_structures.append(FeeStructure.objects.create(name='B.Tech Library Fee', fee_type='library', amount=2500.00, course='B.Tech', department='', academic_year='2024-25'))
        fee_structures.append(FeeStructure.objects.create(name='B.Tech Exam Fee', fee_type='exam', amount=1500.00, course='B.Tech', department='', academic_year='2024-25'))
        # General MBA structures
        fee_structures.append(FeeStructure.objects.create(name='MBA Tuition Fee', fee_type='tuition', amount=80000.00, course='MBA', department='', academic_year='2024-25'))
        fee_structures.append(FeeStructure.objects.create(name='MBA Exam Fee', fee_type='exam', amount=2000.00, course='MBA', department='', academic_year='2024-25'))
        # General B.Sc structures
        fee_structures.append(FeeStructure.objects.create(name='B.Sc Tuition Fee', fee_type='tuition', amount=30000.00, course='B.Sc', department='', academic_year='2024-25'))
        fee_structures.append(FeeStructure.objects.create(name='B.Sc Lab Fee', fee_type='lab', amount=3500.00, course='B.Sc', department='', academic_year='2024-25'))
        # General B.Com structures
        fee_structures.append(FeeStructure.objects.create(name='B.Com Tuition Fee', fee_type='tuition', amount=28000.00, course='B.Com', department='', academic_year='2024-25'))

        self.stdout.write(self.style.SUCCESS('Fee structures initialized.'))

        # 4. Create Students, Student Users, Fees and Attendance
        self.stdout.write('Seeding students and student activities...')
        
        today = date.today()
        # Define last 5 weekdays for attendance sessions
        attendance_dates = []
        current_date = today - timedelta(days=7)
        while len(attendance_dates) < 5:
            if current_date.weekday() < 5:  # Monday to Friday
                attendance_dates.append(current_date)
            current_date += timedelta(days=1)

        # Create 10 students per department
        for dept in DEPARTMENTS:
            dname = dept['name']
            course = dept['course']
            prefix = dept['prefix']
            full_course = course # We set course to exact matching name from COURSES (e.g. B.Tech)

            self.stdout.write(f"  Adding 10 students for {dname}...")

            students_in_dept = []
            for i in range(1, 11):
                fn, ln = rand_name(used_names)
                email = f"{fn.lower()}.{ln.lower()}@{prefix.lower()}student.edu"
                while email in used_emails:
                    email = f"{fn.lower()}.{ln.lower()}.{random.randint(1,99)}@{prefix.lower()}student.edu"
                used_emails.add(email)

                reg = f"{prefix}2024{i:03d}"
                used_reg.add(reg)

                # Create student
                student = Student.objects.create(
                    first_name=fn,
                    last_name=ln,
                    email=email,
                    phone=f'9{random.randint(100000000, 999999999)}',
                    gender=random.choice(GENDERS),
                    date_of_birth=f'{random.randint(2001, 2005)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}',
                    address=f'{random.randint(1, 150)}, Main Road, Chennai',
                    course=full_course,
                    department=dname,
                    year=random.randint(1, 4) if course == 'B.Tech' else random.randint(1, 2),
                    roll_number=reg,
                    register_number=reg,
                    status='active',
                    cgpa=round(random.uniform(6.5, 9.8), 2),
                    attendance_percentage=round(random.uniform(70.0, 98.0), 2)
                )
                students_in_dept.append(student)

                # Create user account for student
                User.objects.create_user(
                    username=reg,
                    password='Student@123',
                    email=email,
                    role='student',
                    is_staff=False,
                    full_name=f"{fn} {ln}",
                    phone=student.phone,
                    department=dname,
                    linked_student=student
                )

                # Create fee payments for this student
                # Find matching fee structures
                matched_structures = [fs for fs in fee_structures if fs.course == course]
                for fs in matched_structures:
                    # Random status distribution: 60% Paid, 20% Overdue, 20% Pending
                    rand_val = random.random()
                    if rand_val < 0.60:
                        status = 'paid'
                        paid_date = today - timedelta(days=random.randint(5, 40))
                        payment_mode = random.choice(['Net Banking', 'UPI', 'Credit Card', 'Cash'])
                        transaction_id = f"TXN{random.randint(100000, 999999)}"
                        receipt_number = f"RCP{uuid.uuid4().hex[:8].upper()}"
                        due_date = paid_date + timedelta(days=random.randint(10, 30))
                    elif rand_val < 0.80:
                        status = 'overdue'
                        paid_date = None
                        payment_mode = ''
                        transaction_id = ''
                        receipt_number = None
                        due_date = today - timedelta(days=random.randint(5, 25))
                    else:
                        status = 'pending'
                        paid_date = None
                        payment_mode = ''
                        transaction_id = ''
                        receipt_number = None
                        due_date = today + timedelta(days=random.randint(10, 30))

                    # Let's delete default fees created by post_save signal first to prevent duplicates
                    Fee.objects.filter(student=student, fee_type=fs.fee_type).delete()

                    Fee.objects.create(
                        student=student,
                        fee_structure=fs,
                        amount=fs.amount,
                        net_amount=fs.amount,
                        fee_type=fs.name,
                        semester=student.year * 2 - 1,  # approximate
                        academic_year=fs.academic_year,
                        due_date=due_date,
                        paid_date=paid_date,
                        status=status,
                        payment_mode=payment_mode,
                        transaction_id=transaction_id,
                        receipt_number=receipt_number,
                        description=f"Automated seed entry for {fs.name}"
                    )

            # Create attendance sessions and records for these students
            dept_subjects = subject_instances.get(dname, [])
            for att_date in attendance_dates:
                for period in range(1, 3):  # 2 periods per day
                    if not dept_subjects:
                        continue
                    subject = random.choice(dept_subjects)
                    
                    # Create Attendance Session
                    session, created = AttendanceSession.objects.get_or_create(
                        date=att_date,
                        course=course,
                        period=period,
                        defaults={
                            'department': dname,
                            'subject': subject.name,
                            'faculty_name': subject.faculty_name
                        }
                    )

                    # Mark attendance for all students in department for this session
                    for student in students_in_dept:
                        # 85% Present, 8% Late, 5% Absent, 2% Excused
                        rand_val = random.random()
                        if rand_val < 0.85:
                            status = 'present'
                            remarks = 'On time'
                        elif rand_val < 0.93:
                            status = 'late'
                            remarks = f'Late by {random.randint(5, 15)} mins'
                        elif rand_val < 0.98:
                            status = 'absent'
                            remarks = 'Absent without prior notice'
                        else:
                            status = 'excused'
                            remarks = 'Medical leave'

                        StudentAttendance.objects.get_or_create(
                            session=session,
                            student=student,
                            defaults={
                                'status': status,
                                'remarks': remarks
                            }
                        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all students, fees, and attendance records.'))

        # ==================================================================
        # 5. HR & PAYROLL MODULE
        # ==================================================================
        self.stdout.write(self.style.WARNING('\n-- HR & Payroll Module --'))

        # 5a. Create Department records
        self.stdout.write('Creating department records...')
        dept_objects = {}
        dept_definitions = [
            ('Computer Science',   'CSE',  'Covers B.Tech CSE, BCA, MCA programs'),
            ('Electronics',        'ECE',  'Covers B.Tech ECE programs'),
            ('Mechanical',         'ME',   'Covers B.Tech Mechanical programs'),
            ('Mathematics',        'MATH', 'Covers B.Sc Mathematics programs'),
            ('Commerce',           'COM',  'Covers B.Com and related programs'),
            ('Management',         'MBA',  'Covers MBA and BBA programs'),
            ('Administration',     'ADM',  'Central administrative department'),
            ('Library',            'LIB',  'Library services department'),
            ('Hostel & Facilities','HST',  'Hostel and campus facilities'),
        ]
        for dept_name, code, desc in dept_definitions:
            dept_obj = Department.objects.create(name=dept_name, code=code, description=desc)
            dept_objects[dept_name] = dept_obj
        self.stdout.write(self.style.SUCCESS(f'Created {len(dept_objects)} departments.'))

        # Set HOD names on departments
        for dname, fac_list in faculty_instances.items():
            if dname in dept_objects and fac_list:
                hod = fac_list[0]  # first faculty is HOD
                dept_objects[dname].head = f"{hod.first_name} {hod.last_name}"
                dept_objects[dname].save()

        # 5b. Create Employee records for all Faculty
        self.stdout.write('Creating employee records for faculty...')
        all_employees = []
        emp_counter = 1

        for dname, fac_list in faculty_instances.items():
            dept_obj = dept_objects.get(dname)
            for fac in fac_list:
                salary_range = SALARY_BANDS.get(fac.designation, (30000, 50000))
                basic_salary = random.randint(salary_range[0], salary_range[1])
                join_year = random.randint(2015, 2024)
                join_month = random.randint(1, 12)
                join_day = random.randint(1, 28)

                emp = Employee.objects.create(
                    employee_id=f'EMP{emp_counter:04d}',
                    first_name=fac.first_name,
                    last_name=fac.last_name,
                    email=fac.email,
                    phone=fac.phone,
                    gender=random.choice(GENDERS),
                    date_of_birth=date(random.randint(1970, 1995), random.randint(1, 12), random.randint(1, 28)),
                    address=f'{random.randint(1, 200)}, {random.choice(["Anna Nagar", "T. Nagar", "Velachery", "Adyar", "Mylapore", "Porur"])}, Chennai',
                    department=dept_obj,
                    designation=fac.designation,
                    employment_type='full_time',
                    date_of_joining=date(join_year, join_month, join_day),
                    basic_salary=basic_salary,
                    status='active',
                    faculty=fac,
                )
                all_employees.append(emp)
                emp_counter += 1

        self.stdout.write(self.style.SUCCESS(f'Created {len(all_employees)} employee records for faculty.'))

        # 5c. Create Employee records for non-teaching staff
        self.stdout.write('Creating employee records for non-teaching staff...')
        for fn, ln, designation, dept_name in NON_TEACHING_STAFF:
            dept_obj = dept_objects.get(dept_name)
            salary_range = SALARY_BANDS.get(designation, (25000, 35000))
            basic_salary = random.randint(salary_range[0], salary_range[1])
            join_year = random.randint(2016, 2024)

            emp = Employee.objects.create(
                employee_id=f'EMP{emp_counter:04d}',
                first_name=fn,
                last_name=ln,
                email=f'{fn.lower()}.{ln.lower()}@staff.college.edu',
                phone=f'9{random.randint(100000000, 999999999)}',
                gender=random.choice(GENDERS),
                date_of_birth=date(random.randint(1975, 1998), random.randint(1, 12), random.randint(1, 28)),
                address=f'{random.randint(1, 200)}, {random.choice(["Guindy", "Tambaram", "Chrompet", "Pallavaram"])}, Chennai',
                department=dept_obj,
                designation=designation,
                employment_type='full_time',
                date_of_joining=date(join_year, random.randint(1, 12), random.randint(1, 28)),
                basic_salary=basic_salary,
                status='active',
                faculty=None,
            )
            all_employees.append(emp)
            emp_counter += 1

        self.stdout.write(self.style.SUCCESS(f'Total employees: {len(all_employees)} (incl. non-teaching staff).'))

        # 5d. Create PayrollConfig for each employee
        self.stdout.write('Creating payroll configurations...')
        for emp in all_employees:
            # Vary slightly by seniority
            is_senior = emp.designation in ('HOD', 'Professor', 'HR Manager')
            PayrollConfig.objects.create(
                employee=emp,
                hra_percent=Decimal('25') if is_senior else Decimal('20'),
                ta_percent=Decimal('12') if is_senior else Decimal('10'),
                pf_percent=Decimal('12'),
                tax_percent=Decimal('10'),
                other_allowances=Decimal(str(random.choice([0, 1000, 2000, 3000]))) if is_senior else Decimal('0'),
                other_deductions=Decimal('0'),
            )
        self.stdout.write(self.style.SUCCESS('Payroll configs created.'))

        # 5e. Create HR Attendance for last 20 working days
        self.stdout.write('Seeding HR attendance records...')
        today = date.today()
        hr_attendance_dates = []
        d = today - timedelta(days=30)
        while len(hr_attendance_dates) < 20:
            if d.weekday() < 5:  # Mon-Fri
                hr_attendance_dates.append(d)
            d += timedelta(days=1)

        hr_att_count = 0
        for emp in all_employees:
            for att_date in hr_attendance_dates:
                rand_val = random.random()
                if rand_val < 0.82:
                    status = 'present'
                    check_in = time(8, random.randint(45, 59), random.randint(0, 59))
                    check_out = time(17, random.randint(0, 30), random.randint(0, 59))
                    note = ''
                elif rand_val < 0.88:
                    status = 'half_day'
                    check_in = time(8, random.randint(50, 59))
                    check_out = time(13, random.randint(0, 30))
                    note = 'Left early - personal work'
                elif rand_val < 0.93:
                    status = 'absent'
                    check_in = None
                    check_out = None
                    note = random.choice(['Sick leave', 'Personal leave', 'Not reported'])
                else:
                    status = 'holiday'
                    check_in = None
                    check_out = None
                    note = 'Public holiday / College event'

                HRAttendance.objects.get_or_create(
                    employee=emp,
                    date=att_date,
                    defaults={
                        'status': status,
                        'check_in': check_in,
                        'check_out': check_out,
                        'note': note,
                    }
                )
                hr_att_count += 1

        self.stdout.write(self.style.SUCCESS(f'Created {hr_att_count} HR attendance records.'))

        # 5f. Create Leave Requests
        self.stdout.write('Seeding leave requests...')
        leave_count = 0
        # Generate 2-3 leave requests per employee (spread across some employees)
        employees_for_leaves = random.sample(all_employees, min(len(all_employees), 20))
        for emp in employees_for_leaves:
            num_leaves = random.randint(1, 3)
            for _ in range(num_leaves):
                leave_type = random.choice(['sick', 'casual', 'earned', 'unpaid'])
                reason = random.choice(LEAVE_REASONS[leave_type])
                # Random date in last 60 days
                from_date = today - timedelta(days=random.randint(5, 55))
                duration = random.randint(1, 4) if leave_type != 'earned' else random.randint(3, 7)
                to_date = from_date + timedelta(days=duration - 1)

                # Status distribution: 55% approved, 25% pending, 20% rejected
                rand_val = random.random()
                if rand_val < 0.55:
                    status = 'approved'
                    remarks = 'Approved by HR'
                elif rand_val < 0.80:
                    status = 'pending'
                    remarks = ''
                else:
                    status = 'rejected'
                    remarks = random.choice(['Insufficient leave balance', 'Critical project deadline', 'Too many staff on leave'])

                LeaveRequest.objects.create(
                    employee=emp,
                    leave_type=leave_type,
                    from_date=from_date,
                    to_date=to_date,
                    reason=reason,
                    status=status,
                    remarks=remarks,
                )
                leave_count += 1

        self.stdout.write(self.style.SUCCESS(f'Created {leave_count} leave requests.'))

        # 5g. Create Payroll records for April 2026 and May 2026
        self.stdout.write('Processing payroll for April & May 2026...')
        payroll_count = 0
        for month, year in [(4, 2026), (5, 2026)]:
            working_days = 22 if month == 4 else 23  # realistic working days
            month_name = calendar.month_name[month]

            for emp in all_employees:
                # Get config
                try:
                    cfg = emp.payroll_config
                    hra_pct = cfg.hra_percent
                    ta_pct = cfg.ta_percent
                    pf_pct = cfg.pf_percent
                    tax_pct = cfg.tax_percent
                    other_allow = cfg.other_allowances
                    other_deduct = cfg.other_deductions
                except PayrollConfig.DoesNotExist:
                    hra_pct = Decimal('20')
                    ta_pct = Decimal('10')
                    pf_pct = Decimal('12')
                    tax_pct = Decimal('10')
                    other_allow = Decimal('0')
                    other_deduct = Decimal('0')

                basic = Decimal(str(emp.basic_salary))

                # Simulate attendance counts
                present_days = random.randint(int(working_days * 0.8), working_days)
                half_day_count = random.randint(0, 2)
                leave_days_count = random.randint(0, 2)
                absent_days_count = max(0, working_days - present_days - half_day_count - leave_days_count)

                # Earnings
                hra = (basic * hra_pct / Decimal('100')).quantize(Decimal('0.01'))
                ta = (basic * ta_pct / Decimal('100')).quantize(Decimal('0.01'))
                gross = (basic + hra + ta + other_allow).quantize(Decimal('0.01'))

                # Deductions
                per_day_rate = (basic / Decimal(str(working_days))).quantize(Decimal('0.01'))
                absent_deduction = (per_day_rate * Decimal(str(absent_days_count))).quantize(Decimal('0.01'))
                pf = (basic * pf_pct / Decimal('100')).quantize(Decimal('0.01'))
                tax = (gross * tax_pct / Decimal('100')).quantize(Decimal('0.01'))
                total_deductions = (pf + tax + absent_deduction + other_deduct).quantize(Decimal('0.01'))

                net = max(Decimal('0'), (gross - total_deductions).quantize(Decimal('0.01')))

                # Status: April = paid, May = mix of processed/paid
                if month == 4:
                    payroll_status = 'paid'
                    paid_on = date(2026, 5, 1)
                else:
                    payroll_status = random.choice(['processed', 'paid', 'paid'])
                    paid_on = date(2026, 6, 1) if payroll_status == 'paid' else None

                Payroll.objects.create(
                    employee=emp,
                    month=month,
                    year=year,
                    working_days=working_days,
                    present_days=present_days,
                    half_day=half_day_count,
                    leave_days=leave_days_count,
                    absent_days=absent_days_count,
                    basic_salary=basic,
                    hra=hra,
                    ta=ta,
                    other_allowances=other_allow,
                    gross_salary=gross,
                    pf_deduction=pf,
                    tax_deduction=tax,
                    absent_deduction=absent_deduction,
                    other_deductions=other_deduct,
                    total_deductions=total_deductions,
                    net_salary=net,
                    hra_pct=hra_pct,
                    ta_pct=ta_pct,
                    pf_pct=pf_pct,
                    tax_pct=tax_pct,
                    status=payroll_status,
                    paid_on=paid_on,
                )
                payroll_count += 1

            self.stdout.write(f'  {month_name} 2026: payroll processed for {len(all_employees)} employees')

        self.stdout.write(self.style.SUCCESS(f'Created {payroll_count} payroll records total.'))

        # ==================================================================
        # 6. PLACEMENT MODULE
        # ==================================================================
        self.stdout.write(self.style.WARNING('\n-- Placement Module --'))
        self.stdout.write('Seeding companies...')
        
        companies_data = [
            {'name': 'Google', 'industry': 'Technology', 'website': 'https://google.com', 'contact_person': 'Sundar Pichai', 'contact_email': 'careers@google.com', 'contact_phone': '9876543210'},
            {'name': 'Microsoft', 'industry': 'Technology', 'website': 'https://microsoft.com', 'contact_person': 'Satya Nadella', 'contact_email': 'jobs@microsoft.com', 'contact_phone': '9876543211'},
            {'name': 'Infosys', 'industry': 'IT Services', 'website': 'https://infosys.com', 'contact_person': 'Nandan Nilekani', 'contact_email': 'hr@infosys.com', 'contact_phone': '9876543212'},
            {'name': 'TCS', 'industry': 'IT Services & Consulting', 'website': 'https://tcs.com', 'contact_person': 'K. Krithivasan', 'contact_email': 'recruitment@tcs.com', 'contact_phone': '9876543213'},
            {'name': 'HDFC Bank', 'industry': 'Banking & Financial Services', 'website': 'https://hdfcbank.com', 'contact_person': 'Sashidhar Jagdishan', 'contact_email': 'hr@hdfcbank.com', 'contact_phone': '9876543214'},
            {'name': 'Larsen & Toubro', 'industry': 'Engineering & Construction', 'website': 'https://larsentoubro.com', 'contact_person': 'S. N. Subrahmanyan', 'contact_email': 'careers@larsentoubro.com', 'contact_phone': '9876543215'},
        ]
        
        company_instances = {}
        for co in companies_data:
            c_obj = Company.objects.create(
                name=co['name'],
                industry=co['industry'],
                website=co['website'],
                contact_person=co['contact_person'],
                contact_email=co['contact_email'],
                contact_phone=co['contact_phone']
            )
            company_instances[co['name']] = c_obj
            
        self.stdout.write(self.style.SUCCESS(f'Created {len(company_instances)} companies.'))
        
        self.stdout.write('Seeding placement drives...')
        # Upcoming, ongoing, completed
        drives_data = [
            {
                'company': 'Google',
                'title': 'Software Engineering Intern',
                'drive_date': today + timedelta(days=45),
                'venue': 'Campus Auditorium & Online',
                'package_lpa': Decimal('25.00'),
                'eligible_courses': 'B.Tech',
                'min_cgpa': Decimal('8.50'),
                'status': 'upcoming',
                'description': 'Summer internship for pre-final year students with focus on Data Structures, Algorithms, and Software Engineering principles.'
            },
            {
                'company': 'Microsoft',
                'title': 'Technical Consultant',
                'drive_date': today + timedelta(days=20),
                'venue': 'Seminar Hall A',
                'package_lpa': Decimal('18.00'),
                'eligible_courses': 'B.Tech, MBA',
                'min_cgpa': Decimal('8.00'),
                'status': 'upcoming',
                'description': 'Consulting role for engineering and management graduates. Evaluation covers problem solving, communication, and system design.'
            },
            {
                'company': 'HDFC Bank',
                'title': 'Management Trainee',
                'drive_date': today + timedelta(days=10),
                'venue': 'MBA Block Seminar Room',
                'package_lpa': Decimal('12.00'),
                'eligible_courses': 'MBA, B.Com',
                'min_cgpa': Decimal('7.00'),
                'status': 'upcoming',
                'description': 'Management trainee program in Retail Banking and Wealth Management. Requires strong quantitative and analytical skills.'
            },
            {
                'company': 'Infosys',
                'title': 'Systems Engineer',
                'drive_date': today - timedelta(days=2),
                'venue': 'Computer Lab 3 & 4',
                'package_lpa': Decimal('4.50'),
                'eligible_courses': 'B.Tech, B.Sc',
                'min_cgpa': Decimal('6.00'),
                'status': 'ongoing',
                'description': 'Entry-level systems engineering role. Online test followed by technical and HR interview rounds.'
            },
            {
                'company': 'TCS',
                'title': 'Ninja Developer',
                'drive_date': today - timedelta(days=25),
                'venue': 'Online Assessment Center',
                'package_lpa': Decimal('3.60'),
                'eligible_courses': 'B.Tech, B.Sc, B.Com',
                'min_cgpa': Decimal('6.00'),
                'status': 'completed',
                'description': 'National Qualifier Test (NQT) based hiring for Ninja Developer role. Covers aptitude, coding, and basic technical concepts.'
            },
            {
                'company': 'Larsen & Toubro',
                'title': 'Graduate Engineer Trainee',
                'drive_date': today - timedelta(days=40),
                'venue': 'Mechanical Department Seminar Hall',
                'package_lpa': Decimal('6.50'),
                'eligible_courses': 'B.Tech',
                'min_cgpa': Decimal('7.00'),
                'status': 'completed',
                'description': 'Graduate Engineer Trainee program for mechanical, civil, and electrical engineers. Focuses on core concepts and project management.'
            },
        ]
        
        drive_instances = []
        for dr in drives_data:
            d_obj = PlacementDrive.objects.create(
                company=company_instances[dr['company']],
                title=dr['title'],
                drive_date=dr['drive_date'],
                venue=dr['venue'],
                package_lpa=dr['package_lpa'],
                eligible_courses=dr['eligible_courses'],
                min_cgpa=dr['min_cgpa'],
                status=dr['status'],
                description=dr['description']
            )
            drive_instances.append(d_obj)
            
        self.stdout.write(self.style.SUCCESS(f'Created {len(drive_instances)} placement drives.'))
        
        self.stdout.write('Seeding placement applications...')
        all_students = list(Student.objects.all())
        app_count = 0
        
        for drive in drive_instances:
            eligible_students = []
            for s in all_students:
                course_matches = any(ec.strip().lower() in s.course.lower() for ec in drive.eligible_courses.split(','))
                cgpa_matches = s.cgpa >= drive.min_cgpa
                if course_matches and cgpa_matches:
                    eligible_students.append(s)
            
            if len(eligible_students) < 3:
                eligible_students = random.sample(all_students, k=min(len(all_students), 5))
                
            num_apps = min(len(eligible_students), random.randint(4, 8))
            selected_students = random.sample(eligible_students, k=num_apps)
            
            for student in selected_students:
                if drive.status == 'upcoming':
                    status = 'applied'
                    offer_letter = False
                    package_lpa = None
                elif drive.status == 'ongoing':
                    status = random.choice(['applied', 'shortlisted'])
                    offer_letter = False
                    package_lpa = None
                else:  # completed
                    rand_val = random.random()
                    if rand_val < 0.30:
                        status = 'selected'
                        offer_letter = True
                        package_lpa = drive.package_lpa
                    elif rand_val < 0.80:
                        status = 'rejected'
                        offer_letter = False
                        package_lpa = None
                    else:
                        status = 'shortlisted'
                        offer_letter = False
                        package_lpa = None
                        
                PlacementApplication.objects.create(
                    drive=drive,
                    student_name=f"{student.first_name} {student.last_name}",
                    student_id=student.roll_number,
                    course=student.course,
                    cgpa=student.cgpa,
                    status=status,
                    offer_letter=offer_letter,
                    package_lpa=package_lpa
                )
                app_count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {app_count} placement applications.'))

        # ==================================================================
        # SUMMARY
        # ==================================================================
        self.stdout.write(self.style.SUCCESS('\n=============================================='))
        self.stdout.write(self.style.SUCCESS('  DATABASE POPULATION COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=============================================='))
        self.stdout.write(f'  System Users:       {len(SYSTEM_USERS)}')
        self.stdout.write(f'  Departments:        {len(dept_objects)}')
        self.stdout.write(f'  Faculty:            {Faculty.objects.count()}')
        self.stdout.write(f'  Students:           {Student.objects.count()}')
        self.stdout.write(f'  Subjects:           {Subject.objects.count()}')
        self.stdout.write(f'  Fee Structures:     {len(fee_structures)}')
        self.stdout.write(f'  Fee Records:        {Fee.objects.count()}')
        self.stdout.write(f'  Employees (HR):     {len(all_employees)}')
        self.stdout.write(f'  Payroll Records:    {payroll_count}')
        self.stdout.write(f'  HR Attendance:      {hr_att_count}')
        self.stdout.write(f'  Leave Requests:     {leave_count}')
        self.stdout.write(f'  Companies:          {Company.objects.count()}')
        self.stdout.write(f'  Placement Drives:   {PlacementDrive.objects.count()}')
        self.stdout.write(f'  Applications:       {PlacementApplication.objects.count()}')
        self.stdout.write(self.style.SUCCESS('==============================================\n'))
