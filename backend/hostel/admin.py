from django.contrib import admin
from .models import *

admin.site.register(HostelBlock)
admin.site.register(Room)
admin.site.register(HostelAllotment)
admin.site.register(HostelFee)
admin.site.register(Visitor)
admin.site.register(LeaveRequest)
admin.site.register(HostelComplaint)
admin.site.register(HostelApplication)
admin.site.register(HostelAttendance)