// src/pages/LoginPage.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import GlassCard from '../components/design-system/GlassCard';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for message passed from registration page
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message from location state so it doesn't reappear on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const success = await login(username, password);
    if (!success) {
      setError('Login Failed. Check username and password.');
    }
  };

  return (
    <Container
      className='d-flex align-items-center justify-content-center py-5'
      style={{ minHeight: 'calc(100vh - 60px)' }}
    >
      <Row className='justify-content-center w-100'>
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <GlassCard className='shadow-sm'>
            <h2 className='text-center mb-4 fw-bold'>Login</h2>
            {message && (
              <Alert variant='success' className='text-center'>
                {message}
              </Alert>
            )}
            {error && (
              <Alert variant='danger' className='text-center'>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className='mb-3' controlId='loginUsername'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className='mb-4' controlId='loginPassword'>
                {' '}
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Button variant='primary' type='submit' className='w-100' disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
            <p className='mt-4 text-center small'>
              {' '}
              Don't have an account? <Link to='/register'>Register here</Link>
            </p>
          </GlassCard>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
