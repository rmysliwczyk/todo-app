from . import views
from django.urls import path

app_name = "todo_app"

urlpatterns = [
        path("", views.tasks, name="tasks"),
]
