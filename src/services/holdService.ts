import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('🔍 Token from AsyncStorage:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 Authorization header set:', config.headers.Authorization);
    } else {
      console.log('❌ No token found in AsyncStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface HoldRecord {
  id: number;
  user_id: number;
  duration: number;
  date: string;
}

export const addHoldRecord = async (duration: number): Promise<HoldRecord> => {
  try {
    const response = await api.post('/api/hold/addhold', { duration });
    console.log('✅ Hold record added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding hold record:', error);
    throw error;
  }
};

export const getHoldRecords = async (): Promise<HoldRecord[]> => {
  try {
    const response = await api.get('/api/hold/gethold');
    console.log('✅ Hold records fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching hold records:', error);
    throw error;
  }
}; 