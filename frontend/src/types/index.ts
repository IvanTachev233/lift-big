// src/types/index.ts

export interface User {
  has_fitbit: boolean;
  id: number;
  username: string;
  email?: string;
}

export interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  has_fitbit: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    username: string,
    password: string,
    password2: string
  ) => Promise<boolean>;
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
  exercise: Exercise;
  // exercise_id: number;
  reps: number;
  weight: string;
  weight_mode?: 'EX' | 'PC' | 'RP';
  expected_weight?: string | null;
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
  exercises: Exercise[];
  is_template?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
