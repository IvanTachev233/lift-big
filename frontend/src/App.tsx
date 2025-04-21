import { useState } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExercisesPage from './pages/ExercisesPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import './App.css'

// Component to protect routes
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace />
}

// Component for routes accessible only when logged out (like login)
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<AppLayout/>}>

          <Route element={<PublicRoute/>}>
            <Route path='/login' element={<LoginPage/>}/>
            {/* TODO [LB-3]: Add register page */}
          </Route>

          {/* Protected only for auth users */}
          <Route element={<ProtectedRoute/>}>
            <Route path='/' element={<DashboardPage/>}/>
            <Route path='/exercises' element={<ExercisesPage/>}/>
            <Route path='/log-workout' element={<LogWorkoutPage/>}/>
          </Route>
          {/* If the path doesnt exist navigate to base */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

      </Routes>
    </Router>
  )
}

export default App
