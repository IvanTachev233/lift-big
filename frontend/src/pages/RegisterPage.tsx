// src/pages/RegisterPage.tsx (Refactored Register Page)

import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { AxiosError } from 'axios';
// Import react-bootstrap components
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

// Define expected error response structure from DRF validation
interface ValidationErrors {
  username?: string[];
  email?: string[];
  password?: string[];
  password2?: string[];
  non_field_errors?: string[];
}

const RegisterPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Client-side password match check
    if (password !== password2) {
      setErrors({ password: ['Passwords do not match.'] });
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/register/', {
        username,
        email,
        password,
        password2,
      });

      // Redirect to login page after successful registration with a success message
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          setErrors(error.response.data as ValidationErrors);
        } else {
          setErrors({
            non_field_errors: [`An error occurred (${error.response.status}). Please try again.`],
          });
        }
      } else {
        setErrors({ non_field_errors: ['A network or unknown error occurred.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to display errors for a specific field
  const renderFieldError = (fieldName: keyof ValidationErrors) => {
    return errors[fieldName] ? (
      <Form.Control.Feedback type='invalid' style={{ display: 'block' }}>
        {errors[fieldName]?.join(', ')}
      </Form.Control.Feedback>
    ) : null;
  };

  return (
    <Container
      className='d-flex align-items-center justify-content-center py-5'
      style={{ minHeight: 'calc(100vh - 60px)' }}
    >
      <Row className='justify-content-center w-100'>
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className='shadow-sm'>
            <Card.Body className='p-4 p-md-5'>
              <h2 className='text-center mb-4 fw-bold'>Register</h2>
              {errors.non_field_errors && (
                <Alert variant='danger' className='text-center'>
                  {errors.non_field_errors.join(', ')}
                </Alert>
              )}
              <Form noValidate onSubmit={handleSubmit}>
                {' '}
                <Form.Group className='mb-3' controlId='registerUsername'>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Choose a username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    isInvalid={!!errors.username}
                    disabled={loading}
                  />
                  {renderFieldError('username')}
                </Form.Group>
                <Form.Group className='mb-3' controlId='registerEmail'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    isInvalid={!!errors.email}
                    disabled={loading}
                  />
                  {renderFieldError('email')}
                </Form.Group>
                <Form.Group className='mb-3' controlId='registerPassword'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    isInvalid={!!errors.password}
                    disabled={loading}
                  />
                  {renderFieldError('password')}
                </Form.Group>
                <Form.Group className='mb-4' controlId='registerPassword2'>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Confirm Password'
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                    isInvalid={!!errors.password2}
                    disabled={loading}
                  />
                  {renderFieldError('password2')}
                </Form.Group>
                <Button
                  variant='primary'
                  type='submit'
                  className='w-100 liftbig-button'
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
              <p className='mt-4 text-center small'>
                Already have an account? <Link to='/login'>Log In</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
