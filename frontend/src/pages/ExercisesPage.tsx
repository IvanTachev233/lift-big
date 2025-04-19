// src/pages/ExercisesPage.tsx
import React, { useEffect, useState, FormEvent } from 'react';
import apiClient from '../services/api';
import { Exercise } from '../types'; // Import Exercise type

interface ExerciseFormProps {
    onExerciseCreated: (exercise: Exercise) => void;
}


const ExerciseForm: React.FC<ExerciseFormProps> = ({ onExerciseCreated }) => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [bodyPart, setBodyPart] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiClient.post<Exercise>('/exercises/', {
                name,
                description,
                body_part: bodyPart,
            });
            onExerciseCreated(response.data); // Notify parent component (ExercisesPage)
            setName('');
            setDescription('');
            setBodyPart('');
            setError(null);
        } catch (err: any) {
            console.error('Failed to create exercise:', err.response?.data);
            setError('Failed to create exercise.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="description">Description:</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
             <div>
                <label htmlFor="bodyPart">Body Part:</label>
                <input type="text" id="bodyPart" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Exercise'}</button>
        </form>
    );
};


const ExercisesPage = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        apiClient.get<Exercise[]>('/exercises/')
            .then(response => {
                setExercises(response.data);
                setError(null);
            })
            .catch(err => {
                console.error('Failed to fetch exercises:', err);
                setError('Failed to load exercises.');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleExerciseCreated = (newExercise: Exercise) => {
      // Add the newly created exercise to the local state
      setExercises(prevExercises => [...prevExercises, newExercise]);
    };

    if (loading) return <div>Loading exercises...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Exercises</h2>
            <ul>
                {exercises.map(ex => (
                    <li key={ex.id}>{ex.name} ({ex.body_part})</li>
                ))}
            </ul>
            <ExerciseForm onExerciseCreated={handleExerciseCreated} />
        </div>
    );
};

export default ExercisesPage;
