# backend/core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import CurrentUserView

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'exercises', views.ExerciseViewSet, basename='exercise')
router.register(r'workouts', views.WorkoutViewSet, basename='workout')
router.register(r'workoutsets', views.WorkoutSetViewSet, basename='workoutset')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
]