import { getAuthToken } from '../../../../utils/authUtils';
import BASE_URL from '../../../../../src/config';

export interface UserMacros {
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  bmr: number;
  tdee: number;
  activity_level: string;
  goal: string;
}

export interface MacroResponse {
  success: boolean;
  data: UserMacros;
}

export const fetchUserMacros = async (): Promise<UserMacros> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required to fetch macros');
    }

    console.log('🔍 Fetching user macros from:', `${BASE_URL}/api/macros/user-macros`);
    
    const response = await fetch(`${BASE_URL}/api/macros/user-macros`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Macros API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch user macros:', response.status, errorText);
      throw new Error(`Failed to fetch macros: ${response.status} - ${errorText}`);
    }

    const data: MacroResponse = await response.json();
    console.log('✅ User macros fetched successfully:', data);

    if (!data.success || !data.data) {
      throw new Error('Invalid response format from macros API');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error fetching user macros:', error);
    throw error;
  }
}; 