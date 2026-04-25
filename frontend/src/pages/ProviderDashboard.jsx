import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import API from '../api/axios';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const StatusBanner = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: bold;
  background: ${(props) => {
    if (props.status === 'Pending') return '#fff3cd';
    if (props.status === 'Approved') return '#d4edda';
    return '#f8d7da';
  }};
  color: ${(props) => {
    if (props.status === 'Pending') return '#856404';
    if (props.status === 'Approved') return '#155724';
    return '#721c24';
  }};
  border: 1px solid ${(props) => {
    if (props.status === 'Pending') return '#ffeeba';
    if (props.status === 'Approved') return '#c3e6cb';
    return '#f5c6cb';
  }};
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #eee;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3436;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  &:focus { border-color: #e74c3c; }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: white;
  &:focus { border-color: #e74c3c; }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  resize: vertical;
  min-height: 100px;
  &:focus { border-color: #e74c3c; }
`;

const SubmitButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { background: #ccc; cursor: not-allowed; }
`;

const ProviderDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [providerData, setProviderData] = useState(null); 
  
  // UPDATED: Added gender and experience to the initial state
  const [formData, setFormData] = useState({
    name: '',
    shopType: 'Services', 
    description: '',
    price: '',
    address: '',
    phone: '',
    gender: 'Male', // Default selection
    experience: ''  // New field
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await API.get(`/shop/my-listing/${userInfo._id}`);
        if (data) {
          setProviderData(data);
        }
      } catch (error) {
        console.log("No existing listing found, showing registration form.");
      }
    };
    if (userInfo) checkStatus();
  }, [userInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post('/shop/register', {
        ownerId: userInfo._id,
        ...formData,
        lat: 22.5726, 
        lng: 88.3639
      });
      
      alert("Application submitted successfully!");
      setProviderData(data.shop);
    } catch (error) {
      alert("Error submitting application. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (providerData?.status === 'Approved') {
    return (
      <DashboardContainer>
        <StatusBanner status="Approved">
          ✅ Your profile is LIVE! Students can now see your services.
        </StatusBanner>
        <FormCard style={{ textAlign: 'center' }}>
          <h2>{providerData.name}</h2>
          <p style={{ color: '#888' }}>Category: {providerData.shopType}</p>
          <h3 style={{ color: '#e74c3c' }}>{providerData.price}</h3>
          
          {/* Show new fields on the live profile */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '10px 0' }}>
            <span style={{ background: '#f1f2f6', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem' }}>👤 {providerData.gender}</span>
            <span style={{ background: '#f1f2f6', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem' }}>⭐ {providerData.experience}</span>
          </div>

          <p>Description: {providerData.description}</p>
          <hr style={{ margin: '2rem 0', borderColor: '#eee' }} />
          <h3>No active orders right now.</h3>
          <p style={{ color: '#888' }}>When a student requests your service, it will appear here.</p>
        </FormCard>
      </DashboardContainer>
    );
  }

  if (providerData?.status === 'Pending') {
    return (
      <DashboardContainer>
        <StatusBanner status="Pending">
          ⏳ Application Under Review
        </StatusBanner>
        <FormCard style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>We received your application!</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Our Admin team is currently verifying your details for <b>{providerData.name}</b>. 
            Platform security is our top priority. We will activate your profile as soon as verification is complete.
          </p>
        </FormCard>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <h2 style={{ color: '#2d3436', marginBottom: '1.5rem' }}>💼 Become a Provider</h2>
      <p style={{ color: '#636e72', marginBottom: '2rem' }}>Fill out the details below to offer your services, tutoring, or food to the campus.</p>

      <FormCard>
        <form onSubmit={handleSubmit}>
          
          <FormGroup>
            <Label>Service Category</Label>
            <Select name="shopType" value={formData.shopType} onChange={handleChange}>
              <option value="Services">🔧 Handyman / Services (Plumber, AC Repair)</option>
              <option value="Tutors">👨‍🏫 Tutoring / Teaching</option>
              <option value="Restaurant">🍔 Restaurant / Food</option>
              <option value="Medical">🏥 Medical / Pharmacy</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Business or Service Name</Label>
            <Input 
              type="text" 
              name="name" 
              placeholder="e.g., Rahul's Plumbing, Engineering Math Tutor" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>

          <FormGroup>
            <Label>Service Description</Label>
            <TextArea 
              name="description" 
              placeholder="Describe what you do, your experience, and what students can expect..." 
              value={formData.description} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>

          <FormGroup>
            <Label>Pricing / Rate</Label>
            <Input 
              type="text" 
              name="price" 
              placeholder="e.g., ₹200/hr, ₹500 per visit, Menu starts at ₹99" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>

          {/* NEW: Gender and Experience Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <FormGroup style={{ marginBottom: 0 }}>
              <Label>Gender</Label>
              <Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup style={{ marginBottom: 0 }}>
              <Label>Years of Experience</Label>
              <Input 
                type="text" 
                name="experience" 
                placeholder="e.g., 5 years" 
                value={formData.experience} 
                onChange={handleChange} 
                required 
              />
            </FormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label>Contact Phone</Label>
              <Input 
                type="text" 
                name="phone" 
                placeholder="+91 XXXXX XXXXX" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </FormGroup>

            <FormGroup>
              <Label>Service Area / Address</Label>
              <Input 
                type="text" 
                name="address" 
                placeholder="Where are you located?" 
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
            </FormGroup>
          </div>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Admin Approval'}
          </SubmitButton>

        </form>
      </FormCard>
    </DashboardContainer>
  );
};

export default ProviderDashboard;