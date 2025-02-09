# cognivo/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, StudyGroupViewSet, CreateSessionView,
    ChatViewSet, join_group, FileUploadView,
    LoginView, LogoutView, create_session, TaskListCreateView, TaskDeleteView)

router = DefaultRouter()
#router.register(r'sessions', StudyGroupViewSet, basename='session')
router.register(r'chat', ChatViewSet, basename='chat')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('invitations/', CreateSessionView.as_view(), name='send_invitation'),
    #path('calendar/events/', CalendarEventsView.as_view(), name='calendar_events'),
    path('join-group/<int:group_id>/', join_group, name='join_group'),
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("api/sessions/", create_session, name="create-session"),
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDeleteView.as_view(), name='task-delete'),

]
