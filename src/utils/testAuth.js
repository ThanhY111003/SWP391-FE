// src/utils/testAuth.js
import apiClient from './axiosConfig';

export const testAuthentication = async () => {
  try {
    console.log('Testing authentication...');
    console.log('Token:', localStorage.getItem('token'));
    console.log('Role:', localStorage.getItem('role'));
    console.log('Username:', localStorage.getItem('username'));
    
    // Test a simple API call
    const response = await apiClient.get('/api/dealer/orders');
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Authentication test failed:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  
  return {
    isAuthenticated: !!token,
    token,
    role,
    username
  };
};
