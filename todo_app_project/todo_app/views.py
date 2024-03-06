from .models import TaskList, Task
from django.shortcuts import render, reverse, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.core.exceptions import ObjectDoesNotExist
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

# Account management views
def register_user(request):
	if request.method == "POST":
		form = UserCreationForm(request.POST)
		if form.is_valid():
			new_user = form.save()
			login(request, new_user) 
			return redirect(reverse("todo_app:tasks"))
		else:
			return render(request, "registration/register_user.html", {"form":form})
	return render(request, "registration/register_user.html", {"form":UserCreationForm()})

# Other views

def error_message(request, message):
	return render(request, "todo_app/error_message.html", {"message":message})


@login_required
def tasks(request):
	# Default is not edit mode
	request.session["edit_mode"] = False;

	# This form submitted when checkbox next to a task has changed value
	if request.method == "POST":
		if "remove_form" in request.POST:
			task_to_remove = Task.objects.get(id=request.POST["task_id"])
			task_to_remove.delete()
		elif "change_form" in request.POST:
			task = Task.objects.get(id=request.POST["changed_task_id"])
			task.done = request.POST["changed_task_new_value"]
			task.save()
	if "edit_mode" in request.GET and request.GET["edit_mode"] == "on":
		request.session["edit_mode"] = True;
	# If no tasklist selected, nothing to show, so redirect to tasklist selection 
	if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
		return redirect(reverse("todo_app:tasklists"), error_message="First select a tasklist")

	# Get all of the tasks belonging to the selected tasklist
	tasks = Task.objects.filter(tasklist=get_selected_tasklist(request))
	# Pass on all of the tasks to the template
	return render(request, "todo_app/tasks.html", {"tasks":tasks, "selected_tasklist":get_selected_tasklist(request), "edit_mode":request.session["edit_mode"]})


@login_required 
def tasks_new(request):
	# Make sure that there is an active tasklist
	if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
		return redirect("todo_app:error_message", message="First select a tasklist")

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
			return render(request, "todo_app/tasks_new.html", {"task_form":form, "selected_tasklist":get_selected_tasklist(request)})
	# Pass the form for the first time
	return render(request, "todo_app/tasks_new.html", {"task_form":TaskForm(), "selected_tasklist":get_selected_tasklist(request)})


@login_required
def tasklists(request):
	#Default is not edit mode
	request.session["edit_mode"] = False

	# If there is no selected list yet, make room for one. 
	if "selected_tasklist_id" not in request.session:
		request.session["selected_tasklist_id"] = None	

	# If we select a task list from the list or remove one this will be true. So not true on first entry.
	if request.method == "POST":
		if "remove_form" in request.POST:
			tasklist_to_remove = TaskList.objects.get(id=request.POST["tasklist_id"])
			tasklist_to_remove.delete()
		else:
			print("Here?")
			# Set the active tasklist
			request.session["selected_tasklist_id"] = request.POST["selected_tasklist_id"]
			# Redirect to see tasks inside tasklist
			return redirect(reverse("todo_app:tasks"))	

	if "edit_mode" in request.GET and request.GET["edit_mode"] == "on":
		request.session["edit_mode"] = True;

	# Identify all of the lists assigned to this user
	this_user = request.user
	tasklists = TaskList.objects.filter(user=this_user.id)
	
	# Pass on all of the gathered task lists to the template
	return render(request, "todo_app/tasklists.html", {"tasklists":tasklists, "selected_tasklist":get_selected_tasklist(request), "edit_mode":request.session["edit_mode"]})


@login_required
def tasklists_new(request):
	if request.method == "POST":
		# Get submitted form data
		form = TaskListForm(request.POST)
		if form.is_valid():
			new_tasklist = form.save(commit=False)
			new_tasklist.user = request.user	
			new_tasklist.save()
			request.session["selected_tasklist_id"] = new_tasklist.id
			return redirect(reverse("todo_app:tasks"))
		else:
			# Pass the form again including error message
			return render(request, "todo_app/tasklists_new.html", {"tasklist_form":form, "selected_tasklist":get_selected_tasklist(request)})
	# Pass the form for the first time
	return render(request, "todo_app/tasklists_new.html", {"tasklist_form":TaskListForm(), "selected_tasklist":get_selected_tasklist(request)})


# Helper functions

def get_selected_tasklist(request):
	if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
		return None
	else:
		try: 
			selected_tasklist = TaskList.objects.get(id=request.session["selected_tasklist_id"])
		except ObjectDoesNotExist as e:
			selected_tasklist = None
		return selected_tasklist


