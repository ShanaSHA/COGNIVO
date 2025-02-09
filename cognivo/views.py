from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404, redirect
from django.conf import settings
from django.contrib.auth.models import User

from rest_framework import generics, permissions, viewsets, serializers, status
from rest_framework.decorators import action, api_view
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, Token

from cognivo.models import (
    StudyGroup, Task, ChatMessage,
    GroupInvitation, FileUpload,
    StudySession)
from cognivo.serializers import (
    UserSerializer, StudyGroupSerializer, StudyScheduleSerializer,
    TaskSerializer, ChatMessageSerializer, GroupInvitationSerializer,
    fileuploadSerializer,
    StudySessionSerializer)

#############################################
# 1. User Authentication (Registration)
#############################################

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
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

#############################################
# 2. Study Group & Sessions Management
#############################################

class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.is_anonymous:
            raise serializers.ValidationError({"error": "User must be logged in."})
        # Save the study group with the logged-in user as the creator and initial member.
        group = serializer.save(creator=self.request.user)
        group.members.add(self.request.user)

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


class CreateSessionView(generics.CreateAPIView):
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer

    def perform_create(self, serializer):
        session = serializer.save()

        # Get participant emails
        participant_emails = self.request.data.get("participants", [])

        if participant_emails:
            join_link = f"http://yourfrontend.com/sessions/{session.id}/join"
            subject = f"You're Invited to Join {session.name}"
            message = f"""
            Hello!

            You have been invited to join the study session: {session.name}.
            Description: {session.description}

            Click the link below to join:
            {join_link}

            Happy studying!
            """
            sender = settings.EMAIL_HOST_USER

            try:
                send_mail(subject, message, sender, participant_emails, fail_silently=False)
                return Response({"message": "Session created and invitations sent!"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#############################################
# 3. Calendar Events for Schedules & Tasks
#############################################

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

class TaskDeleteView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


#############################################
# 4. Real-Time Chat via Polling
#############################################

class ChatViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("-timestamp")
    serializer_class = ChatMessageSerializer

    @action(detail=False, methods=["GET"])
    def latest(self, request):
        last_timestamp = request.query_params.get("timestamp", "2000-01-01T00:00:00Z")
        messages = ChatMessage.objects.filter(timestamp__gt=last_timestamp).order_by("timestamp")
        return Response(ChatMessageSerializer(messages, many=True).data)


#############################################
# 5. Join Group View (Function-based)
#############################################

@login_required
def join_group(request, group_id):
    group = get_object_or_404(StudyGroup, id=group_id)
    if request.user not in group.members.all():
        group.members.add(request.user)
    return redirect("/")  # Redirect to your dashboard or home page


#############################################
# 6. File Upload
#############################################

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = fileuploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        files = FileUpload.objects.all()
        serializer = fileuploadSerializer(files, many=True)
        return Response(serializer.data)

from rest_framework.authtoken.models import Token


class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            # Find the user by email
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate using the username since the default backend uses 'username'
        user = authenticate(username=user_obj.username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Delete the token associated with the current user
        try:
            # Assuming one token per user
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            pass
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)

@api_view(["POST"])
def create_session(request):
    print("Received data:", request.data)  # Debugging: Print request data in console
    serializer = StudySessionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print("Errors:", serializer.errors)  # Debugging: Print errors in console
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)