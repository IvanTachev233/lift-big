// src/pages/CreateWorkoutTemplatePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Autocomplete,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import apiClient from '../services/api';
import { Exercise, WorkoutSet } from '../types';
import ExerciseCard, { WeightMode, TemplateSet } from '../components/ExerciseCard';

// Template exercise interface
interface TemplateExercise {
  id: string;
  exercise: Exercise;
  weightMode: WeightMode;
  sets: TemplateSet[];
  recentResults: WorkoutSet[];
}

const CreateWorkoutTemplatePage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateNotes, setTemplateNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all exercises on mount
  useEffect(() => {
    setLoading(true);
    apiClient
      .get<Exercise[]>('/exercises/')
      .then((response) => {
        setExercises(response.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch exercises:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch recent results for an exercise
  const fetchRecentResults = useCallback(async (exerciseId: number): Promise<WorkoutSet[]> => {
    try {
      const response = await apiClient.get<WorkoutSet[]>('/workoutsets/', {
        params: { exercise: exerciseId },
      });
      return response.data || [];
    } catch (err) {
      console.error('Failed to fetch recent results:', err);
      return [];
    }
  }, []);

  // Add exercise to template
  const handleAddExercise = useCallback(
    async (exercise: Exercise | null) => {
      if (!exercise) return;

      // Check if exercise already added
      if (templateExercises.some((te) => te.exercise.id === exercise.id)) {
        return;
      }

      const recentResults = await fetchRecentResults(exercise.id);
      const newTemplateExercise: TemplateExercise = {
        id: crypto.randomUUID(),
        exercise,
        weightMode: 'EX',
        sets: [
          {
            id: crypto.randomUUID(),
            setNumber: 1,
            reps: 8,
            expectedWeight: '',
            isCompleted: false,
          },
        ],
        recentResults,
      };

      setTemplateExercises((prev) => [...prev, newTemplateExercise]);
    },
    [templateExercises, fetchRecentResults]
  );

  // Remove exercise from template
  const handleRemoveExercise = useCallback((templateExerciseId: string) => {
    setTemplateExercises((prev) => prev.filter((te) => te.id !== templateExerciseId));
  }, []);

  // Update weight mode for an exercise
  const handleWeightModeChange = useCallback((templateExerciseId: string, mode: WeightMode) => {
    setTemplateExercises((prev) =>
      prev.map((te) =>
        te.id === templateExerciseId
          ? {
              ...te,
              weightMode: mode,
              sets: te.sets.map((s) => ({ ...s, expectedWeight: '' })),
            }
          : te
      )
    );
  }, []);

  // Add set to exercise
  const handleAddSet = useCallback((templateExerciseId: string) => {
    setTemplateExercises((prev) =>
      prev.map((te) => {
        if (te.id !== templateExerciseId) return te;
        const newSetNumber = te.sets.length + 1;
        const lastSet = te.sets[te.sets.length - 1];
        return {
          ...te,
          sets: [
            ...te.sets,
            {
              id: crypto.randomUUID(),
              setNumber: newSetNumber,
              reps: lastSet?.reps || 8,
              expectedWeight: lastSet?.expectedWeight || '',
              isCompleted: false,
            },
          ],
        };
      })
    );
  }, []);

  // Remove set from exercise
  const handleRemoveSet = useCallback((templateExerciseId: string) => {
    setTemplateExercises((prev) =>
      prev.map((te) => {
        if (te.id !== templateExerciseId || te.sets.length <= 1) return te;
        const newSets = te.sets.slice(0, -1);
        return {
          ...te,
          sets: newSets.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
        };
      })
    );
  }, []);

  // Update set field
  const handleSetFieldChange = useCallback(
    (
      templateExerciseId: string,
      setId: string,
      field: 'reps' | 'expectedWeight' | 'isCompleted',
      value: number | string | boolean
    ) => {
      setTemplateExercises((prev) =>
        prev.map((te) => {
          if (te.id !== templateExerciseId) return te;
          return {
            ...te,
            sets: te.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
          };
        })
      );
    },
    []
  );

  // Move exercise up in the list
  const handleMoveExerciseUp = useCallback((index: number) => {
    if (index <= 0) return;
    setTemplateExercises((prev) => {
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      return newList;
    });
  }, []);

  // Move exercise down in the list
  const handleMoveExerciseDown = useCallback((index: number) => {
    setTemplateExercises((prev) => {
      if (index >= prev.length - 1) return prev;
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      return newList;
    });
  }, []);

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    if (templateExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    setSaving(true);
    try {
      // Create the workout as a template
      const workoutResponse = await apiClient.post('/workouts/', {
        name: templateName,
        notes: templateNotes,
        is_template: true,
        date: new Date().toISOString().split('T')[0],
        exercise_ids: templateExercises.map((te) => te.exercise.id),
      });

      const workoutId = workoutResponse.data.id;

      // Create sets for each exercise
      for (const te of templateExercises) {
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

      alert('Template saved successfully!');
      setTemplateName('');
      setTemplateNotes('');
      setTemplateExercises([]);
    } catch (err) {
      console.error('Failed to save template:', err);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' align='center' sx={{ mb: 4 }}>
        Create Workout Template
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          backdropFilter: 'blur(10px)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {/* Template Name and Notes */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label='Template Name'
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Notes (optional)'
            value={templateNotes}
            onChange={(e) => setTemplateNotes(e.target.value)}
            multiline
            rows={2}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Exercise Search */}
        <Typography variant='h6' sx={{ mb: 2 }}>
          Add Exercises
        </Typography>
        <Autocomplete
          options={exercises.filter(
            (ex) => !templateExercises.some((te) => te.exercise.id === ex.id)
          )}
          getOptionLabel={(option) => option.name}
          onChange={(_, value) => handleAddExercise(value)}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label='Search exercises...'
              placeholder='Type to search'
              size='small'
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{option.name}</span>
                <Chip label={option.body_part} size='small' variant='outlined' />
              </Box>
            </li>
          )}
          sx={{ mb: 4 }}
        />

        {/* Template Exercises */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {templateExercises.map((templateExercise, index) => (
            <ExerciseCard
              key={templateExercise.id}
              mode='template'
              exercise={templateExercise.exercise}
              sets={templateExercise.sets}
              weightMode={templateExercise.weightMode}
              recentResults={templateExercise.recentResults}
              onRemove={() => handleRemoveExercise(templateExercise.id)}
              onWeightModeChange={(mode) => handleWeightModeChange(templateExercise.id, mode)}
              onAddSet={() => handleAddSet(templateExercise.id)}
              onRemoveSet={() => handleRemoveSet(templateExercise.id)}
              onSetFieldChange={(setId, field, value) =>
                handleSetFieldChange(templateExercise.id, setId, field, value)
              }
              onMoveUp={() => handleMoveExerciseUp(index)}
              onMoveDown={() => handleMoveExerciseDown(index)}
              isFirst={index === 0}
              isLast={index === templateExercises.length - 1}
            />
          ))}
        </Box>

        {templateExercises.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography>No exercises added yet. Search and select exercises above.</Typography>
          </Box>
        )}

        {/* Save Button */}
        {templateExercises.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button variant='contained' size='large' onClick={handleSaveTemplate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CreateWorkoutTemplatePage;
