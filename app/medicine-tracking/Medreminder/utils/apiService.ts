import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, MedicationSchedule, DoseLog } from '../models/MedicationModels';
import BASE_URL from "../../../../src/config";

const API_BASE_URL = `${BASE_URL}/api`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private static async getAuthToken(): Promise<string | null> {
    try {
      // Check multiple token keys for compatibility
      const tokenKeys = ['authToken', 'token', 'userToken'];
      
      for (const key of tokenKeys) {
        const token = await AsyncStorage.getItem(key);
        if (token) {
          console.log(`Found token in ${key}`);
          return token;
        }
      }
      
      console.log('No auth token found in any storage key');
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`🌐 Making API request to: ${url}`);
      console.log(`🔑 Auth token: ${token ? 'Present' : 'Missing'}`);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestBody = options.body ? JSON.parse(options.body as string) : null;
      console.log(`📤 Request body:`, requestBody);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📥 Response status: ${response.status}`);
      console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log(`📥 Response data:`, data);

      if (!response.ok) {
        console.error(`❌ API request failed: ${response.status} - ${data.message || 'Unknown error'}`);
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      console.log(`✅ API request successful`);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ API request failed:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  // Medication API calls
  static async getMedications(): Promise<Medication[]> {
    console.log('🔍 Fetching medications from API...');
    const response = await this.makeRequest<Medication[]>('/medicines/getmed');
    const result = response.success ? response.data || [] : [];
    console.log(`📋 Retrieved ${result.length} medications`);
    return result;
  }

  static async addMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    console.log('➕ Adding medication to API:', medication);
    const response = await this.makeRequest('/medicines/postmed', {
      method: 'POST',
      body: JSON.stringify(medication),
    });
    const success = response.success;
    console.log(`✅ Medication add ${success ? 'successful' : 'failed'}`);
    return success;
  }

  static async updateMedication(medication: Medication): Promise<boolean> {
    console.log('🔄 Updating medication in API:', medication.id);
    const response = await this.makeRequest(`/medicines/updatemed/${medication.id}`, {
      method: 'PUT',
      body: JSON.stringify(medication),
    });
    const success = response.success;
    console.log(`✅ Medication update ${success ? 'successful' : 'failed'}`);
    return success;
  }

  static async deleteMedication(medicationId: string): Promise<boolean> {
    console.log('🗑️ Deleting medication from API:', medicationId);
    const response = await this.makeRequest(`/medicines/deletemed/${medicationId}`, {
      method: 'DELETE',
    });
    const success = response.success;
    console.log(`✅ Medication delete ${success ? 'successful' : 'failed'}`);
    return success;
  }

  // Schedule API calls
  static async getSchedules(): Promise<MedicationSchedule[]> {
    console.log('🔍 Fetching schedules from API...');
    const response = await this.makeRequest<MedicationSchedule[]>('/medicines/getschedules');
    const result = response.success ? response.data || [] : [];
    console.log(`📋 Retrieved ${result.length} schedules`);
    return result;
  }

  static async addSchedule(schedule: Omit<MedicationSchedule, 'id' | 'createdAt'>): Promise<boolean> {
    console.log('➕ Adding schedule to API:', schedule);
    const response = await this.makeRequest('/medicines/postschedule', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
    const success = response.success;
    console.log(`✅ Schedule add ${success ? 'successful' : 'failed'}`);
    return success;
  }

  static async deleteSchedule(scheduleId: string): Promise<boolean> {
    console.log('🗑️ Deleting schedule from API:', scheduleId);
    const response = await this.makeRequest(`/medicines/deleteschedule/${scheduleId}`, {
      method: 'DELETE',
    });
    const success = response.success;
    console.log(`✅ Schedule delete ${success ? 'successful' : 'failed'}`);
    return success;
  }

  // Dose Log API calls
  static async getDoseLogs(): Promise<DoseLog[]> {
    console.log('🔍 Fetching dose logs from API...');
    const response = await this.makeRequest<DoseLog[]>('/medicines/getlogs');
    const result = response.success ? response.data || [] : [];
    console.log(`📋 Retrieved ${result.length} dose logs`);
    return result;
  }

  static async addDoseLog(log: Omit<DoseLog, 'id' | 'loggedAt'>): Promise<boolean> {
    console.log('➕ Adding dose log to API:', log);
    const response = await this.makeRequest('/medicines/postlog', {
      method: 'POST',
      body: JSON.stringify(log),
    });
    const success = response.success;
    console.log(`✅ Dose log add ${success ? 'successful' : 'failed'}`);
    return success;
  }

  static async updateDoseLog(log: DoseLog): Promise<boolean> {
    console.log('🔄 Updating dose log in API:', log.id);
    const response = await this.makeRequest(`/medicines/updatelog/${log.id}`, {
      method: 'PUT',
      body: JSON.stringify(log),
    });
    const success = response.success;
    console.log(`✅ Dose log update ${success ? 'successful' : 'failed'}`);
    return success;
  }
}

export default ApiService; 