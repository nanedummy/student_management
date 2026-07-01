import os
import django
import random
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from hostel.models import HostelBlock, Room, HostelAllotment, HostelFee
from students.models import Student

def seed_hostel():
    print("Seeding Hostel Data...")

    # 1. Ensure we have Hostel Blocks
    blocks_data = [
        {'name': 'Boys Hostel - Block A', 'gender': 'male', 'warden': 'Mr. Sharma', 'capacity': 200},
        {'name': 'Boys Hostel - Block B', 'gender': 'male', 'warden': 'Mr. Verma', 'capacity': 250},
        {'name': 'Girls Hostel - Block A', 'gender': 'female', 'warden': 'Mrs. Gupta', 'capacity': 200},
    ]

    blocks = {}
    for b_data in blocks_data:
        block, _ = HostelBlock.objects.get_or_create(name=b_data['name'], defaults=b_data)
        blocks[b_data['name']] = block
    
    print(f"Created {len(blocks)} Hostel Blocks.")

    # 2. Create Rooms for each block
    for block_name, block in blocks.items():
        if block.rooms.count() == 0:
            for floor in range(1, 4):
                for room_num in range(1, 11):
                    r_type = random.choice(['double', 'triple'])
                    cap = 2 if r_type == 'double' else 3
                    Room.objects.create(
                        block=block,
                        room_number=f"{floor}0{room_num}" if room_num < 10 else f"{floor}{room_num}",
                        room_type=r_type,
                        capacity=cap,
                        status='available',
                        floor=floor
                    )
    
    print(f"Total Rooms in system: {Room.objects.count()}")

    # 3. Mark some students as hostelers and allot them to rooms
    students = list(Student.objects.all())
    if not students:
        print("No students found. Run student seeds first.")
        return

    # Select ~30% of students as hostelers
    num_hostelers = max(1, int(len(students) * 0.3))
    hostelers = random.sample(students, num_hostelers)

    for student in students:
        if student in hostelers:
            student.residence_type = 'hosteler'
        else:
            student.residence_type = 'day_scholar'
        student.save(update_fields=['residence_type'])

    print(f"Marked {len(hostelers)} students as Hostelers.")

    # 4. Allot rooms
    male_hostelers = [s for s in hostelers if s.gender == 'male']
    female_hostelers = [s for s in hostelers if s.gender == 'female']

    male_rooms = Room.objects.filter(block__gender='male', status='available')
    female_rooms = Room.objects.filter(block__gender='female', status='available')

    def allot_students(stu_list, available_rooms):
        for student in stu_list:
            if not available_rooms:
                break
            room = available_rooms[0]
            
            # Check if student is already allotted
            if HostelAllotment.objects.filter(student_id=student.register_number, status='active').exists():
                continue

            # Allot to this room
            allotment = HostelAllotment.objects.create(
                room=room,
                student_name=f"{student.first_name} {student.last_name}",
                student_id=student.register_number,
                contact=student.phone,
                allotment_date=datetime.date.today() - datetime.timedelta(days=random.randint(30, 300)),
                status='active'
            )

            # Generate some fees
            HostelFee.objects.get_or_create(
                allotment=allotment,
                month=datetime.date.today().strftime("%B %Y"),
                defaults={
                    'amount': 4500.00,
                    'due_date': datetime.date.today().replace(day=5),
                    'status': random.choice(['paid', 'pending', 'pending'])
                }
            )

            # Update room occupancy
            room.occupied += 1
            if room.occupied >= room.capacity:
                room.status = 'occupied'
                available_rooms = available_rooms[1:] # Move to next room
            room.save()

    allot_students(male_hostelers, list(male_rooms))
    allot_students(female_hostelers, list(female_rooms))

    print(f"Total Allotments active: {HostelAllotment.objects.filter(status='active').count()}")

if __name__ == '__main__':
    seed_hostel()
