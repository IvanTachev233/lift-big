// src/pages/EditWorkoutTemplatePage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Alert, CircularProgress, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { Workout } from '../types';
import WorkoutTemplateForm, {
  WorkoutTemplateFormValues,
  TemplateExercise,
  FormMessage,
} from '../components/WorkoutTemplateForm';
import { WeightMode } from '../components/ExerciseCard';

const EditWorkoutTemplatePage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<WorkoutTemplateFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<FormMessage>(null);

  // Fetch template data on mount
  useEffect(() => {
    if (!templateId) return;

    setLoading(true);
    setError(null);

    apiClient
      .get<Workout>(`/saved-workouts/${templateId}/`)
      .then((response) => {
        const template = response.data;

        // Group sets by exercise to create TemplateExercise objects
        const exerciseMap = new Map<number, TemplateExercise>();

        template.sets.forEach((set) => {
          const exerciseId = set.exercise.id;

          if (!exerciseMap.has(exerciseId)) {
            exerciseMap.set(exerciseId, {
              id: crypto.randomUUID(),
              exercise: set.exercise,
              weightMode: (set.weight_mode as WeightMode) || 'EX',
              sets: [],
              recentResults: [],
            });
          }

          const templateExercise = exerciseMap.get(exerciseId)!;
          templateExercise.sets.push({
            id: crypto.randomUUID(),
            setNumber: templateExercise.sets.length + 1,
            reps: set.reps,
            expectedWeight: set.expected_weight || '',
            isCompleted: false,
          });
        });

        setInitialValues({
          name: template.name || '',
          notes: template.notes || '',
          exercises: Array.from(exerciseMap.values()),
        });
      })
      .catch((err) => {
        console.error('Failed to fetch template:', err);
        setError(
          'Failed to load template. It may not exist or you may not have permission to view it.'
        );
      })
      .finally(() => setLoading(false));
  }, [templateId]);

  // Handle form submission - PATCH to update template
  const handleSubmit = async (values: WorkoutTemplateFormValues) => {
    setSaving(true);
    setMessage(null);
    try {
      // Update the workout template
      await apiClient.patch(`/saved-workouts/${templateId}/`, {
        name: values.name,
        notes: values.notes,
        exercise_ids: values.exercises.map((te) => te.exercise.id),
      });

      // Delete existing sets and create new ones
      const currentTemplate = await apiClient.get<Workout>(`/saved-workouts/${templateId}/`);
      for (const set of currentTemplate.data.sets) {
        await apiClient.delete(`/workoutsets/${set.id}/`);
      }

      // Create new sets
      for (const te of values.exercises) {
        for (const set of te.sets) {
          await apiClient.post('/workoutsets/', {
            workout: templateId,
            exercise_id: te.exercise.id,
            reps: set.reps,
            weight: 0,
            weight_mode: te.weightMode,
            expected_weight: set.expectedWeight || null,
          });
        }
      }

      setMessage({ type: 'success', text: 'Template updated successfully!' });
    } catch (err) {
      console.error('Failed to update template:', err);
      setMessage({ type: 'error', text: 'Failed to update template. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setMessage(null);
    try {
      await apiClient.delete(`/saved-workouts/${templateId}/`);
      // Redirect after delete since template no longer exists
      navigate('/library');
    } catch (err) {
      console.error('Failed to delete template:', err);
      setMessage({ type: 'error', text: 'Failed to delete template. Please try again.' });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !initialValues) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error || 'Failed to load template.'}
        </Alert>
        <Button variant='contained' onClick={() => navigate('/library')}>
          Back to Library
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' align='center' sx={{ mb: 4 }}>
        Edit Workout Template
      </Typography>

      <WorkoutTemplateForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitButtonText='Update Template'
        isSubmitting={saving}
        message={message}
        additionalButtons={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='outlined'
              color='error'
              size='large'
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? 'Deleting...' : 'Delete Template'}
            </Button>
            <Button
              variant='outlined'
              size='large'
              onClick={() => navigate('/library')}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
          </Box>
        }
      />
    </Container>
  );
};

export default EditWorkoutTemplatePage;
