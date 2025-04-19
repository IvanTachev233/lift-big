// src/types/index.ts

export interface User {
    id: number;
    username: string;
    email?: string;
}

export interface AuthContextType {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

// Exercise type
export interface Exercise {
    id: number;
    name: string;
    description: string | null;
    body_part: string;
    owner: User | null;
}

// Workout set type
export interface WorkoutSet {
    id: number;
    workout: number;
    exercise: string;
    // exercise_id: number;
    reps: number;
    weight: string;
    notes: string | null;
}

// Workout type
export interface Workout {
    id: number;
    user: User;
    date: string;
    name: string | null;
    notes: string | null;
    sets: WorkoutSet[];
}