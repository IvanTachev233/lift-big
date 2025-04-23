// src/pages/LoginPage.tsx

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await register(email, username, password, password2);
    console.log(success);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Register Failed. Check username and password');
    }
  };

  return (
    <div className='page-container'>
      {' '}
      {/* Apply container style */}
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className='form-container'>
        {error && <p className='error-message'>{error}</p>}
        <div className='form-group'>
          <label htmlFor='email'>Email:</label>
          <input
            type='text'
            id='email'
            className='form-input'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='username'>Username:</label>
          <input
            type='text'
            id='username'
            className='form-input'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            className='form-input'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password2'>Repeat Password:</label>
          <input
            type='password2'
            id='password2'
            className='form-input'
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>
        <button type='submit' className='btn btn-primary' disabled={loading}>
          {loading ? 'Registering' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
