// src/pages/ExercisesPage.tsx
import React, { useEffect, useState, FormEvent } from 'react';
import apiClient from '../services/api';
import { Exercise } from '../types'; // Import Exercise type

interface ExerciseFormProps {
    onExerciseCreated: (exercise: Exercise) => void;
}

const bodyPartOptions: { value: string; label: string }[] = [
    { value: 'CH', label: 'Chest' },
    { value: 'BK', label: 'Back' },
    { value: 'LG', label: 'Legs' },
    { value: 'SH', label: 'Shoulders' },
    { value: 'AR', label: 'Arms' },
    { value: 'CO', label: 'Core' },
    { value: 'FB', label: 'Full Body' },
    { value: 'OT', label: 'Other' },
  ];

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
        <form onSubmit={handleSubmit} className='form-container' style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
             <h4>Create New Exercise</h4>
            {error && <p className="error-message">{error}</p>}
             <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea id="description" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
             <div className="form-group">
                <label htmlFor="bodyPart">Body Part:</label>
                <select id="bodyPart" className="form-input" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} required >
                     <option value="" disabled>Please select...</option>
                        {bodyPartOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                </select>
            </div>
            <button type="submit" className='btn btn-primary' disabled={loading}>{loading ? 'Creating...' : 'Create Exercise'}</button>
        </form>
    );
};


const ExercisesPage = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
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
      setExercises(prevExercises => [...prevExercises, newExercise].sort((a, b) => a.name.localeCompare(b.name)));
    };

    // Helper to get display label from body part code
    const getBodyPartLabel = (code: string): string => {
        return bodyPartOptions.find(opt => opt.value === code)?.label || code;
    }

    return (
        <div className="page-container">
            <h2>Exercises</h2>

            {loading && <div className="loading-message">Loading exercises...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                exercises.length > 0 ? (
                    // Use item-list class on ul
                    <ul className="item-list">
                        {exercises.map(ex => (
                            // Use item-list-item class on li
                            <li key={ex.id} className="item-list-item">
                                {/* Use item-title and item-details */}
                                <span className="item-title">{ex.name}</span>
                                <span className="item-details">
                                    <span className="label">Body Part:</span> {getBodyPartLabel(ex.body_part)}
                                    {ex.owner && <span style={{ fontStyle: 'italic', marginLeft: '10px' }}>(Custom)</span>}
                                </span>
                                {/* Add Edit/Delete buttons here later if needed */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    // Use empty-list-message class
                    <p className="empty-list-message">No exercises found. Add one below!</p>
                )
            )}

            {/* Render the form for creating exercises */}
            <ExerciseForm onExerciseCreated={handleExerciseCreated} />
        </div>
    );
};

export default ExercisesPage;
