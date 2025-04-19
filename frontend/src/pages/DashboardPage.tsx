// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Workout } from '../types'; // Import Workout type

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]); // Use the Workout type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setLoading(true);
        apiClient.get<Workout[]>('/workouts/') // Expecting an array of Workout objects
            .then(response => {
                setWorkouts(response.data);
                setError(null);
            })
            .catch(err => {
                console.error('Failed to fetch workouts:', err);
                setError('Failed to load workouts.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading workouts...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Dashboard</h2>
            {user && <p>Welcome, {user.username}</p>}
            {workouts.length > 0 ? (
                <ul>
                    {workouts.map(workout => (
                        <li key={workout.id}>
                            {workout.name || `Workout on ${workout.date}`}
                            {/* Display more workout details here as needed */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No recent workouts found.</p>
            )}
             <button onClick={logout}>Logout</button>
        </div>
    );
};

export default DashboardPage;