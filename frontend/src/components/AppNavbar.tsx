import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import './AppNavbar.css';

const AppNavbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `nav-link ${isActive ? 'active' : ''}`;
  };

  return (
    <Navbar variant='dark' expand='md' sticky='top' collapseOnSelect className='app-navbar'>
      <Container fluid>
        <Navbar.Brand
          as={NavLink}
          to={isAuthenticated ? '/' : '/login'}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          Lift Big
        </Navbar.Brand>

        <Navbar.Toggle aria-controls='basic-navbar-nav' />

        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-auto align-items-center'>
            {isAuthenticated ? (
              <>
                <Nav.Item>
                  <NavLink to='/' className={getNavLinkClass} end>
                    Dashboard
                  </NavLink>
                </Nav.Item>
                <Nav.Item>
                  <NavLink to='/exercises' className={getNavLinkClass}>
                    Exercises
                  </NavLink>
                </Nav.Item>
                <Nav.Item>
                  <NavLink to='/log-workout' className={getNavLinkClass}>
                    Log Workout
                  </NavLink>
                </Nav.Item>
                <Nav.Item className='ms-md-2 mt-2 mt-md-0'>
                  <Button variant='outline-danger' size='sm' onClick={handleLogout}>
                    Logout {user?.username ? `(${user.username})` : ''}
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <>
                <Nav.Item>
                  <NavLink to='/login' className={getNavLinkClass}>
                    Login
                  </NavLink>
                </Nav.Item>
                <Nav.Item>
                  <NavLink to='/register' className={getNavLinkClass}>
                    Register
                  </NavLink>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
