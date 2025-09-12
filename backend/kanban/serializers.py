from rest_framework import serializers
from .models import Board, List, Card, Comment, ActivityLog, Workspace
from django.contrib.auth import get_user_model, authenticate
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "password")

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid username or password")

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','email','first_name','last_name')


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = '__all__'


class BoardSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Board
        fields = ('id','title','visibility','owner','members')


class ListSerializer(serializers.ModelSerializer):
    class Meta:
        model = List
        fields = ('id','board','title','position')


class CardSerializer(serializers.ModelSerializer):
    assignees = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Card
        fields = ('id','list','title','description','position','labels','assignees','due_date')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ('id','card','author','text','created_at')


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # shows username
    board = serializers.StringRelatedField(read_only=True)  # shows board title

    class Meta:
        model = ActivityLog
        fields = ("id", "board", "user", "action", "details", "created_at")