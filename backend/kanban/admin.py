from django.contrib import admin
from .models import Workspace, Board, List, Card, Comment, ActivityLog

# Registering all models in Django admin
admin.site.register(Workspace)
admin.site.register(Board)
admin.site.register(List)
admin.site.register(Card)
admin.site.register(Comment)
admin.site.register(ActivityLog)
