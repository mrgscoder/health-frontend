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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access, clearing auth data');
      AsyncStorage.multiRemove(['token', 'userToken', 'userFullName', 'userEmail', 'userId']);
    }
    return Promise.reject(error);
  }
);

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface ScheduledDose {
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  taken: boolean;
  logId?: string;
}

// Add new medicine
export const addMedicine = async (medicineData: {
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}): Promise<{ message: string; id: number }> => {
  try {
    console.log('🚀 addMedicine API call with data:', medicineData);
    const response = await api.post('/api/medicine/addmed', medicineData);
    console.log('✅ addMedicine API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding medicine:', error);
    throw error;
  }
};

// Get all medicines for the user
export const getAllMedicines = async (): Promise<Medicine[]> => {
  try {
    const response = await api.get('/api/medicine/allmed');
    return response.data;
  } catch (error) {
    console.error('Error fetching all medicines:', error);
    throw error;
  }
};

// Get today's scheduled medicines
export const getTodayMedicines = async (): Promise<ScheduledDose[]> => {
  try {
    const response = await api.get('/api/medicine/todaymed');
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s medicines:', error);
    throw error;
  }
};

// Mark medicine as taken/not taken
export const markMedicineTaken = async (logData: {
  medicineId: string;
  date: string;
  time: string;
  taken: boolean;
}): Promise<any> => {
  try {
    const response = await api.post('/api/medicine/marktaken', logData);
    return response.data;
  } catch (error) {
    console.error('Error marking medicine:', error);
    throw error;
  }
};

// Delete medicine
export const deleteMedicine = async (medicineId: string): Promise<any> => {
  try {
    const response = await api.delete(`/api/medicine/deletemed/${medicineId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting medicine:', error);
    throw error;
  }
}; 