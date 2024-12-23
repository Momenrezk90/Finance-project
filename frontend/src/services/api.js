import axios from 'axios';

const API_URL = 'http://localhost:5000/api';  // Replace with your backend URL

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Registration failed');
  }
};

// Login an existing user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const token = response.data.token; // Extract token from response
    localStorage.setItem('token', token); // Store token in local storage
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Login failed');
  }
};

// Fetch all bonuses
export const getBonuses = async () => {
  const token = localStorage.getItem('token'); // Retrieve token from local storage
  try {
    const response = await axios.get(`${API_URL}/bonuses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Failed to fetch bonuses');
  }
};

// Create a new bonus
export const createBonus = async (bonusData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_URL}/bonuses`, bonusData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Failed to create bonus');
  }
};

// Update an existing bonus
export const updateBonus = async (bonusId, bonusData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put(`${API_URL}/bonuses/${bonusId}`, bonusData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Failed to update bonus');
  }
};

// Delete a bonus
export const deleteBonus = async (bonusId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete(`${API_URL}/bonuses/${bonusId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Failed to delete bonus');
  }
};

// Fetch the details of a specific bonus
export const getBonusById = async (bonusId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/bonuses/${bonusId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Failed to fetch bonus details');
  }
};

// Approve a bonus
export const approveBonus = async (bonusId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put(`${API_URL}/bonuses/${bonusId}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return the updated bonus data
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Failed to approve bonus');
  }
};
