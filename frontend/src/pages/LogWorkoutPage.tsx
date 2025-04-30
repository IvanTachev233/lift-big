// src/pages/LogWorkoutPage.tsx

import React, { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import WeekNavigator from '../components/WeekNavigator';
import apiClient from '../services/api';
import { Exercise, WorkoutSet, Workout } from '../types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const formatDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LogWorkoutPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [workoutError, setWorkoutError] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [repsValue, setRepsValue] = useState<string>('');
  const [weightValue, setWeightValue] = useState<string>('');
  const [loadingSet, setLoadingSet] = useState(false);
  const [setError, setSetError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch exercises on component mount
  useEffect(() => {
    setLoadingExercises(true);
    apiClient
      .get<Exercise[]>('/exercises/')
      .then((response) => {
        setExercises(response.data);
        setExerciseFetchError(null);
      })
      .catch((err) => {
        setExerciseFetchError('Failed to load exercises.');
      })
      .finally(() => setLoadingExercises(false));
  }, []);

  // Function to find or create today's workout
  const handleStartOrFindWorkout = useCallback(async (dateToFind: Date) => {
    setLoadingWorkout(true);
    setWorkoutError(null);
    setCurrentWorkout(null);
    setSuccessMessage(null);
    setSetError(null);

    const dateString = formatDateToYYYYMMDD(dateToFind);
    if (!dateString) {
      setWorkoutError('Invalid date selected');
      setLoadingWorkout(false);
      return;
    }

    try {
      const response = await apiClient.get<Workout[]>(`/workouts/?date=${dateString}`);
      if (response.data && response.data.length > 0) {
        // Found existing workout(s) for today, use the first one
        setCurrentWorkout(response.data[0]);
      } else {
        // No workout for today, create one
        const createResponse = await apiClient.post<Workout>('/workouts/', { date: dateString });
        setCurrentWorkout(createResponse.data);
      }
    } catch (err: any) {
      setWorkoutError('Could not start or find workout session.');
    } finally {
      setLoadingWorkout(false);
    }
  }, []);

  // Load workout when date changes
  useEffect(() => {
    handleStartOrFindWorkout(selectedDate);
  }, [selectedDate, handleStartOrFindWorkout]);

  // Calendar Date Change Handler
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Function to handle logging a new set
  const handleLogSet = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSetError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!currentWorkout || !selectedExerciseId || repsValue === '' || weightValue === '') {
      setSetError('Please select an exercise and enter reps/weight.');
      return;
    }

    const repsNum = parseInt(repsValue, 10);
    const weightNum = parseFloat(weightValue);
    if (isNaN(repsNum) || repsNum <= 0 || isNaN(weightNum) || weightNum < 0) {
      setSetError('Please enter valid positive numbers for reps and weight.');
      return;
    }

    setLoadingSet(true);

    const setData = {
      workout: currentWorkout.id,
      exercise_id: parseInt(selectedExerciseId, 10),
      reps: repsNum,
      weight: String(weightValue),
    };
    try {
      const response = await apiClient.post<WorkoutSet>('/workoutsets/', setData);
      setSuccessMessage(`Set logged successfully! (ID: ${response.data.id})`);
      setRepsValue('');
      setWeightValue('');
    } catch (err: any) {
      setSetError('Failed to log set. Please try again.');
    } finally {
      setLoadingSet(false);
    }
  };

  // Render Logic
  if (loadingExercises)
    return (
      <Container className='text-center py-5'>
        <Spinner animation='border' />
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
        {loadingWorkout && <Spinner animation='border' size='sm' />}
        {workoutError && (
          <Alert variant='warning' className='d-inline-block p-2'>
            {workoutError}
          </Alert>
        )}
        {currentWorkout && !loadingWorkout && (
          <h3 className='mb-0 fs-5'>
            {' '}
            Logging for Workout on: {currentWorkout.date} (ID: {currentWorkout.id})
          </h3>
        )}
        {!currentWorkout && !loadingWorkout && !workoutError && (
          <p className='text-muted'>Select a date to view or start logging.</p>
        )}
      </div>

      {/* Log Set Form Section - Only show if a workout is loaded */}
      {currentWorkout && !loadingWorkout && (
        <Card className='shadow-sm'>
          <Card.Body>
            <Card.Title as='h4' className='text-center mb-3'>
              Log a Set
            </Card.Title>
            {setError && (
              <Alert variant='danger' size='sm'>
                {setError}
              </Alert>
            )}
            {successMessage && (
              <Alert variant='success' size='sm'>
                {successMessage}
              </Alert>
            )}
            <Form onSubmit={handleLogSet}>
              <Form.Group className='mb-3' controlId='logSetExercise'>
                <Form.Label>Exercise</Form.Label>
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

              <Row className='g-2 mb-3'>
                <Col sm>
                  <Form.Group controlId='logSetReps'>
                    <Form.Label>Reps</Form.Label>
                    <Form.Control
                      type='number'
                      value={repsValue}
                      onChange={(e) => setRepsValue(e.target.value)}
                      min='1'
                      required
                      disabled={loadingSet}
                    />
                  </Form.Group>
                </Col>
                <Col sm>
                  <Form.Group controlId='logSetWeight'>
                    <Form.Label>Weight</Form.Label>
                    <Form.Control
                      type='number'
                      value={weightValue}
                      onChange={(e) => setWeightValue(e.target.value)}
                      step='0.01'
                      min='0'
                      required
                      disabled={loadingSet}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                type='submit'
                variant='primary'
                className='w-100 liftbig-button'
                disabled={loadingSet}
              >
                {loadingSet ? 'Logging...' : 'Log Set'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* TODO: Display sets already logged for this workout? */}
    </Container>
  );
};

export default LogWorkoutPage;
