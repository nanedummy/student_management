from django.contrib import admin

from .models import BookCategory, Book, BookIssue

admin.site.register(BookCategory)
admin.site.register(Book)
admin.site.register(BookIssue)