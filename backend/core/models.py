from django.db import models
from django.db import models
from django.conf import settings
# from django.contrib.auth.models import User # Don't import directly, use settings.AUTH_USER_MODEL
from django.utils import timezone

class BodyPartChoices(models.TextChoices):
    CHEST = 'CH', 'Chest'
    BACK = 'BK', 'Back'
    LEGS = 'LG', 'Legs'
    SHOULDERS = 'SH', 'Shoulders'
    ARMS = 'AR', 'Arms'
    CORE = 'CO', 'Core'
    FULL_BODY = 'FB', 'Full Body'
    OTHER = 'OT', 'Other'
    

# Exercise Model
class Exercise(models.Model):
    """ Represents a type of weightlifting exercise. """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the exercise (e.g., Bench Press)"
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Description of exercise"
    )
    
    body_part = models.CharField(
        max_length=2,
        choices=BodyPartChoices.choices,
        default=BodyPartChoices.OTHER,
        help_text="Body part targeted"
    )
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custom_exercises',
        help_text="User who created the exercise"
    )
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        """String representation of the Exercise object."""
        return self.name
    
# Workout Model

class Workout(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workouts',
        help_text="The use who performed the workout"
    )
    
    date = models.DateField(
        default=timezone.now,
        help_text="Date for the workout"
    )
    
    name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Optional name for the workout (e.g., Monday Chest Day)"
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Optional notes about the workout session"
    )
    
    class Meta:
        ordering = ['-date', '-id']
        
    def __str__(self):
        username = self.user.username if self.user else 'Unknown User'
        return f"{username}'s workout on {self.date.strftime('%Y-%m-%d')}"


# WorkoutSet Model
class WorkoutSet(models.Model):
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name='sets',
        help_text="The workout session this set belongs to"
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.PROTECT,         
        related_name='sets_performed',
        help_text="The exercise performed in this set"
    )
    reps = models.PositiveIntegerField(
        help_text="Number of repetitions performed"
    )
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Weight used for the set (e.g., in kg or lbs)"
    )
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Optional notes specific to this set"
    )
    # add more fields like RPE (Rate of Perceived Exertion), rest_time, etc.
    # set_number = models.PositiveIntegerField(blank=True, null=True, help_text="Order of the set within the exercise for this workout")

    class Meta:
        ordering = ['workout', 'id'] # Order primarily by workout, then by set ID

    def __str__(self):
        """String representation of the WorkoutSet object."""
        # Safely access exercise name
        exercise_name = self.exercise.name if self.exercise else 'Unknown Exercise'
        return f"Set of {exercise_name}: {self.reps} reps @ {self.weight} units"
