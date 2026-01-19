import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MuiThemeProvider from './providers/MuiThemeProvider';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExercisesPage from './pages/ExercisesPage';
import LibraryPage from './pages/LibraryPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import './App.css';
import AllWorkoutsPage from './pages/AllWorkoutsPage';
import CreateWorkoutTemplatePage from './pages/CreateWorkoutTemplatePage';
import EditWorkoutTemplatePage from './pages/EditWorkoutTemplatePage';

// Component to protect routes
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />;
};

// Component for routes accessible only when logged out (like login)
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' replace />;
};

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider>
        <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<AppLayout />}>
            <Route element={<PublicRoute />}>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
            </Route>

            {/* Protected only for auth users */}
            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<DashboardPage />} />
              <Route path='/exercises' element={<ExercisesPage />} />
              <Route path='/workouts' element={<AllWorkoutsPage />} />
              <Route path='/library' element={<LibraryPage />} />
              <Route path='/log-workout' element={<LogWorkoutPage />} />
              <Route path='/workouts/:workoutId' element={<WorkoutDetailPage />} />
              <Route path='/library/create' element={<CreateWorkoutTemplatePage />} />
              <Route path='/workouts/edit/:templateId' element={<EditWorkoutTemplatePage />} />
            </Route>
            {/* If the path doesnt exist navigate to base */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Route>
        </Routes>
      </Router>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
