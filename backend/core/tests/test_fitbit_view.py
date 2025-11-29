from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from core.models import FitbitToken
from django.utils import timezone
from datetime import timedelta

class FitbitDataViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('fitbit-data')

    def test_get_fitbit_data_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], "Fitbit account not connected.")

    @patch('core.views.requests.get')
    def test_get_fitbit_data_success(self, mock_get):
        # Create a valid token
        FitbitToken.objects.create(
            user=self.user,
            access_token='valid_token',
            refresh_token='refresh_token',
            expires_at=timezone.now() + timedelta(hours=1)
        )

        # Mock responses for RHR and HRV
        mock_rhr_response = MagicMock()
        mock_rhr_response.status_code = 200
        mock_rhr_response.json.return_value = {
            "activities-heart": [{
                "value": {
                    "restingHeartRate": 60
                }
            }]
        }

        mock_hrv_response = MagicMock()
        mock_hrv_response.status_code = 200
        mock_hrv_response.json.return_value = {
            "hrv": [{
                "value": {
                    "dailyRmssd": 50
                }
            }]
        }

        mock_get.side_effect = [mock_rhr_response, mock_hrv_response]

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['resting_heart_rate'], 60)
        self.assertEqual(response.data['hrv'], 50)

    @patch('core.views.requests.post')
    @patch('core.views.requests.get')
    def test_refresh_token_success(self, mock_get, mock_post):
        # Create an expired token
        token = FitbitToken.objects.create(
            user=self.user,
            access_token='expired_token',
            refresh_token='refresh_token',
            expires_at=timezone.now() - timedelta(hours=1)
        )

        # Mock refresh token response
        mock_post_response = MagicMock()
        mock_post_response.status_code = 200
        mock_post_response.json.return_value = {
            "access_token": "new_access_token",
            "refresh_token": "new_refresh_token",
            "expires_in": 3600
        }
        mock_post.return_value = mock_post_response

        # Mock data responses
        mock_rhr_response = MagicMock()
        mock_rhr_response.status_code = 200
        mock_rhr_response.json.return_value = {"activities-heart": [{"value": {"restingHeartRate": 60}}]}
        
        mock_hrv_response = MagicMock()
        mock_hrv_response.status_code = 200
        mock_hrv_response.json.return_value = {"hrv": [{"value": {"dailyRmssd": 50}}]}

        mock_get.side_effect = [mock_rhr_response, mock_hrv_response]

        response = self.client.get(self.url)
        
        # Verify token was updated
        token.refresh_from_db()
        self.assertEqual(token.access_token, "new_access_token")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
