# Generated by Django 3.2.19 on 2024-02-28 21:21

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('todo_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tasklist',
            name='user',
            field=models.ManyToManyField(related_name='task_list', to=settings.AUTH_USER_MODEL),
        ),
    ]
