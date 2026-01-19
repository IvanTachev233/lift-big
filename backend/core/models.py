from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum, F
import redis
import os

r = redis.Redis(host=os.environ.get("REDIS_HOST", "localhost"), port=6379, db=0)


class BodyPartChoices(models.TextChoices):
    CHEST = "CH", "Chest"
    BACK = "BK", "Back"
    LEGS = "LG", "Legs"
    SHOULDERS = "SH", "Shoulders"
    ARMS = "AR", "Arms"
    CORE = "CO", "Core"
    FULL_BODY = "FB", "Full Body"
    OTHER = "OT", "Other"


# Exercise Model
class Exercise(models.Model):
    """Represents a type of weightlifting exercise."""

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the exercise (e.g., Bench Press)",
    )

    description = models.TextField(
        blank=True, null=True, help_text="Description of exercise"
    )

    body_part = models.CharField(
        max_length=2,
        choices=BodyPartChoices.choices,
        default=BodyPartChoices.OTHER,
        help_text="Body part targeted",
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="custom_exercises",
        help_text="User who created the exercise",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        """String representation of the Exercise object."""
        return self.name


# Workout Model


class Workout(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workouts",
        help_text="The use who performed the workout",
    )

    date = models.DateField(
        default=timezone.localdate, help_text="Date for the workout"
    )

    name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Optional name for the workout (e.g., Monday Chest Day)",
    )

    notes = models.TextField(
        blank=True, null=True, help_text="Optional notes about the workout session"
    )

    total_weight_lifted = models.IntegerField(
        default=0, help_text="Total weight lifted in the workout"
    )

    exercises = models.ManyToManyField(
        Exercise,
        blank=True,
        related_name="planned_workouts",
        help_text="Exercises planned for this workout",
    )

    is_template = models.BooleanField(
        default=False, help_text="Identifies if this is a reusable workout template"
    )

    class Meta:
        ordering = ["-date", "-id"]

    def __str__(self):
        username = self.user.username if self.user else "Unknown User"
        return f"{username}'s workout on {self.date.strftime('%Y-%m-%d')}"

    def update_total_weight(self):
        """Calculates and updates the total weight lifted for this workout."""
        # Calculate sum of (reps * weight) for all sets
        total = (
            self.sets.aggregate(total_volume=Sum(F("reps") * F("weight")))[
                "total_volume"
            ]
            or 0
        )

        self.total_weight_lifted = int(total)
        self.save()


@receiver(post_save, sender=Workout)
def update_leaderboard(sender, instance, **kwargs):
    # Calculate total weight lifted across all workouts for this user
    user_total = (
        Workout.objects.filter(user=instance.user).aggregate(
            total=Sum("total_weight_lifted")
        )["total"]
        or 0
    )

    r.zadd("leaderboard", {instance.user.username: user_total})
    r.publish("leaderboard_updates", "update_trigger")


# WorkoutSet Model
class WorkoutSet(models.Model):
    class WeightMode(models.TextChoices):
        EXACT = "EX", "Exact Weight"
        PERCENTAGE = "PC", "Percentage of 1RM"
        RPE = "RP", "Rate of Perceived Exertion"

    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name="sets",
        help_text="The workout session this set belongs to",
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.PROTECT,
        related_name="sets_performed",
        help_text="The exercise performed in this set",
    )
    reps = models.PositiveIntegerField(help_text="Number of repetitions performed")
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Weight used for the set (e.g., in kg or lbs)",
    )
    weight_mode = models.CharField(
        max_length=2,
        choices=WeightMode.choices,
        default=WeightMode.EXACT,
        help_text="Mode for interpreting the weight/expected_weight",
    )
    expected_weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Target weight/value (e.g. 80.0 for 80%, 8.0 for RPE 8, or exact kg)",
    )
    notes = models.TextField(
        blank=True, null=True, help_text="Optional notes specific to this set"
    )
    # add more fields like RPE (Rate of Perceived Exertion), rest_time, etc.
    # set_number = models.PositiveIntegerField(blank=True, null=True, help_text="Order of the set within the exercise for this workout")

    class Meta:
        ordering = ["workout", "id"]  # Order primarily by workout, then by set ID

    def __str__(self):
        """String representation of the WorkoutSet object."""
        # Safely access exercise name
        exercise_name = self.exercise.name if self.exercise else "Unknown Exercise"
        return f"Set of {exercise_name}: {self.reps} reps @ {self.weight} units"


@receiver(post_save, sender=WorkoutSet)
@receiver(post_delete, sender=WorkoutSet)
def update_workout_total(sender, instance, **kwargs):
    if instance.workout:
        instance.workout.update_total_weight()


class FitbitToken(models.Model):
    """Stores Fitbit OAuth tokens for a user."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fitbit_token",
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField(help_text="Expiration time for the access token")
    scope = models.CharField(max_length=255, blank=True)
    token_type = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user"]

    def __str__(self):
        return f"Fitbit tokens for {self.user.username}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at


class UserMetrics(models.Model):
    """Stores daily health metrics for user readiness calculation."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="metrics",
    )
    date = models.DateField(help_text="Date for the metrics")

    # Fitbit metrics
    resting_heart_rate = models.PositiveIntegerField(
        null=True, blank=True, help_text="Resting heart rate (bpm)"
    )
    hrv = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Heart rate variability (RMSSD ms)",
    )

    # Timestamps
    fetched_at = models.DateTimeField(
        auto_now=True, help_text="When data was last fetched"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lb_user_metrics"
        ordering = ["-date"]
        unique_together = ["user", "date"]
        verbose_name = "User Metrics"
        verbose_name_plural = "User Metrics"

    def __str__(self):
        return f"{self.user.username} metrics on {self.date}"
