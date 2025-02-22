from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import TaskList, Task

# Register your models here.

# Inlines
class TaskInline(admin.TabularInline):
	model = Task

class TaskListInline(admin.TabularInline):
	model = TaskList

# ModelAdmins
class TaskListAdmin(admin.ModelAdmin):
	list_display = ["name", "date"]
	inlines = [TaskInline]

class UserAdmin(BaseUserAdmin):
	inlines = [TaskListInline]

admin.site.register(TaskList, TaskListAdmin)
admin.site.register(Task)

# Re-registering the UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)



