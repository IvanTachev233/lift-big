// src/pages/LogWorkoutPage.tsx

import { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { WeekNavigator } from '../components/design-system';
import apiClient from '../services/api';
import { Exercise, WorkoutSet, Workout, PaginatedResponse } from '../types';
import WorkoutExercisesList from '../components/WorkoutExercisesList';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import LoadingOverlay from '../components/LoadingOverlay';
import Card from 'react-bootstrap/Card';
import { formatDateToYYYYMMDD } from '../utils';

const LogWorkoutPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [workoutError, setWorkoutError] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const [loadingSet, setLoadingSet] = useState(false);
  type Message = { type: 'success' | 'error'; message: string } | null;
  const [message, setMessage] = useState<Message>(null);

  // Fetch exercises on component mount
  useEffect(() => {
    setLoadingExercises(true);
    apiClient
      .get<Exercise[]>('/exercises/')
      .then((response) => {
        setExercises(response.data);
        setExerciseFetchError(null);
      })
      .catch(() => {
        setExerciseFetchError('Failed to load exercises.');
      })
      .finally(() => setLoadingExercises(false));
  }, []);

  // Function to find or create today's workout
  const handleStartOrFindWorkout = useCallback(async (dateToFind: Date) => {
    setLoadingWorkout(true);
    setWorkoutError(null);
    setCurrentWorkout(null);
    setMessage(null);

    const dateString = formatDateToYYYYMMDD(dateToFind);
    if (!dateString) {
      setWorkoutError('Invalid date selected');
      setLoadingWorkout(false);
      return;
    }

    try {
      const response = await apiClient.get<PaginatedResponse<Workout>>(
        `/workouts/?date=${dateString}`
      );
      if (response.data && response.data.results && response.data.results.length > 0) {
        // Found existing workout(s) for today, use the first one
        setCurrentWorkout(response.data.results[0]);
      } else {
        // No workout for today, create one
        // const createResponse = await apiClient.post<Workout>('/workouts/', { date: dateString });
        // setCurrentWorkout(createResponse.data);
      }
    } catch (err: any) {
      setWorkoutError('Could not start or find workout session.');
    } finally {
      setLoadingWorkout(false);
    }
  }, []);

  // Function to create a new workout
  const handleCreateWorkout = async () => {
    const dateString = formatDateToYYYYMMDD(selectedDate);
    if (!dateString) return;

    setLoadingWorkout(true);
    setWorkoutError(null);

    try {
      const response = await apiClient.post<Workout>('/workouts/', { date: dateString });
      setCurrentWorkout(response.data);
    } catch (err: any) {
      console.error(err);
      setWorkoutError('Could not create workout session.');
    } finally {
      setLoadingWorkout(false);
    }
  };

  // Load workout when date changes
  useEffect(() => {
    handleStartOrFindWorkout(selectedDate);
  }, [selectedDate, handleStartOrFindWorkout]);

  // Calendar Date Change Handler
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Reusable function to add a set
  const addSet = async (exerciseId: number, reps: number, weight: number) => {
    if (!currentWorkout) return;

    setLoadingSet(true);
    setMessage(null);

    const setData = {
      workout: currentWorkout.id,
      exercise_id: exerciseId,
      reps: reps,
      weight: String(weight),
    };

    try {
      const response = await apiClient.post<WorkoutSet>('/workoutsets/', setData);

      // Update local state to reflect the new set immediately
      const newSet = response.data;

      // We need to fetch the full exercise object to add it to the local state correctly
      // Or we can find it from the exercises list
      const exerciseObj = exercises.find((e) => e.id === exerciseId);
      if (exerciseObj) {
        newSet.exercise = exerciseObj;
      }

      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: [...prev.sets, newSet],
        };
      });

      setMessage({ type: 'success', message: 'Set logged successfully!' });
      return response.data;
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', message: 'Failed to log set. Please try again.' });
      throw error;
    } finally {
      setLoadingSet(false);
    }
  };

  // Handler for adding an exercise to the view
  const handleAddExercise = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedExerciseId) {
      setMessage({ type: 'error', message: 'Please select an exercise.' });
      return;
    }

    const exerciseIdNum = parseInt(selectedExerciseId, 10);
    const exerciseToAdd = exercises.find((ex) => ex.id === exerciseIdNum);

    if (!exerciseToAdd) {
      setMessage({ type: 'error', message: 'Invalid exercise selected.' });
      return;
    }

    // Check if already in workout sets or planned exercises
    const alreadyInSets = currentWorkout?.sets.some((s) => s.exercise.id === exerciseIdNum);
    const alreadyInPlanned = currentWorkout?.exercises.some((e) => e.id === exerciseIdNum);

    if (alreadyInSets || alreadyInPlanned) {
      setMessage({ type: 'success', message: 'Exercise is already in the list below.' });
    } else {
      // Add to planned exercises via API
      if (currentWorkout) {
        const currentExerciseIds = currentWorkout.exercises.map((e) => e.id);
        const newExerciseIds = [...currentExerciseIds, exerciseIdNum];

        apiClient
          .patch<Workout>(`/workouts/${currentWorkout.id}/`, { exercise_ids: newExerciseIds })
          .then((response) => {
            setCurrentWorkout(response.data);
            setMessage({ type: 'success', message: 'Exercise added to the list below. Expand it to add sets.' });
          })
          .catch((err) => {
            console.error(err);
            setMessage({ type: 'error', message: 'Failed to add exercise to workout.' });
          });
      }
    }

    // Reset selection
    setSelectedExerciseId('');
  };

  // Function to update a set
  const updateSet = async (setId: number, reps: number, weight: number) => {
    if (!currentWorkout) return;

    try {
      await apiClient.patch(`/workoutsets/${setId}/`, { reps, weight });

      // Update local state
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.map((s) => (s.id === setId ? { ...s, reps, weight: String(weight) } : s)),
        };
      });
    } catch (error) {
      console.error('Failed to update set', error);
      // Optionally show an error toast
    }
  };

  // Render Logic
  if (loadingExercises)
    return (
      <Container className='text-center py-5'>
        <LoadingOverlay loading={loadingExercises} />
      </Container>
    );
  if (exerciseFetchError)
    return (
      <Container className='py-4'>
        <Alert variant='danger'>{exerciseFetchError}</Alert>
      </Container>
    );

  return (
    <Container fluid='lg' className='py-4'>
      <h2 className='text-center mb-4'>Log Workout</h2>
      {/* Calendar Section */}
      <WeekNavigator selectedDate={selectedDate} onDateSelect={handleDateSelect} />

      {/* Workout Status Section */}
      <div className='text-center mb-4' style={{ minHeight: '2.5em' }}>
        {loadingWorkout && <LoadingOverlay loading={loadingWorkout} />}
        {workoutError && (
          <Alert variant='warning' className='d-inline-block p-2'>
            {workoutError}
          </Alert>
        )}
        {currentWorkout && !loadingWorkout && (
          <h3 className='mb-0 fs-5'> Logging for Workout on: {currentWorkout.date}</h3>
        )}
        {!currentWorkout && !loadingWorkout && !workoutError && (
          <div className='text-center'>
            <p className='text-muted mb-3'>No workout found for this date.</p>
            <Button variant='primary' onClick={handleCreateWorkout} className='liftbig-button'>
              Start Workout
            </Button>
          </div>
        )}
      </div>

      {/* Add Exercise Form Section - Only show if a workout is loaded */}
      {currentWorkout && !loadingWorkout && (
        <>
          <Card className='shadow-sm mb-4'>
            <Card.Body>
              <Card.Title as='h4' className='text-center mb-3'>
                Add Exercise
              </Card.Title>
              {message && (
                <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                  {message.message}
                </Alert>
              )}
              <Form onSubmit={handleAddExercise}>
                <Form.Group className='mb-3' controlId='logSetExercise'>
                  <Form.Label>Select Exercise to Add</Form.Label>
                  <Form.Select
                    value={selectedExerciseId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setSelectedExerciseId(e.target.value)
                    }
                    required
                    disabled={loadingSet}
                  >
                    <option value='' disabled>
                      -- Select Exercise --
                    </option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button
                  type='submit'
                  variant='primary'
                  className='w-100 liftbig-button'
                  disabled={loadingSet}
                >
                  Add Exercise
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <h3 className='mb-3'>Workout View</h3>
          <WorkoutExercisesList
            workout={currentWorkout}
            additionalExercises={currentWorkout.exercises}
            onAddSet={addSet}
            onUpdateSet={updateSet}
          />
        </>
      )}
    </Container>
  );
};

export default LogWorkoutPage;
