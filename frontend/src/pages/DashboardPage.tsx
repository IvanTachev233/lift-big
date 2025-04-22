// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Workout } from '../types';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
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
                                // Add item-list-item-flex class here maybe
                                <li key={workout.id} className="item-list-item item-list-item-flex">
                                    {/* Div to hold text content */}
                                    <div className="item-content">
                                        <span className="item-title">{workout.name || `Workout Session`}</span>
                                        <span className="item-details">
                                            <span className="label">Date:</span> {workout.date}
                                        </span>
                                    </div>
                                    <div className="item-actions">
                                        <Link
                                            to={`/workouts/${workout.id}`}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
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