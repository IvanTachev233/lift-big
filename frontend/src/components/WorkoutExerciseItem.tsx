import React, { useState } from 'react';
import { Exercise, WorkoutSet } from '../types';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';

interface WorkoutExerciseItemProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  onAddSet: (reps: number, weight: number) => Promise<void>;
  onUpdateSet: (setId: number, reps: number, weight: number) => Promise<void>;
}

const WorkoutExerciseItem: React.FC<WorkoutExerciseItemProps> = ({
  exercise,
  sets,
  onAddSet,
  onUpdateSet,
}) => {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddSet = async (e: React.FormEvent) => {
    e.preventDefault();
    const repsNum = parseInt(reps, 10);
    const weightNum = parseFloat(weight);

    if (isNaN(repsNum) || repsNum <= 0 || isNaN(weightNum) || weightNum < 0) {
      return; // Basic validation, parent handles more if needed
    }

    setAdding(true);
    try {
      await onAddSet(repsNum, weightNum);
      setReps('');
      setWeight('');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateSet = (
    setId: number,
    field: 'reps' | 'weight',
    value: string,
    currentReps: number,
    currentWeight: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return; // Basic validation

    // If value hasn't changed, don't trigger update
    if (field === 'reps' && numValue === currentReps) return;
    if (field === 'weight' && value === currentWeight) return;

    const newReps = field === 'reps' ? parseInt(value, 10) : currentReps;
    const newWeight = field === 'weight' ? parseFloat(value) : parseFloat(currentWeight);

    onUpdateSet(setId, newReps, newWeight);
  };

  return (
    <Accordion.Item eventKey={exercise.id.toString()}>
      <Accordion.Header>
        <div className='d-flex justify-content-between w-100 me-3'>
          <strong>{exercise.name}</strong>
          <span className='text-muted small'>{sets.length} sets</span>
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <ListGroup variant='flush' className='mb-3'>
          {sets.map((set, index) => (
            <ListGroup.Item key={set.id} className='d-flex align-items-center'>
              <span className='me-3' style={{ minWidth: '50px' }}>
                Set {index + 1}
              </span>
              <Row className='g-2 flex-grow-1'>
                <Col xs={5}>
                  <Form.Control
                    type='number'
                    size='sm'
                    defaultValue={set.reps}
                    onBlur={(e) =>
                      handleUpdateSet(
                        set.id,
                        'reps',
                        e.target.value,
                        set.reps,
                        set.weight.toString()
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                  />
                </Col>
                <Col xs={1} className='d-flex align-items-center justify-content-center text-muted'>
                  x
                </Col>
                <Col xs={5}>
                  <Form.Control
                    type='number'
                    size='sm'
                    defaultValue={set.weight}
                    step='0.01'
                    onBlur={(e) =>
                      handleUpdateSet(
                        set.id,
                        'weight',
                        e.target.value,
                        set.reps,
                        set.weight.toString()
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                  />
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Form onSubmit={handleAddSet}>
          <Row className='g-2 align-items-end'>
            <Col xs={4}>
              <Form.Group controlId={`reps-${exercise.id}`}>
                <Form.Label className='small mb-1'>Reps</Form.Label>
                <Form.Control
                  type='number'
                  size='sm'
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min='1'
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group controlId={`weight-${exercise.id}`}>
                <Form.Label className='small mb-1'>Weight</Form.Label>
                <Form.Control
                  type='number'
                  size='sm'
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step='0.01'
                  min='0'
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Button
                type='submit'
                variant='outline-primary'
                size='sm'
                className='w-100'
                disabled={adding}
              >
                {adding ? '...' : 'Add'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default WorkoutExerciseItem;
