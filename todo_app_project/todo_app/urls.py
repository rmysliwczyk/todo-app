from . import views
from django.urls import path, include

app_name = "todo_app"

urlpatterns = [
        path("", views.tasks, name="tasks"),
        path("get_available_urls", views.get_available_urls, name="get_available_urls"),
        path("get_selected_tasklist_metadata", views.get_selected_tasklist_metadata, name="get_selected_tasklist_metadata"),
        path("api/tasklist/<int:tasklist_id>", views.tasklist, name="tasklist"),
        path("api/task/<int:task_id>", views.task, name="task"),
		path("tasks_new", views.tasks_new, name="tasks_new"),
		path("tasklists", views.tasklists, name="tasklists"),
		path("tasklists/new", views.tasklists_new, name="tasklists_new"),
		path("accounts/", include("django.contrib.auth.urls")),
		path("accounts/register_user", views.register_user, name="register_user"),
		path("error_message/<str:message>", views.error_message, name="error_message")
]
