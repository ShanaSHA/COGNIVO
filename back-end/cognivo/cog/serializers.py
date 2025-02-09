from django.contrib.auth.models import User
from rest_framework import serializers
from cognivo.models import Task, StudySchedule, StudyGroup, ChatMessage, GroupInvitation, fileupload


###############User Authentication  ####################

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

############    Study Session ##############
# Serializer for Study Groups
class StudyGroupSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    members_count = serializers.IntegerField(source="members.count", read_only=True)

    class Meta:
        model = StudyGroup
        fields = ["id", "name", "description", "creator", "creator_username", "members", "members_count", "created_at"]

# Serializer for Invitations
class GroupInvitationSerializer(serializers.ModelSerializer):
    group_id = serializers.IntegerField(write_only=True)  # Ensure group_id is received

    class Meta:
        model = GroupInvitation
        fields = ["email", "group_id"]

###############     study scheduling & task management  ################

class StudyScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySchedule
        fields = ['id', 'title', 'start_date', 'end_date']

    def to_representation(self, instance):
        """ Modify output to match FullCalendar.js format """
        representation = super().to_representation(instance)
        representation['start'] = representation.pop('start_date')  # FullCalendar uses 'start'
        representation['end'] = representation.pop('end_date')  # FullCalendar uses 'end'
        representation['color'] = '#007bff'  # Blue for study sessions
        return representation


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'due_date', 'completed']

    def to_representation(self, instance):
        """ Modify output to match FullCalendar.js format """
        representation = super().to_representation(instance)
        representation['start'] = representation.pop('due_date')  # FullCalendar uses 'start'
        representation['color'] = '#28a745' if instance.completed else '#dc3545'  # Green for completed, Red for pending
        return representation

##############      chat    #################

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "sender", "sender_username", "group", "message", "timestamp"]

#############       file upload #############

class fileuploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = fileupload
        fields = '__all__'