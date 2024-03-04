from . import views
from django.urls import path, include

app_name = "todo_app"

urlpatterns = [
        path("", views.tasks, name="tasks"),
		path("tasks_new", views.tasks_new, name="tasks_new"),
		path("tasklists", views.tasklists, name="tasklists"),
		path("tasklists/new", views.tasklists_new, name="tasklists_new"),
		path("accounts/", include("django.contrib.auth.urls")),
		path("accounts/register_user", views.register_user, name="register_user"),
		path("error_message/<str:message>", views.error_message, name="error_message")
]
