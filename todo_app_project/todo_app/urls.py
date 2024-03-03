from . import views
from django.urls import path

app_name = "todo_app"

urlpatterns = [
        path("", views.tasks, name="tasks"),
		path("tasks_new", views.tasks_new, name="tasks_new"),
		path("tasklists", views.tasklists, name="tasklists"),
		path("tasklists/new", views.tasklists_new, name="tasklists_new")
]
