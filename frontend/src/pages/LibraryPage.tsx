// src/pages/LibraryPage.tsx
import { Container, Typography, Card, CardContent, Button, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Workout, PaginatedResponse } from '../types';
import { DASHBOARD_WORKOUT_LIMIT } from '../constants';

const LibraryPage = () => {
  const { user } = useAuth();
  const [loading, setLoadingWorkouts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programmedWorkouts, setProgrammedWorkouts] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);

  // Fetch Programmed Workouts Effect
  useEffect(() => {
    setLoadingWorkouts(true);
    // Programmed workouts are those from history (is_template=False)
    // We can filter this if needed, but for now we assume /workouts/ returns history
    apiClient
      .get<PaginatedResponse<Workout>>('/workouts/', {
        params: { user: user?.id, page_size: DASHBOARD_WORKOUT_LIMIT },
      })
      .then((response) => {
        // Handle paginated response
        const results = response.data.results || [];
        setProgrammedWorkouts(results);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch workouts:', err);
        setError('Failed to load workouts.');
      })
      .finally(() => setLoadingWorkouts(false));
  }, []);

  // Fetch Saved Workouts (Templates) Effect
  useEffect(() => {
    setLoadingWorkouts(true);
    apiClient
      .get<PaginatedResponse<Workout>>('/saved-workouts/', {
        params: { page_size: DASHBOARD_WORKOUT_LIMIT },
      })
      .then((response) => {
        const results = response.data.results || [];
        setSavedWorkouts(results);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch saved workouts:', err);
        setError('Failed to load saved workouts.');
      })
      .finally(() => setLoadingWorkouts(false));
  }, []);

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' align='center' sx={{ mb: 4 }}>
        Library
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
        {/* Programmed sessions row */}
        <Typography variant='h6' sx={{ mb: 3 }}>
          Programmed Library
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            mb: 4,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.main',
              borderRadius: 4,
            },
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <Card
              key={item}
              sx={{
                minWidth: 280,
                flexShrink: 0,
                bgcolor: 'background.default',
              }}
            >
              <CardContent>
                <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                  Programmed Session {item}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  Description for programmed session {item}. Populated by your coach.
                </Typography>
                <Button variant='contained' size='small'>
                  View Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* My saved Library content row */}
        <Typography variant='h6' sx={{ mb: 3 }}>
          My Library
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.main',
              borderRadius: 4,
            },
          }}
        >
          {savedWorkouts.length > 0 ? (
            savedWorkouts.map((workout) => (
              <Card
                key={workout.id}
                sx={{
                  minWidth: 280,
                  flexShrink: 0,
                  bgcolor: 'background.default',
                }}
              >
                <CardContent>
                  <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                    {workout.name || 'Untitled Workout'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {workout.notes || 'No description available.'}
                  </Typography>
                  <Button variant='contained' size='small'>
                    Start Workout
                  </Button>
                  <Button variant='contained' size='small' sx={{ ml: 1 }} component={Link} to={`/workouts/edit/${workout.id}`}>
                    Edit Workout
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant='body1' color='text.secondary'>
              No saved workouts found. Create a template to get started!
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant='contained' size='small' component={Link} to='/library/create'>
            Create Template
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LibraryPage;
