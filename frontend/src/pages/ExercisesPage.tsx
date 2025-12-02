// src/pages/ExercisesPage.tsx (Refactored Exercises Page)

import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import apiClient from '../services/api';
import { Exercise } from '../types';
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card'; // Use Card for form section
import LoadingOverlay from '../components/LoadingOverlay';

// Define body part options here or import from a constants file
const bodyPartOptions: { value: string; label: string }[] = [
  { value: 'CH', label: 'Chest' },
  { value: 'BK', label: 'Back' },
  { value: 'LG', label: 'Legs' },
  { value: 'SH', label: 'Shoulders' },
  { value: 'AR', label: 'Arms' },
  { value: 'CO', label: 'Core' },
  { value: 'FB', label: 'Full Body' },
  { value: 'OT', label: 'Other' },
];

// ExerciseForm Sub-Component
interface ExerciseFormProps {
  onExerciseCreated: (exercise: Exercise) => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ onExerciseCreated }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [bodyPart, setBodyPart] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Exercise>('/exercises/', {
        name,
        description: description || null,
        body_part: bodyPart,
      });
      onExerciseCreated(response.data);
      setName('');
      setDescription('');
      setBodyPart('');
    } catch (err: any) {
      console.error('Failed to create exercise:', err.response?.data);
      setError(err.response?.data?.name?.[0] || 'Failed to create exercise.'); // Show specific name error if available
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mt-4'>
      <Card.Body>
        <Card.Title as='h4'>Create New Exercise</Card.Title>
        {error && (
          <Alert variant='danger' className='mt-3'>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} className='mt-3'>
          <Form.Group className='mb-3' controlId='exerciseName'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='exerciseDescription'>
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as='textarea'
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='exerciseBodyPart'>
            <Form.Label>Body Part</Form.Label>
            <Form.Select
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              required
              disabled={loading}
            >
              <option value='' disabled>
                Please select...
              </option>
              {bodyPartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant='primary' type='submit' className='liftbig-button' disabled={loading}>
            {loading ? 'Creating...' : 'Create Exercise'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<Exercise[]>('/exercises/')
      .then((response) => {
        setExercises(response.data.sort((a, b) => a.name.localeCompare(b.name)));
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch exercises:', err);
        setError('Failed to load exercises.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExerciseCreated = (newExercise: Exercise) => {
    setExercises((prevExercises) =>
      [...prevExercises, newExercise].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  // Helper to get display label from body part code
  const getBodyPartLabel = (code: string): string => {
    return bodyPartOptions.find((opt) => opt.value === code)?.label || code;
  };

  return (
    <Container fluid='lg' className='py-4'>
      <h2 className='text-center mb-4'>Exercises</h2>

      <LoadingOverlay loading={loading} />

      {error && <Alert variant='danger'>{error}</Alert>}

      {!loading &&
        !error &&
        (exercises.length > 0 ? (
          <ListGroup>
            {exercises.map((ex) => (
              <ListGroup.Item
                key={ex.id}
                className='d-flex justify-content-between align-items-start'
              >
                <div className='ms-2 me-auto'>
                  <div className='fw-bold'>{ex.name}</div>
                  <span className='text-muted small'>
                    Body Part: {getBodyPartLabel(ex.body_part)}
                    {ex.owner && <span className='fst-italic ms-2'>(Custom)</span>}
                  </span>
                </div>
                {/* Add Edit/Delete buttons here too */}
                <Button variant='outline-secondary' size='sm'>
                  Edit
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant='info'>No exercises found. Add one below!</Alert>
        ))}

      {/* Render the form for creating exercises */}
      <ExerciseForm onExerciseCreated={handleExerciseCreated} />
    </Container>
  );
};

export default ExercisesPage;
