from rest_framework import serializers
from .models import AttendanceSession, StudentAttendance

class AttendanceSessionSerializer(serializers.ModelSerializer):
    records_count = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()
    def get_records_count(self, obj): return obj.records.count()
    def get_present_count(self, obj): return obj.records.filter(status='present').count()
    class Meta: model = AttendanceSession; fields = '__all__'

class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.__str__', read_only=True)
    session_date = serializers.DateField(source='session.date', read_only=True)
    subject = serializers.CharField(source='session.subject', read_only=True)
    class Meta: model = StudentAttendance; fields = '__all__'
