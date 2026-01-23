# backend/core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"exercises", views.ExerciseViewSet, basename="exercise")
router.register(r"workouts", views.WorkoutViewSet, basename="workout")
router.register(r"saved-workouts", views.SavedWorkoutViewSet, basename="saved-workout")
router.register(r"workoutsets", views.WorkoutSetViewSet, basename="workoutset")

urlpatterns = [
    path("users/me/", views.CurrentUserView.as_view(), name="current-user"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path("fitbit/connect/", views.FitbitConnectView.as_view(), name="fitbit-connect"),
    path("fitbit/callback/", views.FitbitCallbackView.as_view(), name="fitbit-callback"),
    path("fitbit/data/", views.FitbitDataView.as_view(), name="fitbit-data"),
    path("", include(router.urls)),
]
