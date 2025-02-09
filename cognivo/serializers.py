from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from cognivo.models import Task,  StudyGroup, ChatMessage, GroupInvitation, FileUpload, StudySession
from django.contrib.auth.models import User

############### User Authentication ####################
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

############ Study Group & Invitations ##############
# Serializer for Study Groups
class StudyGroupSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    members_count = serializers.IntegerField(source="members.count", read_only=True)

    class Meta:
        model = StudyGroup
        fields = [
            "id", "name", "description", "creator", "creator_username",
            "members", "members_count", "created_at"
        ]

# Serializer for Group Invitations
class GroupInvitationSerializer(serializers.ModelSerializer):
    group_id = serializers.IntegerField(write_only=True)  # Ensures group_id is provided in the request

    class Meta:
        model = GroupInvitation
        fields = ["email", "group_id"]

############ Study Scheduling & Task Management ##############
class StudyScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ['id', 'title', 'start_date', 'end_date']

    def to_representation(self, instance):
        """
        Modify output to match FullCalendar.js format:
        - Rename 'start_date' to 'start'
        - Rename 'end_date' to 'end'
        - Set a default color for study sessions
        """
        representation = super().to_representation(instance)
        representation['start'] = representation.pop('start_date')
        representation['end'] = representation.pop('end_date')
        representation['color'] = '#007bff'  # Blue color for study sessions
        return representation

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"

############ Real-Time Chat ##############
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "sender", "sender_username", "group", "message", "timestamp"]

############ File Upload ##############
class fileuploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = '__all__'



class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")

class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ["id", "name", "description", "color","participants"]