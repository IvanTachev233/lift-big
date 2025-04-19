from django.contrib import admin
from .models import Exercise, Workout, WorkoutSet

# Custom Exercise admin view
@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'body_part', 'owner') # Columns to show in the list view
    list_filter = ('body_part', 'owner') # Fields to filter by in the sidebar
    search_fields = ('name', 'description') # Fields to include in the search bar

# Custom Workout admin view
@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('date', 'user', 'name', 'id') # Show relevant fields + ID
    list_filter = ('date', 'user') # Filter by date or user
    search_fields = ('name', 'notes', 'user__username') # Allow searching by workout name/notes or related user's username
    date_hierarchy = 'date' # Add date drill-down navigation

# Custom WorkoutSet admin view
@admin.register(WorkoutSet)
class WorkoutSetAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'reps', 'weight', 'id')
    list_filter = ('workout__date', 'exercise') # Filter by workout date or exercise
    search_fields = ('exercise__name', 'notes', 'workout__user__username') # Search exercise name, notes, user
