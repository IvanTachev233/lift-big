// src/pages/CreateWorkoutTemplatePage.tsx
import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import apiClient from '../services/api';
import WorkoutTemplateForm, {
  WorkoutTemplateFormValues,
  FormMessage,
} from '../components/WorkoutTemplateForm';

const CreateWorkoutTemplatePage: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  // Empty initial values for creating a new template
  const initialValues: WorkoutTemplateFormValues = {
    name: '',
    notes: '',
    exercises: [],
  };

  // Handle form submission - POST to create new template
  const handleSubmit = async (values: WorkoutTemplateFormValues) => {
    setSaving(true);
    setMessage(null);
    try {
      // Create the workout as a template
      const workoutResponse = await apiClient.post('/workouts/', {
        name: values.name,
        notes: values.notes,
        is_template: true,
        date: new Date().toISOString().split('T')[0],
        exercise_ids: values.exercises.map((te) => te.exercise.id),
      });

      const workoutId = workoutResponse.data.id;

      // Create sets for each exercise
      for (const te of values.exercises) {
        for (const set of te.sets) {
          await apiClient.post('/workoutsets/', {
            workout: workoutId,
            exercise_id: te.exercise.id,
            reps: set.reps,
            weight: 0,
            weight_mode: te.weightMode,
            expected_weight: set.expectedWeight || null,
          });
        }
      }

      setMessage({ type: 'success', text: 'Template created successfully!' });
    } catch (err) {
      console.error('Failed to create template:', err);
      setMessage({ type: 'error', text: 'Failed to create template. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' align='center' sx={{ mb: 4 }}>
        Create Workout Template
      </Typography>

      <WorkoutTemplateForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitButtonText='Save Template'
        isSubmitting={saving}
        message={message}
      />
    </Container>
  );
};

export default CreateWorkoutTemplatePage;
