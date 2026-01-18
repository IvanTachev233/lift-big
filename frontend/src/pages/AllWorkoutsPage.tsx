// src/pages/AllWorkoutsPage.tsx (Example Refactor)
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';

import apiClient from '../services/api';
import { Workout } from '../types';
import Container from 'react-bootstrap/Container';
import { ListGroup, PaginationControls } from '../components/design-system';
import Alert from 'react-bootstrap/Alert';

import { Breadcrumb, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingOverlay from '../components/LoadingOverlay';
import { WORKOUTS_PAGE_SIZE } from '../constants';

interface PaginatedWorkoutsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Workout[];
}

const AllWorkoutsPage = () => {
  // const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const navigate = useNavigate();

  // Fetch All Workouts
  const fetchWorkouts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginatedWorkoutsResponse>('/workouts/', {
        params: {
          page: page,
          page_size: WORKOUTS_PAGE_SIZE,
        },
      });

      setWorkouts(response.data.results);
      setTotalWorkoutCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / WORKOUTS_PAGE_SIZE));
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch workouts', err);
      setError('Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, workoutId: number) => {
    e.stopPropagation();
    setWorkoutToDelete(workoutId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!workoutToDelete) return;

    try {
      await apiClient.delete(`/workouts/${workoutToDelete}/`);

      // If this was the last item on the page and not the first page, go back one page
      if (workouts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        // Otherwise, refresh the current page to pull in a new item from the next page
        fetchWorkouts(currentPage);
      }

      setShowDeleteModal(false);
      setWorkoutToDelete(null);
    } catch (err) {
      console.error('Failed to delete workout', err);
      alert('Failed to delete workout');
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    fetchWorkouts(currentPage);
  }, [currentPage, fetchWorkouts]);

  return (
    <Container fluid='lg' className='py-4'>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item active>All Workouts</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className='text-center mb-4'>All Workouts</h2>

      <div style={{ position: 'relative', minHeight: '200px' }}>
        <LoadingOverlay loading={loading} />

        {!error && (
          <>
            {workouts.length > 0 ? (
              <>
                <ListGroup className='mb-4'>
                  {workouts.map((workout) => (
                    // Make list item clickable to view details
                    <ListGroup.Item
                      key={workout.id}
                      action
                      onClick={() => navigate(`/workouts/${workout.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className='d-flex justify-content-between align-items-center'>
                        <div className='ms-2 me-auto'>
                          <div className='fw-bold'>{workout.name || `Workout Session`}</div>
                          <span className='text-muted small'>Date: {workout.date}</span>
                        </div>
                        <Button
                          variant='danger'
                          size='sm'
                          onClick={(e) => handleDeleteClick(e, workout.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <p className='text-center text-muted small mt-2'>
                  Showing {workouts.length} of {totalWorkoutCount} workouts
                </p>
              </>
            ) : (
              !loading && <Alert variant='info'>No workouts found.</Alert>
            )}
          </>
        )}
      </div>
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title='Delete Workout'
        message='Are you sure you want to delete this workout? This action cannot be undone.'
        confirmText='Delete'
        variant='danger'
      />
    </Container>
  );
};

export default AllWorkoutsPage;
