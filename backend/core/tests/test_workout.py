from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Workout

class WorkoutAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)
        self.workout_url = reverse('workout-list')  # Assuming basename='workout'

    def test_create_workout_without_exercises(self):
        """
        Ensure we can create a workout without providing exercise_ids.
        """
        data = {
            'name': 'Empty Workout',
            'notes': 'Just testing',
            # 'exercise_ids' is omitted
        }
        response = self.client.post(self.workout_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.count(), 1)
        workout = Workout.objects.get()
        self.assertEqual(workout.name, 'Empty Workout')
        self.assertEqual(workout.exercises.count(), 0)

    def test_create_workout_with_empty_exercises_list(self):
        """
        Ensure we can create a workout with an empty list of exercise_ids.
        """
        data = {
            'name': 'Empty List Workout',
            'exercise_ids': []
        }
        response = self.client.post(self.workout_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.count(), 1)
