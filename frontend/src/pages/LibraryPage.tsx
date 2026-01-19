// src/pages/LibraryPage.tsx (Example Refactor)
/* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useState } from 'react';
// import { Row } from 'react-bootstrap';
// import apiClient from '../services/api';
// import { Workout } from '../types';
import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
// import ListGroup from 'react-bootstrap/ListGroup';
// import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { GlassCard, Carousel, CarouselItem } from '../components/design-system';

// import ReadinessScore from '../components/ReadinessScore';
// import { Link } from 'react-router-dom';
// import { ListGroup } from '../components/design-system';
// import { DASHBOARD_WORKOUT_LIMIT } from '../constants';

const LibraryPage = () => {
  return (
    <Container fluid='lg' className='py-4'>
      <h2 className='text-center mb-4'>Library</h2>
      <GlassCard className='p-4'>
        {/* Programmed sessions row */}
        <h5 className='mb-3'>Programmed Library</h5>
        <Carousel className='mb-4'>
          {[1, 2, 3, 4, 5].map((item) => (
            <CarouselItem key={item}>
              <GlassCard title={`Programmed Session ${item}`}>
                <p>Description for programmed session {item}. Populated by your coach.</p>
                <Button variant='primary' size='sm'>
                  View Session
                </Button>
              </GlassCard>
            </CarouselItem>
          ))}
        </Carousel>
        {/* My saved Library content row */}
        <h5 className='mb-3'>My Library</h5>
        <Carousel>
          {[1, 2, 3, 4].map((item) => (
            <CarouselItem key={item}>
              <GlassCard title={`My Workout ${item}`}>
                <p>Description for my workout {item}. Created by you.</p>
                <Button variant='primary' size='sm'>
                  View Workout
                </Button>
              </GlassCard>
            </CarouselItem>
          ))}
        </Carousel>
      </GlassCard>
    </Container>
  );
};

export default LibraryPage;
