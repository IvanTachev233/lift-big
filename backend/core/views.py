from django.shortcuts import render
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import Exercise, Workout, WorkoutSet
from .serializers import UserSerializer, ExerciseSerializer, WorkoutSerializer, WorkoutSetSerializer

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Ensure user is logged in

    def get(self, request):
        serializer = UserSerializer(request.user) # request.user is populated by JWTAuthentication
        return Response(serializer.data)
    

# Provides list and detail views for users. Restricted to admin users.
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permissions_classes = [permissions.IsAdminUser]

# Allows authenticated users to manage their exercises
class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in

    def get_queryset(self):
        """ This view should return a list of all exercises for
            the currently authenticated user or standard exercises (owner=None).
        """
        user = self.request.user
        # Allows users to see their own exercises AND exercises with no owner
        return Exercise.objects.filter(Q(owner=user) | Q(owner__isnull=True))

    def perform_create(self, serializer):
        """ Ensure the user creating the exercise is set as the owner. """
        # Only allow users to create exercises for themselves (or set owner=None if logic allows)
        serializer.save(owner=self.request.user)


# Workout ViewSet
# Allows authenticated users to manage their workouts
class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """ This view should return a list of all workouts for
            the currently authenticated user.
        """
        # Filter workouts to only those owned by the logged-in user
        return Workout.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """ Ensure the user creating the workout is set as the user. """
        serializer.save(user=self.request.user)


# WorkoutSet ViewSet
# Allows authenticated users to manage sets within their workouts
class WorkoutSetViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """ This view should return a list of all workout sets belonging
            to the workouts owned by the currently authenticated user.
        """
        # Filter sets based on the owner of the parent workout
        return WorkoutSet.objects.filter(workout__user=self.request.user)

    def perform_create(self, serializer):
        # Add validation here if needed before saving
        workout_id = serializer.validated_data.get('workout').id
        if Workout.objects.get(id=workout_id).user != self.request.user:
            raise serializers.ValidationError("You can only add sets to your own workouts.")
        serializer.save()