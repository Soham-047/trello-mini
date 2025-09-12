# kanban/views.py
from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import Workspace, Board, List, Card, Comment, ActivityLog
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    WorkspaceSerializer, BoardSerializer, ListSerializer,
    CardSerializer, CommentSerializer, ActivityLogSerializer
)

from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# ---------------------------
# Auth Views
# ---------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


# ---------------------------
# Workspace & Board Views
# ---------------------------
class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        board = serializer.save(owner=self.request.user)
        board.members.add(self.request.user)

    @action(detail=True, methods=["post"])
    def add_member(self, request, pk=None):
        board = self.get_object()
        user_id = request.data.get("user_id")
        user = get_object_or_404(User, id=user_id)
        board.members.add(user)
        ActivityLog.objects.create(
            board=board,
            action="member_added",
            user=request.user,
            details={"member": user.username}
        )
        return Response({"status": "member added"})


# ---------------------------
# List & Card Views
# ---------------------------
class ListViewSet(viewsets.ModelViewSet):
    queryset = List.objects.all()
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(position=1024)  # default start position


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        card = serializer.save(position=1024)
        ActivityLog.objects.create(
            board=card.list.board,
            action="card_created",
            user=self.request.user,
            details={"title": card.title}
        )


# ---------------------------
# Comment & Activity Views
# ---------------------------
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        ActivityLog.objects.create(
            board=comment.card.list.board,
            action="comment_added",
            user=self.request.user,
            details={"text": comment.text}
        )


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by("-created_at")
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
