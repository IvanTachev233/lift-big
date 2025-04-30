// src/pages/WorkoutDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { Workout, WorkoutSet } from '../types';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const WorkoutDetailPage = () => {
  // Get workoutId from URL parameters
  const { workoutId } = useParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Validate workoutId
    if (!workoutId || isNaN(parseInt(workoutId, 10))) {
      setError('Invalid Workout ID.');
      setLoading(false);
      return;
    }

    const fetchWorkoutDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the workout using ID
        const response = await apiClient.get<Workout>(`/workouts/${workoutId}/`);
        setWorkout(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching details:', err);
        if (err.response?.status === 404) {
          setError(`Workout with ID ${workoutId} not found or not accessible.`);
        } else {
          setError('An error occurred fetching workout details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]); // Re-fetch if workoutId changes

  if (loading) {
    return (
      <Container className='text-center py-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading Workout...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='py-4'>
        <Alert variant='danger'>{error}</Alert>
        <Button variant='secondary' onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!workout) {
    // Just in case
    return (
      <Container className='py-4'>
        <Alert variant='warning'>Workout data not available.</Alert>
        <Button variant='secondary' onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // Group sets by exercise name for better display
  const setsByExercise: { [key: string]: WorkoutSet[] } = {};
  workout.sets.forEach((set) => {
    const exerciseName = set.exercise?.name || 'Unknown Exercise';
    if (!setsByExercise[exerciseName]) {
      setsByExercise[exerciseName] = [];
    }
    setsByExercise[exerciseName].push(set);
  });

  return (
    <Container fluid='lg' className='py-4'>
      <h2 className='mb-3'>{workout.name || `Workout Details`}</h2>
      <p className='text-muted mb-4'>Date: {workout.date}</p>

      {workout.notes && (
        <Card className='mb-4 bg-light'>
          <Card.Body>
            <Card.Title as='h5'>Notes</Card.Title>
            <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{workout.notes}</Card.Text>
          </Card.Body>
        </Card>
      )}

      <h3 className='mb-3'>Sets Performed</h3>
      {Object.keys(setsByExercise).length > 0 ? (
        Object.entries(setsByExercise).map(([exerciseName, sets]) => (
          <Card key={exerciseName} className='mb-3 shadow-sm'>
            <Card.Header as='h5'>{exerciseName}</Card.Header>
            <ListGroup variant='flush'>
              {sets.map((set, index) => (
                <ListGroup.Item key={set.id}>
                  Set {index + 1}: {set.reps} reps @ {set.weight} units
                  {set.notes && (
                    <span className='d-block text-muted small fst-italic ps-2'>- {set.notes}</span>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        ))
      ) : (
        <Alert variant='info'>No sets recorded for this workout.</Alert>
      )}

      <div className='mt-4'>
        <Button variant='secondary' onClick={() => navigate(-1)}>
          {' '}
          Back
        </Button>
        {/* TODO [LB-10]:  Add Edit/Delete Workout buttons here later */}
      </div>
    </Container>
  );
};

export default WorkoutDetailPage;
