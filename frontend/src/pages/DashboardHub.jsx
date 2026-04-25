import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile'; 
import ProviderDashboard from './ProviderDashboard'; 
import AdminDashboard from './AdminDashboard';

const DashboardHub = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    // If not logged in, kick them back to login page
    if (!userInfo) {
      navigate('/auth');
    }
  }, [navigate, userInfo]);

  if (!userInfo) return null;

  // TRAFFIC CONTROLLER: Render a completely different screen based on role
  if (userInfo.role === 'Admin') {
    return <AdminDashboard />;
  } 
  
  // FIX: Added 'ServiceProvider' to match the Auth dropdown exactly
  if (userInfo.role === 'ServiceProvider' || userInfo.role === 'Provider') {
    return <ProviderDashboard />;
  }

  // Default fallback is the Student Profile we just finished building
  return <Profile />;
};

export default DashboardHub;