import React, { useState } from 'react';
import styled from 'styled-components';
import API from '../api/axios';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
`;

const AuthCard = styled.div`
  background: ${(props) => props.theme.colors.cardBg};
  padding: 2rem;
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow: ${(props) => props.theme.shadows.card};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  text-align: center;
  color: ${(props) => props.theme.colors.textDark};
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  &:focus { border-color: ${(props) => props.theme.colors.secondary}; }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

const ToggleText = styled.p`
  text-align: center;
  color: ${(props) => props.theme.colors.textLight};
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { color: ${(props) => props.theme.colors.primary}; }
`;

const ErrorMsg = styled.p`
  color: red;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
`;

// NEW: Styled component for the Admin Secret box
const SecretBox = styled.div`
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  border: 1px dashed #e1b12c;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  
  // UPDATED: Added adminSecret to the initial state
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Normal',
    adminSecret: '' 
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Hitting your existing backend login route
        const { data } = await API.post('/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });
        
        localStorage.setItem('userInfo', JSON.stringify(data));
        alert(`Login Successful! Welcome back, ${data.name}`);
        window.location.href = '/dashboard'; // UPDATED: Redirect to dashboard
      } else {
        // Hitting your existing backend register route
        const { data } = await API.post('/auth/register', formData);
        localStorage.setItem('userInfo', JSON.stringify(data));
        alert(`Registration Successful! Welcome to CampusHub as a ${data.role}`);
        window.location.href = '/dashboard'; // UPDATED: Redirect to dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container>
      <AuthCard>
        <Title>{isLogin ? 'Welcome Back' : 'Join CampusHub'}</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <Input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
              
              <Select name="role" onChange={handleChange} value={formData.role}>
                <option value="Normal">Normal User</option>
                <option value="Student">Student (Requires .edu / .ac.in email)</option>
                <option value="ServiceProvider">Service Provider</option>
                {/* NEW: Admin Option */}
                <option value="Admin">Administrator</option>
              </Select>

              {/* NEW: DYNAMIC SECURITY FIELD - Only shows if they select Admin */}
              {formData.role === 'Admin' && (
                <SecretBox>
                  <label style={{ fontSize: '0.85rem', color: '#856404', fontWeight: 'bold' }}>
                    Admin Verification Required
                  </label>
                  <Input 
                    type="password" 
                    name="adminSecret" 
                    placeholder="Enter Admin Secret Key" 
                    onChange={handleChange} 
                    required 
                  />
                </SecretBox>
              )}
            </>
          )}
          
          <Input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          <Input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          
          <Button type="submit">{isLogin ? 'Login' : 'Register'}</Button>
        </form>

        <ToggleText onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </ToggleText>
      </AuthCard>
    </Container>
  );
};

export default Auth;