from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from core.models import FitbitToken
from django.utils import timezone
from datetime import timedelta

class FitbitDisconnectViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('fitbit-disconnect')

    def test_disconnect_fitbit_success(self):
        # specific user token
        FitbitToken.objects.create(
            user=self.user,
            access_token='valid_token',
            refresh_token='refresh_token',
            expires_at=timezone.now() + timedelta(hours=1)
        )

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], "Fitbit account disconnected successfully.")
        
        # Verify token is deleted
        self.assertFalse(FitbitToken.objects.filter(user=self.user).exists())

    def test_disconnect_fitbit_not_connected(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], "Fitbit account not connected.")

    def test_disconnect_fitbit_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
