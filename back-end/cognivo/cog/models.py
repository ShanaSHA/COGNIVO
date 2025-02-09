from django.contrib.auth.models import User
from django.db import models

from django.utils.timezone import now


# Study Group Model
class StudyGroup(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_groups")
    members = models.ManyToManyField(User, related_name="study_groups", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Invitation Model
class GroupInvitation(models.Model):
    email = models.EmailField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=False)  # Ensure sender is required
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE)
    is_accepted = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

##################################
class StudySchedule(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name="schedules")
    topic = models.CharField(max_length=255)
    deadline = models.DateTimeField()

    def __str__(self):
        return f"{self.topic} - {self.group.name}"

class Task(models.Model):
    schedule = models.ForeignKey(StudySchedule, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField()
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

#################      Reat-time chat  ###################

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey("StudyGroup", on_delete=models.CASCADE)  # Link to study group
    message = models.TextField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.sender.username}: {self.message[:20]}"

############        file upload ###############
class fileupload(models.Model):
    file=models.FileField(upload_to='uploads/')
    upload_at=models.DateTimeField(auto_now_add=True)