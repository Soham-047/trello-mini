from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from kanban import views

router = DefaultRouter()
router.register(r'workspaces', views.WorkspaceViewSet, basename='workspace')
router.register(r'boards', views.BoardViewSet, basename='board')
router.register(r'lists', views.ListViewSet, basename='list')
router.register(r'cards', views.CardViewSet, basename='card')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'activity', views.ActivityLogViewSet, basename='activity')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/login/', views.LoginView.as_view(), name='login'),
]
