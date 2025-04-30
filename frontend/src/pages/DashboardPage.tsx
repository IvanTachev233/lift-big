// src/pages/DashboardPage.tsx (Example Refactor)
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Workout, User } from '../types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const DashboardPage = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Workouts Effect
  useEffect(() => {
    setLoading(true);
    apiClient
      .get<Workout[]>('/workouts/')
      .then((response) => {
        setWorkouts(response.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch workouts:', err);
        setError('Failed to load workouts.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container fluid='lg' className='py-4'>
      {' '}
      <h2 className='text-center mb-4'>Dashboard</h2>
      {user && <p className='text-center mb-4 fs-5'>Welcome, {user.username}!</p>}{' '}
      <Row className='g-4'>
        {' '}
        {/* Readiness Column */}
        <Col md={5} lg={4}>
          {' '}
        </Col>
        {/* Workouts Column */}
        <Col md={7} lg={8}>
          {' '}
          <h3 className='mb-3'>Recent Workouts</h3>
          {loading && (
            <div className='text-center'>
              <Spinner animation='border' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </Spinner>
            </div>
          )}
          {error && <Alert variant='danger'>{error}</Alert>}
          {!loading &&
            !error &&
            (workouts.length > 0 ? (
              <ListGroup>
                {workouts.map((workout) => (
                  <ListGroup.Item
                    key={workout.id}
                    className='d-flex justify-content-between align-items-start'
                  >
                    <div className='ms-2 me-auto'>
                      <div className='fw-bold'>{workout.name || `Workout Session`}</div>
                      <span className='text-muted small'>Date: {workout.date}</span>
                    </div>
                    <Button className='btn-primary' href={`/workouts/${workout.id}`}>
                      View
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant='info'>No recent workouts found.</Alert>
            ))}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
