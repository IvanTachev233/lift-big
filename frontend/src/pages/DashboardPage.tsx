// src/pages/DashboardPage.tsx (Example Refactor)
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Workout } from '../types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { Button } from 'react-bootstrap';
import ReadinessScore from '../components/ReadinessScore';
import { Link } from 'react-router-dom';

const DASHBOARD_WORKOUT_LIMIT = 5;

interface PaginatedWorkoutsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Workout[];
}

interface FitbitConnectResponse {
  authorization_url: string;
}

interface FitbitData {
  resting_heart_rate: number | null;
  hrv: number | null;
}

const DashboardPage = () => {
  const { user } = useAuth();
  console.log(user);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [loading, setLoadingWorkouts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingFitbit, setConnectingFitbit] = useState(false);
  const [fitbitError, setFitbitError] = useState<string | null>(null);
  const [fitbitData, setFitbitData] = useState<FitbitData | null>(null);

  // Fetch Workouts Effect
  useEffect(() => {
    setLoadingWorkouts(true);
    apiClient
      .get<PaginatedWorkoutsResponse>('/workouts/', {
        params: { page: 1, page_size: DASHBOARD_WORKOUT_LIMIT },
      })
      .then((response) => {
        console.log(response);
        setTotalWorkoutCount(response.data.count);
        setWorkouts(response.data.results);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch workouts:', err);
        setError('Failed to load workouts.');
      })
      .finally(() => setLoadingWorkouts(false));
  }, []);

  // Fetch Fitbit Data Effect
  useEffect(() => {
    if (user?.has_fitbit) {
      apiClient
        .get<FitbitData>('/fitbit/data/')
        .then((response) => {
          setFitbitData(response.data);
        })
        .catch((err) => {
          console.error('Failed to fetch Fitbit data:', err);
          // Set an error state specifically for Fitbit widget
        });
    }
  }, [user]);

  const handleFitbitConnect = async () => {
    setFitbitError(null);
    setConnectingFitbit(true);
    try {
      const response = await apiClient.get<FitbitConnectResponse>('fitbit/connect/', {
        params: { redirect: 'false' },
      });
      const authorizationUrl = response.data.authorization_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        setFitbitError('Server did not provide a Fitbit authorization URL.');
      }
    } catch (err) {
      console.error('Failed to start Fitbit connect flow:', err);
      setFitbitError('Unable to connect to Fitbit right now.');
    } finally {
      setConnectingFitbit(false);
    }
  };

  return (
    <Container fluid='lg' className='py-4'>
      {' '}
      <h2 className='text-center mb-4'>Dashboard</h2>
      {user && (
        <div className='text-center mb-4'>
          <p className='fs-5 mb-3'>Welcome, {user.username}!</p>
          {!user.has_fitbit && (
            <Button variant='success' onClick={handleFitbitConnect} disabled={connectingFitbit}>
              {connectingFitbit ? 'Connecting to Fitbit...' : 'Connect Fitbit'}
            </Button>
          )}

          <Button variant='danger'>
            {connectingFitbit ? 'Removing Fitbit Connection...' : 'Disconnect Fitbit'}
          </Button>
          {fitbitError && <div className='text-danger small mt-2'>{fitbitError}</div>}
        </div>
      )}
      <Row className='g-4'>
        {' '}
        {/* Readiness Column */}
        <Col md={5} lg={4}>
          <ReadinessScore />

          {/* Fitbit Data Widget */}
          {user?.has_fitbit && (
            <div className='mt-4 p-3 border rounded shadow-sm bg-white'>
              <h5 className='mb-3'>Fitbit Health Metrics</h5>
              {fitbitData ? (
                <ListGroup variant='flush'>
                  <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                    <span>Resting Heart Rate</span>
                    <span className='fw-bold'>
                      {fitbitData.resting_heart_rate
                        ? `${fitbitData.resting_heart_rate} bpm`
                        : 'N/A'}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                    <span>HRV (RMSSD)</span>
                    <span className='fw-bold'>
                      {fitbitData.hrv ? `${fitbitData.hrv} ms` : 'N/A'}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              ) : (
                <div className='text-center text-muted'>Loading Fitbit data...</div>
              )}
            </div>
          )}
        </Col>
        {/* Workouts Column */}
        <Col md={7} lg={8}>
          {' '}
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h3>Recent Workouts</h3>
            {/* Show "View All" only if there are more workouts than shown */}
            {totalWorkoutCount > DASHBOARD_WORKOUT_LIMIT && (
              <Button as={Link} to='/workouts' variant='outline-secondary' size='sm'>
                View All ({totalWorkoutCount})
              </Button>
            )}
          </div>
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
