from django.shortcuts import render, reverse, redirect
from .models import TaskList, Task
from django.contrib.auth.models import User
from django.forms import ModelForm

# Django Forms

class TaskListForm(ModelForm):
	class Meta:
		model = TaskList
		fields = {"name"}

class TaskForm(ModelForm):
	class Meta:
		model = Task
		fields = {"name"}

# Create your views here.

def tasks(request):
	# This form submitted when checkbox next to a task has changed value
	if request.method == "POST":
		task = Task.objects.get(id=request.POST["changed_task_id"])
		task.done = request.POST["changed_task_new_value"]
		task.save()

	# If no tasklist selected, nothing to show, so redirect to tasklist selection 
	if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
		return redirect(reverse("todo_app:tasklists"))

	# Get all of the tasks belonging to the selected tasklist
	tasks = Task.objects.filter(tasklist=TaskList.objects.get(id=request.session["selected_tasklist_id"]))

	# Pass on all of the tasks to the template
	return render(request, "todo_app/tasks.html", {"tasks":tasks})

def tasks_new(request):
	if request.method == "POST":
		# Get submitted task data 
		form = TaskForm(request.POST)
		if form.is_valid():
			new_task = form.save(commit=False)
			new_task.tasklist = TaskList.objects.get(id=request.session["selected_tasklist_id"])
			new_task.save()
			return redirect(reverse("todo_app:tasks"))
		else:
			# Pass the form again including error message
			return render(request, "todo_app/tasks_new.html", {"task_form":form})
	# Pass the form for the first time
	return render(request, "todo_app/tasks_new.html", {"task_form":TaskForm()})

def tasklists(request):
	# If there is no selected list yet, make room for one. 
	if "selected_tasklist_id" not in request.session:
		request.session["selected_tasklist_id"] = None	

	# If we select a task list from the list this will be true. So not true on first entry.
	if request.method == "POST":
		# Set the active tasklist
		request.session["selected_tasklist_id"] = request.POST["selected_tasklist_id"]
		# Redirect to see tasks inside tasklist
		return redirect(reverse("todo_app:tasks"))	

	# Identify all of the lists assigned to this user
	this_user = request.user
	tasklists = TaskList.objects.filter(user=this_user.id)
	
	# Pass on all of the gathered task lists to the template
	return render(request, "todo_app/tasklists.html", {"tasklists":tasklists})


def tasklists_new(request):
	if request.method == "POST":
		# Get submitted form data
		form = TaskListForm(request.POST)
		if form.is_valid():
			new_tasklist = form.save(commit=False)
			new_tasklist.user = request.user	
			new_tasklist.save()
			return redirect(reverse("todo_app:tasklists"))
		else:
			# Pass the form again including error message
			return render(request, "todo_app/tasklists_new.html", {"tasklist_form":form})
	# Pass the form for the first time
	return render(request, "todo_app/tasklists_new.html", {"tasklist_form":TaskListForm()})

