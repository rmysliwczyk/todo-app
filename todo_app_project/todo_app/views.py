from .models import TaskList, Task
from django.shortcuts import render, reverse, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.core.exceptions import ObjectDoesNotExist
from django.forms import ModelForm
from django.http import JsonResponse, HttpResponse
import json

# CODE CLEANING TODO:
# Selected tasklist checks are to use get_selected_tasklist()

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

# API Endpoints

# From a tasklist matching the provided tasklist_id get all tasks or one task if task_id is also provided.

def get_available_urls(request):
	"""This endpoint exposes needed and available django view urls to my javascript files"""
	available_urls = {
		"tasklists": reverse("todo_app:tasklists_page"),
		"tasks": reverse("todo_app:tasks_page")
	}
	print(available_urls)
	return JsonResponse(available_urls)

@login_required
def select_tasklist(request, tasklist_id=None):
	request.session["selected_tasklist_id"] = tasklist_id
	response = HttpResponse("Updated selected tasklist id")
	response.status_code = 200
	return response

@login_required
def tasklists(request, tasklist_id=None):
	if tasklist_id == None:
		# Treating request as a request for collection
		if request.method == "GET":
			# Try to get the requested tasklists
			try:
				tasklists = TaskList.objects.filter(user=request.user)
			except ObjectDoesNotExist:
				response = HttpResponse("Not found: Requested tasklists not found")
				response.status_code = 404
				return response
			
			# If successful, we get all tasklists
			tasklists = tasklists.values()
			tasklists = order_by(tasklists, request.session["tasklists_order_by"])

			# Converting to list is needed for JsonResponse to serialize data.
			tasklists = list(tasklists)

			return JsonResponse(tasklists, safe=False)
	else:
		# Treating request as a request for single item
		if request.method == "GET":
			# Try to get the requested tasklist
			try:
				tasklist = TaskList.objects.get(id=tasklist_id)
			except ObjectDoesNotExist:
				response = HttpResponse("Not found: Requested tasklist was not found")
				response.status_code = 404
				return response

			if tasklist.user == request.user:
				# This is to get tasklist in format that allows for JSON serialization
				tasklist = list(TaskList.objects.filter(id=tasklist_id).values())
				return JsonResponse(tasklist, safe=False)
			else:
				response = HttpResponse("Forbidden: You can't view this tasklist")
				response.status_code = 403
				return response
		elif request.method == "PUT":
			"""Update the state of the tasklist and return updated tasklist"""
			received_tasklist = json.loads(request.body)
			tasklist = TaskList.objects.get(id=received_tasklist["id"])
			if tasklist.user != request.user:
				response = HttpResponse("Forbidden: You are not the owner of this tasklist")
				response.status_code = 403
				return response
			elif received_tasklist["id"] != tasklist_id:
				response = HttpResponse("Bad request: The tasklist id in json body doesn't match the tasklist id in URL")
				response.status_code = 400
				return response
			else:
				tasklist.name = received_tasklist["name"]
				tasklist.date = received_tasklist["date"]
				tasklist.tasks.set(Task.objects.filter(tasklist=tasklist))
			tasklist.save()

			# This is to get tasklist in format that allows for JSON serialization
			tasklist = list(TaskList.objects.filter(id=tasklist_id).values())

			return JsonResponse(tasklist, safe=False)
		elif request.method == "DELETE":
			"""Remove the tasklist with tasklist_id"""
			tasklist = TaskList.objects.get(id=tasklist_id)
			if tasklist.user != request.user:
				response = HttpResponse("Forbidden: You are not the owner of this tasklist")
				response.status_code = 403
				return response
			else:
				if "selected_tasklist_id" in request.session and request.session["selected_tasklist_id"] != None:
					if tasklist_id == request.session["selected_tasklist_id"]:
						request.session["selected_tasklist_id"] = None
				tasklist.delete()
			response = HttpResponse()
			response.status_code = 200
			return response
	

@login_required
def tasks(request, task_id=None):
	if task_id == None:
		# Treating request as a request for collection
		if request.method == "GET":
			# Check if a tasklist is selected
			if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
					response = HttpResponse("Bad request: Tasklist not selected. Can't get tasks without selecting a tasklist first")
					response.status_code = 400
					return response
			
			# Try to get the requested tasklist
			try:
				tasklist = TaskList.objects.get(id=request.session["selected_tasklist_id"])
			except ObjectDoesNotExist:
				response = HttpResponse("Not found: Requested tasklist was not found")
				response.status_code = 404
				return response
			
			# If successful, we get all tasks from the tasklist.
			tasks = tasklist.tasks.values()
			tasks = order_by(tasks, request.session["tasks_order_by"])

			# Converting to list is needed for JsonResponse to serialize data.
			tasks = list(tasks)

			# If user is the owner of the tasklist send it as JsonResponse or send 403 forbidden if not
			if tasklist.user == request.user:
				return JsonResponse(tasks, safe=False)
			else:
				response = HttpResponse("Forbidden: You can't view this tasklist")
				response.status_code = 403
				return response
	else:
		# Treating request as a request for single item
		if request.method == "GET":
			# Try to get the requested task
			try:
				task = Task.objects.get(id=task_id)
			except ObjectDoesNotExist:
				response = HttpResponse("Not found: Requested task was not found")
				response.status_code = 404
				return response

			if task.tasklist.user == request.user:
				# This is to get task in format that allows for JSON serialization
				task = list(Task.objects.filter(id=task_id).values())
				return JsonResponse(task, safe=False)
			else:
				response = HttpResponse("Forbidden: You can't view this tasklist")
				response.status_code = 403
				return response
		elif request.method == "PUT":
			"""Update the state of the task and return updated task"""
			received_task = json.loads(request.body)
			task = Task.objects.get(id=received_task["id"])
			if task.tasklist.user != request.user:
				response = HttpResponse("Forbidden: You are not the owner of this tasklist")
				response.status_code = 403
				return response
			elif received_task["id"] != task_id:
				response = HttpResponse("Bad request: The task id in json body doesn't match the task id in URL")
				response.status_code = 400
				return response
			else:
				task.name = received_task["name"]
				task.done = received_task["done"]
				task.tasklist = TaskList.objects.get(id=received_task["tasklist_id"])
			task.save()

			# This is to get task in format that allows for JSON serialization
			task = list(Task.objects.filter(id=task_id).values())

			return JsonResponse(task, safe=False)
		elif request.method == "DELETE":
			"""Remove the task with task_id"""
			task = Task.objects.get(id=task_id)
			if task.tasklist.user != request.user:
				response = HttpResponse("Forbidden: You are not the owner of this tasklist")
				response.status_code = 403
				return response
			else:
				task.delete()
			response = HttpResponse()
			response.status_code = 200
			return response
	

@login_required
def get_selected_tasklist_metadata(request):
	"""Get current selected tasklist id from django session data"""
	selected_tasklist_metadata = {
		"name": None,
		"id": None
	}
	if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
		return JsonResponse(selected_tasklist_metadata)
	else:
		print(request.session["selected_tasklist_id"])
		tasklist = TaskList.objects.get(id=request.session["selected_tasklist_id"])
		selected_tasklist_metadata["id"] = tasklist.id
		selected_tasklist_metadata["name"] = tasklist.name
		return JsonResponse(selected_tasklist_metadata)


# End of API Endpoints

# Account management views
def register_user(request):
	if request.method == "POST":
		form = UserCreationForm(request.POST)
		if form.is_valid():
			new_user = form.save()
			login(request, new_user) 
			return redirect(reverse("todo_app:tasks_page"))
		else:
			return render(request, "registration/register_user.html", {"form":form})
	return render(request, "registration/register_user.html", {"form":UserCreationForm()})

# Other views

def error_message(request, message):
	return render(request, "todo_app/error_message.html", {"message":message})


@login_required
def tasks_page(request):
	# Get all of the tasks belonging to the selected tasklist
	tasks = Task.objects.filter(tasklist=get_selected_tasklist(request))
	
	# Default is not edit mode
	request.session["edit_mode"] = False;

	if "tasks_order_by" not in request.session:
		request.session["tasks_order_by"] = "id"

	# This form submitted when checkbox next to a task has changed value
	if request.method == "POST":
		if "remove_form" in request.POST:
			task_to_remove = Task.objects.get(id=request.POST["task_id"])
			task_to_remove.delete()
		elif "change_form" in request.POST:
			task = Task.objects.get(id=request.POST["changed_task_id"])
			task.done = request.POST["changed_task_new_value"]
			task.save()
	else:
		if "edit_mode" in request.GET and request.GET["edit_mode"] == "on":
			request.session["edit_mode"] = True;
		if "order_by" in request.GET:
			request.session["tasks_order_by"] = request.GET["order_by"]
	
	tasks = order_by(tasks, request.session["tasks_order_by"])

	# If no tasklist selected, nothing to show, so redirect to tasklist selection 
	if "selected_tasklist_id" not in request.session or request.session["selected_tasklist_id"] == None:
		return redirect(reverse("todo_app:tasklists_page"), error_message="First select a tasklist")


	# Pass on all of the tasks to the template
	return render(request, "todo_app/tasks.html", {"tasks":tasks, "selected_tasklist":get_selected_tasklist(request), "edit_mode":request.session["edit_mode"], "tasks_order_by":request.session["tasks_order_by"]})


@login_required 
def tasks_new(request):
	# Make sure that there is an active tasklist
	if get_selected_tasklist(request) == None: 
		return redirect("todo_app:error_message", message="First select a tasklist")

	if request.method == "POST":
		# Get submitted task data 
		form = TaskForm(request.POST)
		if form.is_valid():
			new_task = form.save(commit=False)
			new_task.tasklist = TaskList.objects.get(id=request.session["selected_tasklist_id"])
			new_task.save()
			return redirect(reverse("todo_app:tasks_page"))
		else:
			# Pass the form again including error message
			return render(request, "todo_app/tasks_new.html", {"task_form":form, "selected_tasklist":get_selected_tasklist(request)})
			
	# Pass the form for the first time
	return render(request, "todo_app/tasks_new.html", {"task_form":TaskForm(), "selected_tasklist":get_selected_tasklist(request)})


@login_required
def tasklists_page(request):
	# Identify all of the lists assigned to this user
	this_user = request.user
	tasklists = TaskList.objects.filter(user=this_user.id)

	#Start in regular mode, not edit mode
	request.session["edit_mode"] = False
	
	if "tasklists_order_by" not in request.session:
		request.session["tasklists_order_by"] = "name"	

	# If there is no selected list yet, make room for one. 
	if "selected_tasklist_id" not in request.session:
		request.session["selected_tasklist_id"] = None	

	if request.method == "POST":
		if "remove_form" in request.POST:
			tasklist_to_remove = TaskList.objects.get(id=request.POST["tasklist_id"])
			tasklist_to_remove.delete()
		else:
			request.session["selected_tasklist_id"] = request.POST["selected_tasklist_id"]
			return redirect(reverse("todo_app:tasks_page"))	
	else:
		if "edit_mode" in request.GET and request.GET["edit_mode"] == "on":
			request.session["edit_mode"] = True;
		if "order_by" in request.GET:
			request.session["tasklists_order_by"] = request.GET["order_by"]	

	tasklists = order_by(tasklists, request.session["tasklists_order_by"])
	return render(request, "todo_app/tasklists.html", {"tasklists":tasklists, "selected_tasklist":get_selected_tasklist(request), "edit_mode":request.session["edit_mode"], "tasklists_order_by":request.session["tasklists_order_by"]})


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
			return redirect(reverse("todo_app:tasks_page"))
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

def order_by(objects, order_type):
	match order_type:
				case "name":
					objects = objects.order_by("name")
				case "name_rev":
					objects = objects.order_by("name").reverse()
				case "date":
					objects = objects.order_by("date")
				case "date_rev":
					objects = objects.order_by("date").reverse()
				case "id":
					objects = objects.order_by("id")
				case "id_rev":
					objects = objects.order_by("id").reverse()
				case _:
					pass
	return objects
