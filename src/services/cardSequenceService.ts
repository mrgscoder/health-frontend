import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

export interface CardPosition {
  card_name: string;
  position_number: number;
}

export interface CardSequenceResponse {
  success: boolean;
  cardSequence?: CardPosition[];
  message?: string;
}

class CardSequenceService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async getUserCardSequence(): Promise<CardSequenceResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/card-sequence/sequence`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching card sequence:', error);
      throw error;
    }
  }

  async updateCardPositions(cardSequence: CardPosition[]): Promise<CardSequenceResponse> {
    try {
      console.log('🔐 Getting auth token...');
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📡 Making API call to update card positions...');
      const response = await fetch(`${BASE_URL}/api/card-sequence/sequence`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardSequence }),
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${data.message || 'Unknown error'}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error updating card sequence:', error);
      throw error;
    }
  }

  async resetToDefault(): Promise<CardSequenceResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/api/card-sequence/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resetting card sequence:', error);
      throw error;
    }
  }
}

export default new CardSequenceService(); 