import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../src/config';

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    // Check if token exists
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return false;
    }

    // Check if token is expired locally first
    if (isTokenExpired(token)) {
      console.log('Token is expired locally');
      await clearAuthData();
      return false;
    }

    // Verify token with backend
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200 && response.data.user) {
      console.log('Token is valid, user is logged in');
      return true;
    }

    return false;
  } catch (error) {
    console.log('Token validation failed:', error);
    // Clear invalid token
    await clearAuthData();
    return false;
  }
};

export const clearAuthData = async () => {
  try {
    console.log('🧹 Clearing authentication data...');
    
    // Get all keys from AsyncStorage to ensure we clear everything
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => 
      key.includes('token') || 
      key.includes('user') || 
      key.includes('auth') ||
      key.includes('health') ||
      key.includes('login')
    );
    
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
      console.log('✅ Cleared auth keys:', authKeys);
    }
    
    // Also clear the specific keys we know about
    await AsyncStorage.multiRemove([
      'token',
      'userToken',
      'userFullName',
      'userEmail',
      'userId',
      'userHealthData',
      'authToken',
      'refreshToken'
    ]);
    
    console.log('✅ Authentication data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing authentication data:', error);
    throw error;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode the JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.log('Error checking token expiration:', error);
    return true; // Consider expired if we can't decode
  }
};

// Health data interface
export interface HealthData {
  name?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  activityLevel?: string;
  sleepHours?: string;
  dietPreference?: string;
  stressLevel?: string;
  healthGoal?: string;
  bmi?: string;
  bmiCategory?: string;
  healthScore?: string;
  activityRecommendation?: string;
  dietRecommendation?: string;
  sleepRecommendation?: string;
  stressRecommendation?: string;
  roadmap?: string;
}

// Get user's health data from AsyncStorage
export const getUserHealthData = async (): Promise<HealthData | null> => {
  try {
    const healthDataString = await AsyncStorage.getItem('userHealthData');
    if (healthDataString) {
      const healthData = JSON.parse(healthDataString);
      console.log('Retrieved health data from AsyncStorage:', healthData);
      return healthData;
    }
    return null;
  } catch (error) {
    console.log('Error getting health data from AsyncStorage:', error);
    return null;
  }
};

// Save user's health data to AsyncStorage
export const saveUserHealthData = async (healthData: HealthData): Promise<void> => {
  try {
    await AsyncStorage.setItem('userHealthData', JSON.stringify(healthData));
    console.log('Health data saved to AsyncStorage:', healthData);
  } catch (error) {
    console.log('Error saving health data to AsyncStorage:', error);
  }
};

// Get authentication token from AsyncStorage
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      return token;
    }
    return null;
  } catch (error) {
    console.log('Error getting auth token:', error);
    return null;
  }
}; 