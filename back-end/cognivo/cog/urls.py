from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, CalendarEventsView, StudyGroupViewSet, SendGroupInvitationView, join_group, \
    FileUploadView

router = DefaultRouter()
router.register(r'groups', StudyGroupViewSet, basename='studygroup')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('calendar/events/', CalendarEventsView.as_view(), name='calendar-events'),
    path("join-group/<int:group_id>/", join_group, name="join-group"),
    path("invitations/", SendGroupInvitationView.as_view(), name="send-invitation"),
    path('upload/',FileUploadView.as_view(),name='upload_file'),
]
