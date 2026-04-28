import axios from 'axios';

const API = axios.create({
  // Updated to your live Render backend address!
  baseURL: 'https://orbito-backend-5mke.onrender.com/api', 
});

// Automatically attach the JWT token to requests if the user is logged in
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return req;
});

export default API;