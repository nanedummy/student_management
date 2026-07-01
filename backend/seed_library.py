import os
import django
from datetime import date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from library.models import BookCategory, Book, BookIssue
from students.models import Student

def seed_library():
    print("Seeding Library Data...")

    # 1. Categories
    categories = [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Literature",
        "Engineering",
        "History",
        "Business & Management"
    ]
    
    cat_objs = []
    for c in categories:
        obj, _ = BookCategory.objects.get_or_create(name=c)
        cat_objs.append(obj)
    
    print(f"Created {len(cat_objs)} Categories.")

    # 2. Books
    books_data = [
        {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "isbn": "9780262033848", "category": "Computer Science", "copies": 15, "rack": "CS-01"},
        {"title": "Clean Code", "author": "Robert C. Martin", "isbn": "9780132350884", "category": "Computer Science", "copies": 10, "rack": "CS-02"},
        {"title": "Calculus: Early Transcendentals", "author": "James Stewart", "isbn": "9781285741550", "category": "Mathematics", "copies": 20, "rack": "MATH-01"},
        {"title": "Fundamentals of Physics", "author": "David Halliday", "isbn": "9781118230718", "category": "Physics", "copies": 12, "rack": "PHY-01"},
        {"title": "The Pragmatic Programmer", "author": "Andrew Hunt", "isbn": "9780201616224", "category": "Computer Science", "copies": 8, "rack": "CS-03"},
        {"title": "Design Patterns", "author": "Erich Gamma", "isbn": "9780201633610", "category": "Computer Science", "copies": 5, "rack": "CS-04"},
        {"title": "Advanced Engineering Mathematics", "author": "Erwin Kreyszig", "isbn": "9780470458365", "category": "Engineering", "copies": 25, "rack": "ENG-01"},
        {"title": "Principles of Marketing", "author": "Philip Kotler", "isbn": "9780134492513", "category": "Business & Management", "copies": 10, "rack": "BUS-01"},
        {"title": "A Brief History of Time", "author": "Stephen Hawking", "isbn": "9780553380163", "category": "Physics", "copies": 7, "rack": "PHY-02"},
        {"title": "1984", "author": "George Orwell", "isbn": "9780451524935", "category": "Literature", "copies": 15, "rack": "LIT-01"},
    ]

    book_objs = []
    for b in books_data:
        cat = BookCategory.objects.get(name=b["category"])
        book, created = Book.objects.get_or_create(
            isbn=b["isbn"],
            defaults={
                "title": b["title"],
                "author": b["author"],
                "category": cat,
                "total_copies": b["copies"],
                "available_copies": b["copies"],
                "rack_number": b["rack"],
                "status": "available"
            }
        )
        # Update available copies if it was already created, just in case
        if not created:
            book.title = b["title"]
            book.author = b["author"]
            book.category = cat
            book.total_copies = b["copies"]
            book.rack_number = b["rack"]
            book.save()
        book_objs.append(book)
    
    print(f"Created {len(book_objs)} Books.")

    # 3. Book Issues
    students = list(Student.objects.all())
    
    # Let's create some dummy issues if we have students and books
    if students and book_objs:
        issues_created = 0
        today = date.today()
        
        # We will issue 10 books randomly
        for i in range(10):
            student = random.choice(students)
            book = random.choice(book_objs)
            
            if book.available_copies > 0:
                # Randomize if it's currently issued, overdue or returned
                status_choice = random.choice(['issued', 'returned', 'overdue'])
                
                if status_choice == 'issued':
                    issue_date = today - timedelta(days=random.randint(1, 10))
                    due_date = issue_date + timedelta(days=14)
                    return_date = None
                    fine = 0
                    book.available_copies -= 1
                elif status_choice == 'overdue':
                    issue_date = today - timedelta(days=random.randint(20, 30))
                    due_date = issue_date + timedelta(days=14)
                    return_date = None
                    fine = (today - due_date).days * 10  # 10 Rs per day fine
                    book.available_copies -= 1
                else: # returned
                    issue_date = today - timedelta(days=random.randint(15, 30))
                    due_date = issue_date + timedelta(days=14)
                    return_date = issue_date + timedelta(days=random.randint(5, 14))
                    fine = 0
                
                BookIssue.objects.create(
                    book=book,
                    member_name=f"{student.first_name} {student.last_name}",
                    member_type='student',
                    member_id=student.roll_number,
                    issue_date=issue_date,
                    due_date=due_date,
                    return_date=return_date,
                    fine_amount=fine,
                    status=status_choice
                )
                book.save()
                issues_created += 1

        print(f"Created {issues_created} Book Issues.")

    print("Data seeded successfully!")

if __name__ == '__main__':
    seed_library()
