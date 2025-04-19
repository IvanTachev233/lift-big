// src/pages/LogWorkoutPage.tsx
import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import apiClient from '../services/api';
import { Exercise, WorkoutSet, Workout } from '../types'; // Import necessary types

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const LogWorkoutPage = () => {
    // State for available exercises
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);

    // State for the active workout session
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
    const [loadingWorkout, setLoadingWorkout] = useState(false);
    const [workoutError, setWorkoutError] = useState<string | null>(null);

    // State for the log set form
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>(''); // Store ID as string from select value
    const [repsValue, setRepsValue] = useState<string>(''); // Store as string for input control
    const [weightValue, setWeightValue] = useState<string>(''); // Store as string for input control
    const [loadingSet, setLoadingSet] = useState(false);
    const [setError, setSetError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch exercises on component mount
    useEffect(() => {
        setLoadingExercises(true);
        apiClient.get<Exercise[]>('/exercises/')
            .then(response => {
                setExercises(response.data);
                setExerciseFetchError(null);
            })
            .catch(err => {
                console.error('Failed to fetch exercises:', err);
                setExerciseFetchError('Failed to load exercises.');
            })
            .finally(() => setLoadingExercises(false));
    }, []);

    // Function to find or create today's workout
    const handleStartOrFindWorkout = async () => {
        setLoadingWorkout(true);
        setWorkoutError(null);
        setCurrentWorkout(null); // Reset first
        const today = getTodayDateString();

        try {
            // Try to find an existing workout for today
            // Note: Your backend might need specific query param support like ?date=YYYY-MM-DD
            // Or you might fetch all and filter, or have a dedicated 'today' endpoint
            const response = await apiClient.get<Workout[]>(`/workouts/?date=${today}`); // Adjust endpoint/params as needed

            if (response.data && response.data.length > 0) {
                // Found existing workout(s) for today, use the first one (or implement selection logic)
                setCurrentWorkout(response.data[0]);
            } else {
                // No workout for today, create one
                const createResponse = await apiClient.post<Workout>('/workouts/', { date: today });
                setCurrentWorkout(createResponse.data);
            }
        } catch (err: any) {
            console.error('Failed to start/find workout:', err.response?.data || err.message);
            setWorkoutError('Could not start or find workout session.');
        } finally {
            setLoadingWorkout(false);
        }
    };

    // Function to handle logging a new set
    const handleLogSet = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSetError(null);
        setSuccessMessage(null);

        // Basic validation
        if (!currentWorkout || !selectedExerciseId || repsValue === '' || weightValue === '') {
            setSetError('Please select an exercise and enter reps/weight.');
            return;
        }

        const repsNum = parseInt(repsValue, 10);
        const weightNum = parseFloat(weightValue); // Keep as number for validation if needed

        if (isNaN(repsNum) || repsNum <= 0 || isNaN(weightNum) || weightNum < 0) {
             setSetError('Please enter valid positive numbers for reps and weight.');
             return;
        }

        setLoadingSet(true);

        const setData = {
            workout: currentWorkout.id,
            exercise: parseInt(selectedExerciseId, 10), // Ensure ID is number
            reps: repsNum,
            weight: String(weightValue), // Send as string for DRF DecimalField
        };

        try {
            const response = await apiClient.post<WorkoutSet>('/workoutsets/', setData);
            setSuccessMessage(`Set logged successfully! (ID: ${response.data.id})`);
            // Clear form for next set (optional)
            // setSelectedExerciseId(''); // Might want to keep exercise selected
            setRepsValue('');
            setWeightValue('');
        } catch (err: any) {
            console.error('Failed to log set:', err.response?.data || err.message);
            setSetError('Failed to log set. Please try again.');
        } finally {
            setLoadingSet(false);
        }
    };

    // Render Logic
    if (loadingExercises) return <div>Loading exercises...</div>;
    if (exerciseFetchError) return <div style={{ color: 'red' }}>{exerciseFetchError}</div>;

    return (
        <div>
            <h2>Log Workout</h2>

            {!currentWorkout && (
                <div>
                    <button onClick={handleStartOrFindWorkout} disabled={loadingWorkout}>
                        {loadingWorkout ? 'Starting...' : "Start/Find Today's Workout"}
                    </button>
                    {workoutError && <p style={{ color: 'red' }}>{workoutError}</p>}
                </div>
            )}

            {currentWorkout && (
                <div>
                    <h3>Logging for Workout on: {currentWorkout.date} (ID: {currentWorkout.id})</h3>
                    <form onSubmit={handleLogSet}>
                        {setError && <p style={{ color: 'red' }}>{setError}</p>}
                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                        <div>
                            <label htmlFor="exercise">Exercise:</label>
                            <select
                                id="exercise"
                                value={selectedExerciseId}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedExerciseId(e.target.value)}
                                required
                            >
                                <option value="" disabled>-- Select Exercise --</option>
                                {exercises.map(ex => (
                                    <option key={ex.id} value={ex.id}>
                                        {ex.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reps">Reps:</label>
                            <input
                                type="number"
                                id="reps"
                                value={repsValue}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setRepsValue(e.target.value)}
                                min="1" // Basic HTML5 validation
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="weight">Weight:</label>
                            <input
                                type="number"
                                id="weight"
                                value={weightValue}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setWeightValue(e.target.value)}
                                step="0.01" // Allow decimals
                                min="0" // Basic HTML5 validation
                                required
                            />
                        </div>
                        <button type="submit" disabled={loadingSet}>
                            {loadingSet ? 'Logging...' : 'Log Set'}
                        </button>
                    </form>
                     {/* TODO: Display sets already logged for this workout? */}
                </div>
            )}
        </div>
    );
};

export default LogWorkoutPage;