from django.db import models
from students.models import Student


class AttendanceSession(models.Model):
    date        = models.DateField()
    course      = models.CharField(max_length=100)
    department  = models.CharField(max_length=100, blank=True)
    subject     = models.CharField(max_length=100, blank=True)
    faculty_name = models.CharField(max_length=200, blank=True)
    period      = models.PositiveIntegerField(default=1)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('date', 'course', 'period')

    def __str__(self):
        return f"{self.date} | {self.course} | Period {self.period}"


class StudentAttendance(models.Model):
    STATUS = [('present', 'Present'), ('absent', 'Absent'), ('late', 'Late'), ('excused', 'Excused')]
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    status  = models.CharField(max_length=10, choices=STATUS, default='present')
    remarks = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student} - {self.session.date} ({self.status})"

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=StudentAttendance)
def update_student_attendance_pct(sender, instance, **kwargs):
    student = instance.student
    records = StudentAttendance.objects.filter(student=student)
    total = records.count()
    if total > 0:
        attended = records.filter(status__in=['present', 'late', 'excused']).count()
        student.attendance_percentage = round((attended / total) * 100, 2)
    else:
        student.attendance_percentage = None
    student.save(update_fields=['attendance_percentage'])
