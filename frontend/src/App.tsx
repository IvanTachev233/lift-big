import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

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
      {/* <Navbar/> */}
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
    </Router>
  )
}


// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

export default App
