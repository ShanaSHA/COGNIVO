from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404, redirect
from rest_framework import generics, permissions, viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from cognivo.models import StudyGroup, StudySchedule, Task, ChatMessage, GroupInvitation, fileupload
from .serializers import UserSerializer, StudyScheduleSerializer, \
    TaskSerializer, ChatMessageSerializer, GroupInvitationSerializer, StudyGroupSerializer, fileuploadSerializer


######### user Authentication   ##########
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


##############  Study Session   ##############
class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]  # ⬅️ This ensures only logged-in users can access

    def perform_create(self, serializer):
        if self.request.user.is_anonymous:
            raise serializers.ValidationError({"error": "User must be logged in."})
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=["POST"])
    def leave(self, request, pk=None):
        group = self.get_object()
        if request.user == group.creator:
            return Response({"error": "Creators cannot leave the group, only delete it."}, status=400)
        group.members.remove(request.user)
        return Response({"message": "You have left the group."}, status=200)

    @action(detail=True, methods=["DELETE"])
    def delete_group(self, request, pk=None):
        group = self.get_object()
        if request.user == group.creator:
            group.delete()
            return Response({"message": "Group deleted."}, status=200)
        return Response({"error": "Only the creator can delete the group."}, status=403)

class SendGroupInvitationView(generics.GenericAPIView):
    serializer_class = GroupInvitationSerializer
    permission_classes = [IsAuthenticated]  # Ensure user is logged in

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group_id = serializer.validated_data.get("group_id")
        if not group_id:
            return Response({"error": "group_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        group = get_object_or_404(StudyGroup, id=group_id)

        # Ensure sender is set
        sender = request.user

        # Generate Join Link
        join_url = f"http://yourdomain.com/join-group/{group.id}/"

        # Send Email
        subject = f"Join the Study Group: {group.name}"
        message = f"Hello,\n\nYou have been invited to join the study group '{group.name}'. Click the link below to join:\n\n{join_url}\n\nBest,\nCognivo"

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        # Save invitation
        GroupInvitation.objects.create(email=email, group=group, sender=sender)

        return Response({"message": "Invitation sent successfully"}, status=status.HTTP_200_OK)




###############     task management #################

class CalendarEventsView(APIView):
    """ API View to fetch schedules and tasks as calendar events """
    def get(self, request, *args, **kwargs):
        schedules = StudySchedule.objects.all()
        tasks = Task.objects.all()

        schedule_serializer = StudyScheduleSerializer(schedules, many=True)
        task_serializer = TaskSerializer(tasks, many=True)

        events = schedule_serializer.data + task_serializer.data  # Combine both

        return Response(events)

#############       real-time chat  #######################

class ChatViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("-timestamp")
    serializer_class = ChatMessageSerializer

    # API to get messages after a certain timestamp (for polling)
    @action(detail=False, methods=["GET"])
    def latest(self, request):
        last_timestamp = request.query_params.get("timestamp", "2000-01-01T00:00:00Z")
        messages = ChatMessage.objects.filter(timestamp__gt=last_timestamp).order_by("timestamp")
        return Response(ChatMessageSerializer(messages, many=True).data)


from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import StudyGroup

@login_required
def join_group(request, group_id):
    group = get_object_or_404(StudyGroup, id=group_id)
    user = request.user

    # Add user to group if not already a member
    if user not in group.members.all():
        group.members.add(user)

    return redirect("/")  # Redirect to the dashboard or study group page

#3###############       file upload #############
class FileUploadView(APIView):
    parser_classes = (MultiPartParser , FormParser)

    def post(self, request, *args, **kwargs):
        serializer = fileuploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        files = fileupload.objects.all()
        serializer = fileuploadSerializer(files, many=True)
        return Response(serializer.data)