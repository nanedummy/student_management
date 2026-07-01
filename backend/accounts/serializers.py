from rest_framework import serializers
from students.models import Student
from notifications.models import Notification
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password', 'linked_student']

    def validate(self, attrs):
        # We no longer require linked_student at registration for parents.
        if 'linked_student' in attrs:
            attrs['linked_student'] = None
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role', 'student'),
            password=validated_data['password'],
            linked_student=None,
            approval_status='pending'
        )
        # Notify admins
        Notification.objects.create(
            title='New User Registration',
            message=f"New {user.role} '{user.username}' has registered and is waiting for approval.",
            notif_type='alert',
            target='admin'  # Now admin is an explicit target
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.approval_status == 'pending':
            raise AuthenticationFailed('Waiting for approval from an administrator.')
        if self.user.approval_status == 'rejected':
            raise AuthenticationFailed('Your account registration was rejected.')
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role']               = user.role
        token['username']           = user.username
        token['email']              = user.email
        token['linked_student_id']  = user.linked_student_id
        token['is_super_admin']     = user.role == 'super_admin'
        return token
