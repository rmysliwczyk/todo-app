from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class TaskList(models.Model):
	name = models.CharField(max_length=64)
	date = models.DateField(auto_now=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasklist")
		
	def __str__(self):
		return f"{self.name}: {self.date}"

class Task(models.Model):
	name = models.CharField(max_length=64)
	done = models.BooleanField(default=False)
	tasklist = models.ForeignKey(TaskList, on_delete=models.CASCADE, related_name="tasks")
	
	def __str__(self):
		return f"{self.name}: from {self.tasklist.name}"

	
