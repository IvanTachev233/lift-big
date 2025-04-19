# backend/core/tests.py (or core/tests/test_views.py)

from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Exercise

# APITestCase includes APIClient as self.client
class ExerciseAPITests(APITestCase):

    def setUp(self):
        # Runs before each test method
        # Create necessary objects for tests
        self.test_user = User.objects.create_user(username='testuser', password='password123')
        self.exercise_data = {'name': 'Test Squat', 'body_part': 'LG'}
        self.exercise_list_url = reverse('exercise-list') # Assumes basename='exercise' in router

    def test_create_exercise_authenticated(self):
        """
        Ensure authenticated users can create a new exercise object.
        """
        # Force login as the test user
        self.client.force_authenticate(user=self.test_user)

        # Make POST request
        response = self.client.post(self.exercise_list_url, self.exercise_data, format='json')

        # Check assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Exercise.objects.count(), 1)
        self.assertEqual(Exercise.objects.get().name, 'Test Squat')
        self.assertEqual(Exercise.objects.get().owner, self.test_user) # Check owner was set

    def test_create_exercise_unauthenticated(self):
        """
        Ensure unauthenticated users cannot create an exercise object.
        """
        # DO NOT authenticate the client

        # Make POST request
        response = self.client.post(self.exercise_list_url, self.exercise_data, format='json')

        # Check assertions
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Exercise.objects.count(), 0)

    def test_list_exercises_authenticated(self):
        """
        Ensure authenticated users can list their exercises (and standard ones).
        """
        # Create an exercise owned by the test user
        Exercise.objects.create(name="User Squat", body_part="LG", owner=self.test_user)
        # Create a standard exercise (no owner)
        Exercise.objects.create(name="Standard Pushup", body_part="CH", owner=None)
        # Create an exercise owned by another user (should not be listed)
        other_user = User.objects.create_user(username='otheruser', password='password123')
        Exercise.objects.create(name="Other User Bench", body_part="CH", owner=other_user)

        self.client.force_authenticate(user=self.test_user)
        response = self.client.get(self.exercise_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should see 2 exercises: the user's own and the standard one
        self.assertEqual(len(response.data), 2)
        self.assertTrue(any(e['name'] == 'User Squat' for e in response.data))
        self.assertTrue(any(e['name'] == 'Standard Pushup' for e in response.data))
        self.assertFalse(any(e['name'] == 'Other User Bench' for e in response.data))
        