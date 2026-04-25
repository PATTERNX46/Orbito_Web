import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import styled from 'styled-components';
import Auth from './pages/Auth';
import Home from './pages/Home';
import DashboardHub from './pages/DashboardHub'; // NEW: Imported the Traffic Controller

const AppContainer = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', sans-serif;
`;

const Navbar = styled.nav`
  background: ${(props) => props.theme.colors.cardBg};
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Brand = styled(Link)`
  text-decoration: none;
  color: ${(props) => props.theme.colors.primary};
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const SearchBar = styled.input`
  flex: 0.5;
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${(props) => props.theme.colors.secondary};
    background: white;
  }

  @media (max-width: 768px) {
    display: none; // Hide on mobile for now to save space
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${(props) => props.theme.colors.textDark};
  font-weight: 600;
  font-size: 0.95rem;
  
  &:hover { color: ${(props) => props.theme.colors.primary}; }
`;

// Added the Logout Button styles
const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.primary};
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.primary};
    color: white;
  }
`;

function App() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Added the Logout Function logic
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/auth'; // Redirect to login
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContainer>
          <Navbar>
            <Brand to="/">CampusHub</Brand>
            
            <SearchBar placeholder="Search for food, books, services, or tutors..." />

            <NavLinks>
              <NavLink to="/">Home</NavLink>
              
              {/* Conditional rendering based on whether user is logged in */}
              {userInfo ? (
                <>
                  {/* Changed from /profile to /dashboard */}
                  <NavLink to="/dashboard">Profile</NavLink>
                  <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                </>
              ) : (
                <NavLink to="/auth">Login / Register</NavLink>
              )}
              
              {/* Fake cart icon for e-commerce feel */}
              <div style={{ cursor: 'pointer', fontSize: '1.2rem' }}>🛒</div>
            </NavLinks>
          </Navbar>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* NEW: Traffic Controller routes */}
            <Route path="/dashboard" element={<DashboardHub />} />
            <Route path="/profile" element={<DashboardHub />} /> {/* Fallback for old links */}
            
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;