// src/pages/AllWorkoutsPage.tsx (Example Refactor)
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Workout, User } from '../types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { Breadcrumb, Button, Pagination } from 'react-bootstrap';
import ReadinessScore from '../components/ReadinessScore';
import { Link, useNavigate } from 'react-router-dom';

const DASHBOARD_WORKOUT_LIMIT = 10;

interface PaginatedWorkoutsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Workout[];
}

const AllWorkoutsPage = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          page_size: DASHBOARD_WORKOUT_LIMIT,
        },
      });

      setWorkouts(response.data.results);
      setTotalWorkoutCount(response.data.count);
      setTotalPages(Math.ceil(response.data.count / DASHBOARD_WORKOUT_LIMIT));
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch workouts', err);
      setError('Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts(currentPage);
  }, [currentPage, fetchWorkouts]);

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber != currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationItems = () => {
    let items = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    items.push(
      <Pagination.First
        key='first'
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      />
    );
    items.push(
      <Pagination.Prev
        key='prev'
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Add Ellipsis if startPage is greater than 1
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key='start-ellipsis' disabled />);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Add Ellipsis if endPage is less than totalPages
    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key='end-ellipsis' disabled />);
    }

    // Add Next and Last buttons
    items.push(
      <Pagination.Next
        key='next'
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key='last'
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <Container fluid='lg' className='py-4'>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item active>All Workouts</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className='text-center mb-4'>All Workouts</h2>

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
                  <div className='d-flex justify-content-between align-items-start'>
                    <div className='ms-2 me-auto'>
                      <div className='fw-bold'>{workout.name || `Workout Session`}</div>
                      <span className='text-muted small'>Date: {workout.date}</span>
                    </div>
                    {/* Optionally add a small indicator or badge */}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Render Pagination if more than one page */}
            {totalPages > 1 && (
              <div className='d-flex justify-content-center'>
                <Pagination>{renderPaginationItems()}</Pagination>
              </div>
            )}
            <p className='text-center text-muted small mt-2'>
              Showing {workouts.length} of {totalWorkoutCount} workouts
            </p>
          </>
        ) : (
          <Alert variant='info'>No workouts found.</Alert>
        ))}
    </Container>
  );
};

export default AllWorkoutsPage;
