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
        <div className="page-container">
            <h2>Dashboard</h2>
            {user && <p className="dashboard-welcome">Welcome, {user.username}!</p>}

            {loading && <div className="loading-message">Loading workouts...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                 workouts.length > 0 ? (
                    <>
                        <h3>Recent Workouts</h3>
                        {/* Use item-list class on ul */}
                        <ul className="item-list">
                            {workouts.map(workout => (
                                // Use item-list-item class on li
                                <li key={workout.id} className="item-list-item">
                                    {/* Use item-title and item-details for structure */}
                                    <span className="item-title">{workout.name || `Workout Session`}</span>
                                    <span className="item-details">
                                        <span className="label">Date:</span> {workout.date}
                                        {workout.sets && ` - ${workout.sets.length} sets`}
                                    </span>
                                    {/* You could add a Link here to view workout details */}
                                </li>
                            ))}
                        </ul>
                    </>
                 ) : (
                    // Use empty-list-message class
                    <p className="empty-list-message">No recent workouts found. Go log one!</p>
                 )
            )}

             <div className="logout-button-container">
                 <button onClick={logout} className="btn btn-primary">
                     Logout
                 </button>
             </div>
        </div>
    );
};

export default DashboardPage;