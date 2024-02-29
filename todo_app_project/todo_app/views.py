from django.shortcuts import render

# Create your views here.

def tasks(request):
    return render(request, "todo_app/tasks.html")

