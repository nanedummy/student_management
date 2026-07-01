from rest_framework import serializers
from .models import Subject, AcademicCalendar

class SubjectSerializer(serializers.ModelSerializer):
    class Meta: model = Subject; fields = '__all__'

class AcademicCalendarSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    subject_code = serializers.ReadOnlyField(source='subject.code')
    class Meta: model = AcademicCalendar; fields = '__all__'
