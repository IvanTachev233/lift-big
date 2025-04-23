// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';
const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    // Navigate to login page after logout to ensure redirect happens
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Helper function for NavLink active styling
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? 'navbar-link active' : 'navbar-link';
  };

  return (
    <nav className='navbar' ref={menuRef}>
      <div className='navbar-brand'>
        {/* Link back to dashboard if logged in, or login if logged out */}
        <Link
          to={isAuthenticated ? '/' : '/login'}
          className='navbar-brand-link'
          onClick={closeMenu}
        >
          Lift Big
        </Link>
      </div>

      <button
        className='navbar-toggle'
        onClick={toggleMobileMenu}
        aria-label='Toggle navigation'
        aria-expanded={isMobileMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          // Links shown when loggedin
          <>
            <li>
              <NavLink to='/' className={getNavLinkClass} end onClick={closeMenu}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to='/exercises' className={getNavLinkClass} onClick={closeMenu}>
                Exercises
              </NavLink>
            </li>
            <li>
              <NavLink to='/log-workout' className={getNavLinkClass} onClick={closeMenu}>
                Log Workout
              </NavLink>
            </li>
            <li>
              <button onClick={handleLogout} className='navbar-logout-btn'>
                Logout {user?.username ? `(${user.username})` : ''}
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to='/login' className={getNavLinkClass} onClick={closeMenu}>
                Login
              </NavLink>
            </li>
            {/* <li><NavLink to="/register" className={getNavLinkClass} onClick={closeMenu}>Register</NavLink></li> */}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
