import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import API from '../api/axios';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const RequestCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ProviderInfo = styled.div`
  flex: 1;
  h3 { margin: 0 0 5px 0; color: #2d3436; }
  p { margin: 3px 0; color: #636e72; font-size: 0.95rem; }
  .badge {
    display: inline-block;
    padding: 4px 8px;
    background: #e8f4fd;
    color: #2980b9;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  
  background: ${(props) => props.approve ? '#2ecc71' : '#e74c3c'};
  color: white;

  &:hover { opacity: 0.8; }
`;

const AdminDashboard = () => {
  const [pendingShops, setPendingShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all pending requests when Admin logs in
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const { data } = await API.get('/admin/pending-shops');
        setPendingShops(data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingRequests();
  }, []);

  // Handle Approving a Shop
  const handleApprove = async (shopId) => {
    if (!window.confirm("Are you sure you want to approve this provider? They will go live immediately.")) return;
    
    try {
      await API.put(`/admin/approve-shop/${shopId}`);
      // Remove the approved shop from the screen
      setPendingShops(pendingShops.filter(shop => shop._id !== shopId));
      alert("Provider Approved! They are now live on the platform.");
    } catch (error) {
      alert("Error approving provider.");
    }
  };

  // Handle Rejecting a Shop
  const handleReject = async (shopId) => {
    if (!window.confirm("Reject this application?")) return;
    alert("Rejection logic would go here (e.g., delete the shop request or mark status as 'Rejected').");
    // You can add a similar PUT route for rejection later!
  };

  return (
    <DashboardContainer>
      <h2 style={{ color: '#2d3436', marginBottom: '0.5rem' }}>🛡️ Admin Control Center</h2>
      <p style={{ color: '#636e72', marginBottom: '2rem' }}>Review and approve new service providers, restaurants, and tutors.</p>

      {loading ? (
        <p>Loading pending requests...</p>
      ) : pendingShops.length > 0 ? (
        pendingShops.map((shop) => (
          <RequestCard key={shop._id}>
            <ProviderInfo>
              <span className="badge">{shop.shopType}</span>
              <h3>{shop.name}</h3>
              
              {/* NEW: Display Gender and Experience */}
              {(shop.gender || shop.experience) && (
                <div style={{ display: 'flex', gap: '10px', margin: '8px 0' }}>
                  {shop.gender && <span style={{ background: '#f1f2f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#2d3436' }}>👤 {shop.gender}</span>}
                  {shop.experience && <span style={{ background: '#f1f2f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#2d3436' }}>⭐ {shop.experience}</span>}
                </div>
              )}

              <p><b>Description:</b> {shop.description}</p>
              <p><b>Pricing:</b> {shop.price}</p>
              <p><b>Contact:</b> {shop.phone} | <b>Address:</b> {shop.address}</p>
              <p style={{ fontSize: '0.85rem', color: '#b2bec3', marginTop: '10px' }}>
                Requested by User ID: {shop.owner?._id || shop.owner}
              </p>
            </ProviderInfo>

            <ActionButtons>
              <Button onClick={() => handleReject(shop._id)}>❌ Reject</Button>
              <Button approve onClick={() => handleApprove(shop._id)}>✅ Approve</Button>
            </ActionButtons>
          </RequestCard>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '12px' }}>
          <h3 style={{ color: '#2d3436' }}>All Caught Up! 🎉</h3>
          <p style={{ color: '#888' }}>There are no pending provider requests at the moment.</p>
        </div>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;