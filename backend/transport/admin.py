from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(Vehicle)
admin.site.register(TransportAllotment)
admin.site.register(Route)
