from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Workspace(models.Model):
    name = models.CharField(max_length=200)
    owners = models.ManyToManyField(User, related_name='owned_workspaces')


class Board(models.Model):
    title = models.CharField(max_length=200)
    workspace = models.ForeignKey(Workspace, null=True, blank=True, on_delete=models.CASCADE)
    visibility = models.CharField(max_length=20, choices=(('private','private'),('workspace','workspace')),
    default='private')
    members = models.ManyToManyField(User, related_name='boards')
    owner = models.ForeignKey(User, related_name='owned_boards', on_delete=models.CASCADE)


class List(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='lists')
    title = models.CharField(max_length=200)
    position = models.BigIntegerField(db_index=True, default=1024)

    class Meta:
        ordering = ['position']


class Card(models.Model):
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='cards')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    position = models.BigIntegerField(db_index=True, default=1024)
    labels = models.JSONField(default=list, blank=True) # simple labels array
    assignees = models.ManyToManyField(User, blank=True, related_name='assigned_cards')
    due_date = models.DateTimeField(null=True, blank=True)


    class Meta:
        ordering = ['position']


class Comment(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class ActivityLog(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='activities')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    verb = models.CharField(max_length=100)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
