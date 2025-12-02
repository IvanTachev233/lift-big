import urllib.parse
from datetime import timedelta

import requests
from django.conf import settings
from django.db.models import Q, Count
from django.contrib.auth.models import User
from django.core import signing
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework import generics, viewsets, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Exercise, Workout, WorkoutSet, FitbitToken
from .pagination import StandardResultsSetPagination
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ExerciseSerializer,
    WorkoutSerializer,
    WorkoutSetSerializer,
)


FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token"


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Ensure user is logged in

    def get(self, request):
        serializer = UserSerializer(
            request.user
        )  # request.user is populated by JWTAuthentication
        return Response(serializer.data)


# Provides list and detail views for users. Restricted to admin users.
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permissions_classes = [permissions.IsAdminUser]


"""API endpoint that allows users to register
Accepts POST requests with username, email, password, password2.
"""


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class FitbitConnectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Redirect the authenticated user to Fitbit's consent screen or return the URL."""
        required_settings = [
            settings.FITBIT_CLIENT_ID,
            settings.FITBIT_CLIENT_SECRET,
            settings.FITBIT_REDIRECT_URI,
        ]
        print(required_settings)
        if not all(required_settings):
            return Response(
                {"detail": "Fitbit OAuth is not configured on the server."},
                status=500,
            )

        state = signing.dumps({"user_id": request.user.id})
        params = {
            "response_type": "code",
            "client_id": settings.FITBIT_CLIENT_ID,
            "redirect_uri": settings.FITBIT_REDIRECT_URI,
            "scope": settings.FITBIT_SCOPE,
            "state": state,
        }
        authorization_url = f"{FITBIT_AUTH_URL}?{urllib.parse.urlencode(params)}"
        should_redirect = (
            request.query_params.get("redirect", "true").lower() != "false"
        )
        if should_redirect:
            return HttpResponseRedirect(authorization_url)
        return Response({"authorization_url": authorization_url})


class FitbitCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Handle Fitbit redirect and store OAuth tokens."""
        error = request.query_params.get("error")
        if error:
            return Response(
                {"detail": f"Fitbit returned an error: {error}"},
                status=400,
            )

        code = request.query_params.get("code")
        state = request.query_params.get("state")

        if not code or not state:
            return Response(
                {"detail": "Missing OAuth code or state parameters."},
                status=400,
            )

        try:
            payload = signing.loads(state, max_age=600)
            user_id = payload["user_id"]
        except signing.BadSignature:
            return Response({"detail": "Invalid state parameter."}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found for provided state."}, status=404
            )

        required_settings = [
            settings.FITBIT_CLIENT_ID,
            settings.FITBIT_CLIENT_SECRET,
            settings.FITBIT_REDIRECT_URI,
        ]
        if not all(required_settings):
            return Response(
                {"detail": "Fitbit OAuth is not configured on the server."},
                status=500,
            )

        data = {
            "client_id": settings.FITBIT_CLIENT_ID,
            "grant_type": "authorization_code",
            "redirect_uri": settings.FITBIT_REDIRECT_URI,
            "code": code,
        }

        try:
            token_response = requests.post(
                FITBIT_TOKEN_URL,
                data=data,
                auth=(settings.FITBIT_CLIENT_ID, settings.FITBIT_CLIENT_SECRET),
                timeout=10,
            )
        except requests.RequestException as exc:
            return Response(
                {"detail": "Unable to reach Fitbit token endpoint.", "error": str(exc)},
                status=502,
            )

        if token_response.status_code != 200:
            detail = (
                token_response.json()
                if token_response.headers.get("content-type", "").startswith(
                    "application/json"
                )
                else token_response.text
            )
            return Response(
                {
                    "detail": "Failed to exchange code for tokens.",
                    "fitbit_response": detail,
                },
                status=token_response.status_code,
            )

        token_payload = token_response.json()
        expires_in = token_payload.get("expires_in", 0)
        expires_at = timezone.now() + timedelta(seconds=expires_in)

        FitbitToken.objects.update_or_create(
            user=user,
            defaults={
                "access_token": token_payload.get("access_token", ""),
                "refresh_token": token_payload.get("refresh_token", ""),
                "expires_at": expires_at,
                "scope": token_payload.get("scope", ""),
                "token_type": token_payload.get("token_type", ""),
            },
        )

        return Response({"detail": "Fitbit account connected successfully."})


class FitbitDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Fetch RHR and HRV data from Fitbit."""
        try:
            fitbit_token = request.user.fitbit_token
        except FitbitToken.DoesNotExist:
            return Response(
                {"detail": "Fitbit account not connected."},
                status=404,
            )

        # Check if token is expired and refresh if necessary
        if fitbit_token.is_expired:
            refresh_success = self.refresh_fitbit_token(fitbit_token)
            if not refresh_success:
                return Response(
                    {"detail": "Fitbit token expired and refresh failed. Please reconnect."},
                    status=401,
                )

        headers = {"Authorization": f"Bearer {fitbit_token.access_token}"}

        # Fetch Resting Heart Rate
        # https://dev.fitbit.com/build/reference/web-api/heart-rate/get-heart-rate-time-series/
        rhr_url = "https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json"
        try:
            rhr_response = requests.get(rhr_url, headers=headers, timeout=10)
            rhr_data = rhr_response.json()
            # Extract RHR. Structure: activities-heart -> [0] -> value -> restingHeartRate
            resting_heart_rate = None
            if "activities-heart" in rhr_data and rhr_data["activities-heart"]:
                resting_heart_rate = rhr_data["activities-heart"][0].get("value", {}).get("restingHeartRate")
        except Exception as e:
            print(f"Error fetching RHR: {e}")
            resting_heart_rate = None

        # Fetch HRV
        # https://dev.fitbit.com/build/reference/web-api/heart-rate-variability/get-hrv-summary-by-date/
        hrv_url = "https://api.fitbit.com/1/user/-/hrv/date/today.json"
        try:
            hrv_response = requests.get(hrv_url, headers=headers, timeout=10)
            hrv_data = hrv_response.json()
            # Extract HRV. Structure: hrv -> [0] -> value -> dailyRmssd
            hrv_value = None
            if "hrv" in hrv_data and hrv_data["hrv"]:
                 # Usually returns a list, we take the first one (most recent/today)
                hrv_value = hrv_data["hrv"][0].get("value", {}).get("dailyRmssd")
        except Exception as e:
            print(f"Error fetching HRV: {e}")
            hrv_value = None

        return Response({
            "resting_heart_rate": resting_heart_rate,
            "hrv": hrv_value
        })

    def refresh_fitbit_token(self, fitbit_token):
        """Refreshes the Fitbit access token."""
        data = {
            "grant_type": "refresh_token",
            "refresh_token": fitbit_token.refresh_token,
        }
        try:
            response = requests.post(
                FITBIT_TOKEN_URL,
                data=data,
                auth=(settings.FITBIT_CLIENT_ID, settings.FITBIT_CLIENT_SECRET),
                timeout=10,
            )
            if response.status_code == 200:
                token_payload = response.json()
                expires_in = token_payload.get("expires_in", 0)
                fitbit_token.access_token = token_payload.get("access_token")
                fitbit_token.refresh_token = token_payload.get("refresh_token")
                fitbit_token.expires_at = timezone.now() + timedelta(seconds=expires_in)
                fitbit_token.save()
                return True
            else:
                print(f"Failed to refresh token: {response.text}")
                return False
        except Exception as e:
            print(f"Error refreshing token: {e}")
            return False


# Allows authenticated users to manage their exercises
class ExerciseViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]  # Must be logged in

    def get_queryset(self):
        """This view should return a list of all exercises for
        the currently authenticated user or standard exercises (owner=None).
        """
        user = self.request.user
        # Allows users to see their own exercises AND exercises with no owner
        return Exercise.objects.filter(Q(owner=user) | Q(owner__isnull=True))

    def perform_create(self, serializer):
        """Ensure the user creating the exercise is set as the owner."""
        serializer.save(owner=self.request.user)


# Workout ViewSet
# Allows authenticated users to manage their workouts
class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):

        """This view should return a list of all workouts for
        the currently authenticated user.
        """
        # Filter workouts to only those owned by the logged-in user
        queryset = Workout.objects.filter(user=self.request.user)

        # Filter by current date
        requested_date_str = self.request.query_params.get("date", None)
        if requested_date_str:
            queryset = queryset.filter(date=requested_date_str)
        
        # Prioritize workouts with sets, then by ID (newest first)
        queryset = queryset.annotate(sets_count=Count('sets')).order_by('-sets_count', '-id')

        return queryset

    def perform_create(self, serializer):
        """Ensure the user creating the workout is set as the user."""
        serializer.save(user=self.request.user)


# WorkoutSet ViewSet
# Allows authenticated users to manage sets within their workouts
class WorkoutSetViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """This view should return a list of all workout sets belonging
        to the workouts owned by the currently authenticated user.
        """
        # Filter sets based on the owner of the parent workout
        return WorkoutSet.objects.filter(workout__user=self.request.user)

    def perform_create(self, serializer):
        workout_id = serializer.validated_data.get("workout").id
        if Workout.objects.get(id=workout_id).user != self.request.user:
            raise serializers.ValidationError(
                "You can only add sets to your own workouts."
            )
        serializer.save()
