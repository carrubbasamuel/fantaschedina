import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          ⚽ Fantaschedine
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/dashboard"
                  className={isActive('/dashboard') ? 'active' : ''}
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/bet"
                  className={isActive('/bet') ? 'active' : ''}
                >
                  Nuova Schedina
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/leaderboard"
                  className={isActive('/leaderboard') ? 'active' : ''}
                >
                  Classifica
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/schedule"
                  className={isActive('/schedule') ? 'active' : ''}
                >
                  📅 Calendario
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/my-bets"
                  className={isActive('/my-bets') ? 'active' : ''}
                >
                  Le Mie Schedine
                </Nav.Link>
                {user?.isAdmin && (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/admin"
                      className={isActive('/admin') ? 'active' : ''}
                      style={{ color: '#ffc107' }}
                    >
                      🔧 Pannello Admin
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to="/gameday-management"
                      className={isActive('/gameday-management') ? 'active' : ''}
                      style={{ color: '#ffc107' }}
                    >
                      ⚽ Gestione Giornate
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Ciao, {user.username}!
                </Navbar.Text>
                <Button variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login"
                  className={isActive('/login') ? 'active' : ''}
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register"
                  className={isActive('/register') ? 'active' : ''}
                >
                  Registrati
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
