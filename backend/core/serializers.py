# backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Exercise, Workout, WorkoutSet

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email'] 

class ExerciseSerializer(serializers.ModelSerializer):
    # Make owner field read-only in list/detail views, set automatically on create
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'body_part', 'owner']
        read_only_fields = ['owner'] # Owner shouldn't be set directly via API payload


class WorkoutSetSerializer(serializers.ModelSerializer):
    # Display exercise details instead of just ID
    exercise = ExerciseSerializer(read_only=True) # Uncomment if you want full exercise details here
    exercise_id = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), source='exercise', write_only=True) # Use this for creation/update

    class Meta:
        model = WorkoutSet
        fields = ['id', 'workout', 'exercise', 'exercise_id', 'reps', 'weight', 'notes']

class WorkoutSerializer(serializers.ModelSerializer):
    # Display related sets nested within the workout detail
    sets = WorkoutSetSerializer(many=True, read_only=True)

    # Make user field read-only, set automatically on create
    user = UserSerializer(read_only=True)

    class Meta:
        model = Workout
        fields = ['id', 'user', 'date', 'name', 'notes', 'sets']
        read_only_fields = ['user'] # User shouldn't be set directly via API payload

