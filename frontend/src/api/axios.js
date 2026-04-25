import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Your Node.js server address
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