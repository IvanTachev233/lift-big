// src/pages/LogWorkoutPage.tsx
import React, { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import apiClient from '../services/api';
import Calendar from 'react-calendar';
import { Exercise, WorkoutSet, Workout } from '../types';
import './LogWorkoutPage.css'
type CalendarValue = Date | null | [Date | null, Date | null]

// Helper to get today's date in YYYY-MM-DD format
const formatDateToYYYYMMDD = (date: Date | null): string => {
    if(!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const LogWorkoutPage = () => {
    // State for calendar's selected date
    const [ selectedDate, setSelectedDate ] = useState<Date>(new Date());

    // State for available exercises
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);

    // State for the active workout session
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
    const [loadingWorkout, setLoadingWorkout] = useState(false);
    const [workoutError, setWorkoutError] = useState<string | null>(null);

    // State for the log set form
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const [repsValue, setRepsValue] = useState<string>('');
    const [weightValue, setWeightValue] = useState<string>('');
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
    const handleStartOrFindWorkout = useCallback(async (dateToFind: Date) => {
        setLoadingWorkout(true);
        setWorkoutError(null);
        setCurrentWorkout(null); // Reset first
        setSuccessMessage(null); // Clear messages
        setSetError(null);

        const dateString = formatDateToYYYYMMDD(dateToFind);
        if(!dateString) {
            setWorkoutError('Invalid date selected');
            setLoadingWorkout(false);
            return;
        }

        try {
            const response = await apiClient.get<Workout[]>(`/workouts/?date=${dateString}`);
            if (response.data && response.data.length > 0) {
                // Found existing workout(s) for today, use the first one
                setCurrentWorkout(response.data[0]);
            } else {
                // No workout for today, create one
                const createResponse = await apiClient.post<Workout>('/workouts/', { date: dateString });
                setCurrentWorkout(createResponse.data);
            }
        } catch (err: any) {
            console.error('Failed to start/find workout:', err.response?.data || err.message);
            setWorkoutError('Could not start or find workout session.');
        } finally {
            setLoadingWorkout(false);
        }
    }, []);

    // Load workout when date changes
    useEffect(() => {
        handleStartOrFindWorkout(selectedDate);
    }, [selectedDate, handleStartOrFindWorkout]);

    // Calendar Date Change Handler
    const handleDateChange = (value: CalendarValue) => {
        if (value instanceof Date) {
            setSelectedDate(value);
        } else {
            console.warn('Non-single date selected:', value);
        }
    }

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
            exercise_id: parseInt(selectedExerciseId, 10),
            reps: repsNum,
            weight: String(weightValue), // Send as string for DRF DecimalField
        };

        try {
            const response = await apiClient.post<WorkoutSet>('/workoutsets/', setData);
            setSuccessMessage(`Set logged successfully! (ID: ${response.data.id})`);
            // Clear form for next set
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
    if (loadingExercises) return <div className="loading-message page-container">Loading exercises...</div>;
    if (exerciseFetchError) return <div className="error-message page-container">{exerciseFetchError}</div>;

    return (
        // Use page-container for consistent padding/max-width
        <div className="page-container log-workout-page">
            <h2>Log Workout</h2>

            {/* Calendar Section */}
            <div className="calendar-container">
                <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    maxDate={new Date()} // Prevent selecting future dates
                />
            </div>

            {/* Workout Status Section */}
            <div className="workout-status">
                {loadingWorkout && <p className="loading-message">Loading workout for {formatDateToYYYYMMDD(selectedDate)}...</p>}
                {workoutError && <p className="error-message">{workoutError}</p>}
                {currentWorkout && !loadingWorkout && (
                    <h3>Logging for Workout on: {currentWorkout.date} (ID: {currentWorkout.id})</h3>
                )}
                {!currentWorkout && !loadingWorkout && !workoutError && (
                     <p>Select a date to view or start logging.</p> // Initial state or if date has no workout yet
                )}
            </div>


            {/* Log Set Form Section - Only show if a workout is loaded */}
            {currentWorkout && !loadingWorkout && (
                <form onSubmit={handleLogSet} className="form-container log-set-form">
                    <h4>Log a Set</h4>
                    {setError && <p className="error-message">{setError}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <div className="form-group">
                        <label htmlFor="exercise">Exercise:</label>
                        <select
                            id="exercise"
                            className="form-input"
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
                    <div className="form-group">
                        <label htmlFor="reps">Reps:</label>
                        <input
                            type="number"
                            id="reps"
                            className="form-input"
                            value={repsValue}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setRepsValue(e.target.value)}
                            min="1"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="weight">Weight:</label>
                        <input
                            type="number"
                            id="weight"
                            className="form-input"
                            value={weightValue}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setWeightValue(e.target.value)}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loadingSet}>
                        {loadingSet ? 'Logging...' : 'Log Set'}
                    </button>
                </form>
            )}                     
            {/* TODO: Display sets already logged for this workout? */}
        </div>
    );
};

export default LogWorkoutPage;