// src/components/Navbar.tsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Use NavLink for active styling
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // We'll create this CSS file next

const Navbar: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth(); // Get user too if needed
    const navigate = useNavigate();
    console.log(user);
    const handleLogout = () => {
        logout();
        // Navigate to login page after logout to ensure redirect happens
        navigate('/login');
    };

    // Helper function for NavLink active styling
    const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
        return isActive ? 'navbar-link active' : 'navbar-link';
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                {/* Link back to dashboard if logged in, or login if logged out */}
                <Link to={isAuthenticated ? "/" : "/login"} className="navbar-brand-link">
                    Lift Big
                </Link>
            </div>
            <ul className="navbar-links">
                {isAuthenticated ? (
                    // Links shown when loggedin
                    <>
                        <li><NavLink to="/" className={getNavLinkClass} end>Dashboard</NavLink></li>
                        <li><NavLink to="/exercises" className={getNavLinkClass}>Exercises</NavLink></li>
                        <li><NavLink to="/log-workout" className={getNavLinkClass}>Log Workout</NavLink></li>
                        <li>
                            <button onClick={handleLogout} className="navbar-logout-btn">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    // Links shown when logged OUT
                    <>
                        <li><NavLink to="/login" className={getNavLinkClass}>Login</NavLink></li>
                        {/* TODO [LB-3]: Add register page */}
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;