import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExercisesPage from './pages/ExercisesPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import './App.css'

// Component to protect routes
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace />
}

// Component for routes accessible only when logged out (like login)
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};


function App() {
  return (
    <Router>
      <Navbar/>
      <main className="main-content">
      <Routes>
        {/* Public routes */}
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
      </Routes>
      </main>
    </Router>
  )
}

export default App
