// src/pages/WorkoutDetailPage.tsx
import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import { Workout } from '../types';
import { useParams } from 'react-router-dom';


const WorkoutDetailPage = () => {
    const { workoutId } = useParams<{ workoutId: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        // Fetch workout data
        apiClient.get<Workout>(`/workouts/${workoutId}`)
        .then(response => {
            setWorkout(response.data);
            setError(null);
        })
        .catch(err => {
            console.error('Error fetching details:', err);
            setError('Failed to load workout');
        })
        .finally(() => setLoading(false));
    }, [workoutId]);

    if (loading) return <div className='loading-message'> Loading Workout</div>
    if (error) return <div className='error-message'> {error}</div>
    if (!workout) return <div className='empty-list-message'> Workout not found</div>

    return (
        <div className='page-container'>
            <h2>{workout.name || `Workout on ${workout.date}`}</h2>
            <p>Date: {workout.date}</p>
            {workout.notes && <p>Notes: {workout.notes}</p>}
            <h3>Sets:</h3>
            {workout.sets && workout.sets.length > 0 ? (
                <ul className='item-list'>
                    {workout.sets.map(set => (
                            <li key={set.id} className='item-list-item'>
                            <span className='item-title'>Exercise Name: {set.exercise.name}</span>
                            <span className='item-details'>{set.reps} reps @ {set.weight} units</span>
                            {set.notes && <p style={{marginTop: '5px', fontSize: '0.85em'}}><em>Notes: {set.notes}</em></p>}
                        </li>
                    ))}
                </ul>
            ): (
                <p>No sets logged</p>
            )}
        </div>
    )
}

export default WorkoutDetailPage;