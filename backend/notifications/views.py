from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from accounts.permissions import IsAdmin


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'message', 'target']

    def get_permissions(self):
        if self.request.method in ('GET',):
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        target = self.request.query_params.get('target')
        active = self.request.query_params.get('active')
        user = self.request.user
        
        if user.role not in ('admin', 'super_admin'):
            user_target = user.role
            if user.role == 'student':
                user_target = 'students'
            elif user.role == 'parent':
                user_target = 'parents'
            elif user.role not in ('faculty', 'admin', 'super_admin'):
                user_target = 'staff'
            qs = qs.filter(target__in=['all', user_target])
        elif target: 
            qs = qs.filter(target__in=[target, 'all'])
            
        if active: qs = qs.filter(is_active=active == 'true')
        return qs

    @action(detail=False, methods=['delete'], permission_classes=[IsAdmin])
    def delete_all(self, request):
        Notification.objects.all().delete()
        return Response({'message': 'All notifications deleted'})

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.username)
