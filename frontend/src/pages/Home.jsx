import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ProductCard from '../components/ProductCard';
import OcrScanner from '../components/OcrScanner'; 
import API from '../api/axios'; 

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1300px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.textDark};
  margin: 2rem 0 1rem 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavLabel = styled.h4`
  color: ${(props) => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
  margin: 1.5rem 0 0.5rem 0;
`;

const CategoryWrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: none; 
  &::-webkit-scrollbar { display: none; } 
`;

const LiveCategoryWrapper = styled(CategoryWrapper)`
  background: #f0f7ff;
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed #74b9ff;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 90px;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: translateY(-3px); }
`;

const IconCircle = styled.div`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  border: 3px solid ${(props) => props.active ? props.theme.colors.primary : 'transparent'};
  transition: border 0.3s ease;
`;

const CategoryText = styled.span`
  font-size: 0.85rem;
  font-weight: ${(props) => props.active ? '800' : '600'};
  color: ${(props) => props.active ? props.theme.colors.primary : props.theme.colors.textDark};
  text-align: center;
  transition: color 0.3s ease;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
`;

const campusCategories = [
  { icon: '🌟', name: 'All' },
  { icon: '🍱', name: 'Ghar Ka Khana' },
  { icon: '👨‍🏫', name: 'Tutors' },
  { icon: '🛠', name: 'Services' },
  { icon: '📄', name: 'OCR Notes' },
  { icon: '🎓', name: 'Marketplace' },
  { icon: '💼', name: 'Internships' },
  { icon: '🧺', name: 'Laundry' },
  { icon: '🏠', name: 'PG/Hostel' },
];

const liveCategories = [
  { icon: '🍔', name: 'Restaurants' },
  { icon: '🛒', name: 'Groceries' },
  { icon: '🏥', name: 'Medical SOS' },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyFood, setNearbyFood] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]); 
  const [nearbyTutors, setNearbyTutors] = useState([]); 
  const [nearbyServices, setNearbyServices] = useState([]); 

  // Get user location just for the UI text (optional now)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location access denied or failed", error);
        }
      );
    }
  }, []);

  // FIXED: Fetch Food globally, bypassing GPS!
  useEffect(() => {
    if (activeCategory === 'All' || activeCategory === 'Ghar Ka Khana') {
      const fetchNearbyFood = async () => {
        try {
          const { data } = await API.get(`/food/nearby?lat=&lng=&type=Ghar Ka Khana`);
          setNearbyFood(data);
        } catch (error) {
          console.error("Error fetching nearby food:", error);
        }
      };
      fetchNearbyFood();
    }
  }, [activeCategory]);

  // FIXED: Fetch Restaurants, Groceries & Medical globally, bypassing GPS!
  useEffect(() => {
    if (['Groceries', 'Medical SOS', 'Restaurants'].includes(activeCategory)) {
      const fetchNearbyShops = async () => {
        try {
          let type = 'Grocery';
          if (activeCategory === 'Medical SOS') type = 'Medical';
          if (activeCategory === 'Restaurants') type = 'Restaurant';
          
          const { data } = await API.get(`/shop/nearby?lat=&lng=&type=${type}`);
          setNearbyShops(data);
        } catch (error) {
          console.error("Error fetching nearby shops:", error);
        }
      };
      fetchNearbyShops();
    }
  }, [activeCategory]);

  // FIXED: Fetch Tutors & Services globally.
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const tutorsRes = await API.get(`/shop/nearby?lat=&lng=&type=Tutors`);
        setNearbyTutors(tutorsRes.data);

        const servicesRes = await API.get(`/shop/nearby?lat=&lng=&type=Services`);
        setNearbyServices(servicesRes.data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    fetchProviders();
  }, []); 

  return (
    <PageContainer>
      
      <NavLabel>Campus Hub Modules</NavLabel>
      <CategoryWrapper>
        {campusCategories.map((cat, index) => (
          <CategoryItem 
            key={index}
            onClick={() => setActiveCategory(cat.name)}
          >
            <IconCircle active={activeCategory === cat.name}>{cat.icon}</IconCircle>
            <CategoryText active={activeCategory === cat.name}>{cat.name}</CategoryText>
          </CategoryItem>
        ))}
      </CategoryWrapper>

      <NavLabel>📍 Live Local Services</NavLabel>
      <LiveCategoryWrapper>
        {liveCategories.map((cat, index) => (
          <CategoryItem 
            key={index}
            onClick={() => setActiveCategory(cat.name)}
          >
            <IconCircle active={activeCategory === cat.name}>{cat.icon}</IconCircle>
            <CategoryText active={activeCategory === cat.name}>{cat.name}</CategoryText>
          </CategoryItem>
        ))}
      </LiveCategoryWrapper>

      {/* Featured Section 1: Food */}
      {(activeCategory === 'All' || activeCategory === 'Ghar Ka Khana') && (
        <>
          <SectionTitle>
            🍱 Trending Homemade Food {nearbyFood.length > 0 ? "(Live)" : ""}
          </SectionTitle>
          <Grid>
            {nearbyFood.length > 0 && activeCategory === 'Ghar Ka Khana' ? (
              nearbyFood.map((item) => (
                <ProductCard 
                  key={item._id}
                  title={item.name} 
                  subtext={`By ${item.provider?.name || 'Local Kitchen'}`} 
                  price={item.price} 
                  badge="Homemade" 
                  btnText="Order"
                  img={item.image || "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80"} 
                />
              ))
            ) : (
              <>
                <ProductCard title="Rajma Chawal Combo" subtext="By Mrs. Sharma" price="80" badge="Bestseller" btnText="Order" img="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80" />
                <ProductCard title="Aloo Paratha (2 Pcs)" subtext="By Student Kitchen" price="50" badge="Breakfast" btnText="Order" img="https://img.freepik.com/premium-photo/authentic-aloo-dhaniya-paratha-popular-street-food-aloo-paratha-alu-paratha-picture_1020697-123129.jpg" />
                <ProductCard title="Chicken Biryani" subtext="By Zaika House" price="120" badge="Dinner" btnText="Order" img="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80" />
              </>
            )}
          </Grid>
        </>
      )}

      {/* Tutors Section */}
      {(activeCategory === 'All' || activeCategory === 'Tutors') && (
        <>
          <SectionTitle>👨‍🏫 Expert Tutors {nearbyTutors.length > 0 ? "(Live on Platform)" : ""}</SectionTitle>
          <Grid>
            {nearbyTutors.length > 0 ? (
              nearbyTutors.map(tutor => (
                <ProductCard 
                  key={tutor._id}
                  title={tutor.name}
                  subtext={tutor.experience ? `⭐ ${tutor.experience} • ${tutor.description}` : tutor.description}
                  price={tutor.price}
                  badge="Tutor"
                  btnText="Contact"
                  img="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&q=80"
                />
              ))
            ) : activeCategory === 'Tutors' ? (
               <p style={{ color: '#888', gridColumn: '1 / -1' }}>No registered tutors found yet.</p>
            ) : null}

            {activeCategory === 'All' && nearbyTutors.length === 0 && (
              <ProductCard title="Engineering Math Tutor (Dummy)" subtext="3 Years Exp • 1st Year Syllabus" price="₹500/hr" badge="Tutor" btnText="Contact" img="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=500&q=80" />
            )}
          </Grid>
        </>
      )}

      {activeCategory === 'OCR Notes' && (
        <>
          <SectionTitle>📄 Scan & Digitize Notes</SectionTitle>
          <OcrScanner />
        </>
      )}

      {(activeCategory === 'All' || activeCategory === 'Marketplace') && (
        <>
          <SectionTitle>🎓 Used Books & Notes</SectionTitle>
          <Grid>
            <ProductCard title="Engineering Math Vol 2" subtext="Condition: Good • BCA 2nd Yr" price="250" badge="Second-Hand" btnText="Buy Now" img="https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80" />
            <ProductCard title="Physics Handwritten Notes" subtext="Sem 1 • Scanned PDF" price="40" badge="OCR Verified" btnText="Download" img="https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&q=80" />
            <ProductCard title="Drafting Table & Kit" subtext="Condition: Like New • Architecture" price="800" badge="Equipment" btnText="Contact" img="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80" />
          </Grid>
        </>
      )}

      {/* Services Section */}
      {(activeCategory === 'All' || activeCategory === 'Services') && (
        <>
          <SectionTitle>🛠 Quick Services</SectionTitle>
          <Grid>
            {nearbyServices.length > 0 ? (
              nearbyServices.map(service => (
                <ProductCard 
                  key={service._id}
                  title={service.name}
                  subtext={service.experience ? `⭐ ${service.experience} • ${service.description}` : service.description}
                  price={service.price}
                  badge="Service"
                  btnText="Book"
                  img="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80"
                />
              ))
            ) : activeCategory === 'Services' ? (
               <p style={{ color: '#888', gridColumn: '1 / -1' }}>No registered services found yet.</p>
            ) : null}

            {activeCategory === 'All' && nearbyServices.length === 0 && (
              <>
                <ProductCard title="AC Repair & Cleaning" subtext="Tech: Ramesh • Same Day" price="499" badge="Electrical" btnText="Book" img="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80" />
                <ProductCard title="Room Cleaning (Maid)" subtext="Deep clean for single room" price="150" badge="Cleaning" btnText="Book" img="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80" />
              </>
            )}
          </Grid>
        </>
      )}

      {/* FIXED: Restaurants Section! */}
      {(activeCategory === 'Restaurants') && (
        <>
          <SectionTitle>🍔 Nearby Restaurants {nearbyShops.length > 0 ? "(Live)" : ""}</SectionTitle>
          <Grid>
            {nearbyShops.length > 0 ? (
              nearbyShops.map(shop => (
                <ProductCard 
                  key={shop._id} 
                  title={shop.name} 
                  subtext={shop.address} 
                  price={shop.price || "Menu inside"} 
                  badge="Restaurant" 
                  btnText="View Menu" 
                  img="https://images.unsplash.com/photo-1517248135467-4c7ed9d8c47c?w=500&q=80" 
                />
              ))
            ) : (
               <p style={{ color: '#888', gridColumn: '1 / -1' }}>No registered restaurants found yet.</p>
            )}
          </Grid>
        </>
      )}

      {/* FIXED: Groceries Section! */}
      {(activeCategory === 'All' || activeCategory === 'Groceries') && (
        <>
          <SectionTitle>🛒 Nearby Grocery Stores {activeCategory === 'Groceries' && nearbyShops.length > 0 ? "(Live)" : ""}</SectionTitle>
          <Grid>
            {nearbyShops.length > 0 && activeCategory === 'Groceries' ? (
              nearbyShops.map(shop => (
                <ProductCard 
                  key={shop._id} 
                  title={shop.name} 
                  subtext={shop.address} 
                  price={shop.price || "Essentials"} 
                  badge="Grocery" 
                  btnText="Shop Now" 
                  img="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80" 
                />
              ))
            ) : activeCategory === 'Groceries' ? (
               <p style={{ color: '#888', gridColumn: '1 / -1' }}>No registered grocery stores found yet.</p>
            ) : null}

            {activeCategory === 'All' && nearbyShops.length === 0 && (
               <ProductCard title="FreshMart Groceries" subtext="Campus Square" price="₹149 onwards" badge="Grocery" btnText="Shop Now" img="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80" />
            )}
          </Grid>
        </>
      )}

      {/* FIXED: Medical Section! */}
      {(activeCategory === 'All' || activeCategory === 'Medical SOS') && (
        <>
          <SectionTitle>🏥 Emergency Medical Support {activeCategory === 'Medical SOS' && nearbyShops.length > 0 ? "(Live)" : ""}</SectionTitle>
          
          {activeCategory === 'Medical SOS' && (
            <div style={{ background: '#fff0f0', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '2px solid #ff6b6b' }}>
              <h3 style={{ color: '#ff6b6b', marginTop: 0 }}>🚨 SOS System</h3>
              <p>Clicking the SOS button below will instantly share your location with the nearest registered medical shops.</p>
              <button 
                style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => alert("SOS Triggered! Alerting nearby medical shops...")}
              >
                TRIGGER EMERGENCY SOS
              </button>
            </div>
          )}

          <Grid>
            {nearbyShops.length > 0 && activeCategory === 'Medical SOS' ? (
              nearbyShops.map(shop => (
                <ProductCard 
                  key={shop._id} 
                  title={shop.name} 
                  subtext={shop.address} 
                  price="N/A" 
                  badge={shop.isSosEnabled ? "SOS ACTIVE" : "Pharmacy"} 
                  btnText="Order Medicine" 
                  img="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=500&q=80" 
                />
              ))
            ) : activeCategory === 'Medical SOS' ? (
              <p style={{ color: '#888', gridColumn: '1 / -1' }}>No registered medical shops found yet.</p>
            ) : null}

            {activeCategory === 'All' && nearbyShops.length === 0 && (
              <ProductCard title="City Care Pharmacy" subtext="Main Road" price="N/A" badge="SOS ACTIVE" btnText="Order Medicine" img="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=500&q=80" />
            )}
          </Grid>
        </>
      )}

      {['Internships', 'Laundry', 'PG/Hostel'].includes(activeCategory) && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
          <h3>No items found for {activeCategory} yet.</h3>
          <p>Check back later once providers register!</p>
        </div>
      )}

    </PageContainer>
  );
};

export default Home;