// src/pages/LoginPage.tsx

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const {login, loading} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const success = await login(username, password);
        console.log(success);
        if(success) {
            navigate('/dashboard');
        } else {
            setError('Login Failed. Check username and password');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='username'>Username:</label>
                    <input 
                        type='text'
                        id='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required    
                    />
                </div>
                <div>
                    <label htmlFor='password'>Password:</label>
                    <input 
                        type='text'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required    
                    />
                </div>
                <button type='submit' disabled={loading}>
                    {loading ? 'Logging in' : 'Login'}
                </button>
            </form>
        </div>
    )
};

export default LoginPage;