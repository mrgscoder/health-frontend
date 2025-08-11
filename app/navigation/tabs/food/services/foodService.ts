import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from '../../../../utils/authUtils';
import BASE_URL from '../../../../../src/config';
import { formatDateKey } from '../utils/foodUtils';
import { FoodItem, DetailedFoodItem, NewFood } from '../types/foodTypes';
import { fetchImagesForFoodItems } from './imageService';

const API_BASE_URL = `${BASE_URL}/api`;

export const fetchFoodData = async (mealType: string): Promise<FoodItem[]> => {
  const mealEndpoint = mealType.toLowerCase();
  console.log('Fetching from:', `${BASE_URL}/api/foodlist/${mealEndpoint}`);
  
  const response = await fetch(`${BASE_URL}/api/foodlist/${mealEndpoint}`);
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Food data received:', data);
    
    // Fetch images for the food items
    try {
      const dataWithImages = await fetchImagesForFoodItems(data);
      console.log('Food data with images:', dataWithImages);
      return dataWithImages as FoodItem[];
    } catch (error) {
      console.error('Error fetching images for food items:', error);
      // Return original data if image fetching fails
      return data;
    }
  } else {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`Failed to fetch food data: ${response.status}`);
  }
};

export const fetchFoodDetails = async (foodId: number): Promise<DetailedFoodItem | null> => {
  try {
    console.log('Fetching food details from:', `${BASE_URL}/api/foodlist/${foodId}`);
    
    const response = await fetch(`${BASE_URL}/api/foodlist/${foodId}`);
    console.log('Food details response status:', response.status);
    
    if (response.ok) {
      const detailedFood = await response.json();
      console.log('Detailed food data received:', detailedFood);
      return detailedFood;
    } else {
      console.error('Failed to fetch food details:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Network error fetching food details:', error);
    return null;
  }
};

export const fetchSavedFoodData = async (date: Date, retryCount = 0) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('No token available for fetching saved food data');
      return { records: [] };
    }

    const dateKey = formatDateKey(date);
    console.log('Fetching saved food data for date:', dateKey);
    
    const apiUrl = `${BASE_URL}/api/food/getfood?date=${dateKey}`;
    console.log('Making API call to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('Failed to fetch saved food data:', response.status, errorText);
      
      if (retryCount === 0 && response.status >= 500) {
        console.log('Retrying API call...');
        setTimeout(() => {
          return fetchSavedFoodData(date, 1);
        }, 1000);
        return { records: [] };
      }
      return { records: [] };
    }
  } catch (error) {
    console.error('Error fetching saved food data:', error);
    
    if (retryCount === 0) {
      console.log('Retrying API call due to network error...');
      setTimeout(() => {
        return fetchSavedFoodData(date, 1);
      }, 1000);
      return { records: [] };
    }
    return { records: [] };
  }
};

export const addFoodToDiary = async (
  selectedDate: Date,
  selectedMeal: string,
  foodData: FoodItem | DetailedFoodItem,
  quantity: number = 1
) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Please log in to add food items.');
  }

  const response = await fetch(`${BASE_URL}/api/food/addfood`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: formatDateKey(selectedDate),
      meal: selectedMeal.toLowerCase() === 'snack' ? 'snacks' : selectedMeal.toLowerCase(),
      name: foodData.name,
      calories: foodData.calories,
      carbs: foodData.carbs,
      fat: foodData.fat,
      protein: foodData.protein,
      sodium: foodData.sodium,
      sugar: foodData.sugar,
      quantity: quantity
    })
  });

  if (response.ok) {
    const result = await response.json();
    return result;
  } else {
    const errorData = await response.json();
    console.error('Failed to save food item:', errorData);
    throw new Error('Failed to save food item. Please try again.');
  }
};

export const removeFoodFromDiary = async (foodId: number) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Please log in to delete food items.');
  }

  const response = await fetch(`${BASE_URL}/api/food/deletefood/${foodId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to delete food item:', errorData);
    throw new Error('Failed to delete food item. Please try again.');
  }
};

export const fetchDigestiveTimeline = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No auth token available');
    }

    console.log('🔍 Fetching today\'s foods from:', `${API_BASE_URL}/foodlist/today`);
    
    const todayFoodsRes = await fetch(`${API_BASE_URL}/foodlist/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Today\'s foods response status:', todayFoodsRes.status);

    if (!todayFoodsRes.ok) {
      const errorText = await todayFoodsRes.text();
      console.error('❌ Failed to fetch today\'s foods:', todayFoodsRes.status, errorText);
      throw new Error(`Failed to fetch today's foods: ${todayFoodsRes.status} - ${errorText}`);
    }

    const todayFoods = await todayFoodsRes.json();
    console.log('✅ Today\'s foods fetched successfully:', todayFoods);

    if (!Array.isArray(todayFoods) || todayFoods.length === 0) {
      console.log('⚠️ No food data found for today');
      return [];
    }

    console.log('🔍 Fetching digestive timeline with food data:', todayFoods.length, 'items');
    
    const digestiveRes = await fetch(`${API_BASE_URL}/insights/digestive-timeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ foods: todayFoods })
    });

    console.log('📊 Digestive timeline response status:', digestiveRes.status);

    if (!digestiveRes.ok) {
      const errorText = await digestiveRes.text();
      console.error('❌ Failed to fetch digestive timeline:', digestiveRes.status, errorText);
      throw new Error(`Failed to fetch digestive timeline: ${digestiveRes.status} - ${errorText}`);
    }

    const digestiveData = await digestiveRes.json();
    console.log('✅ Digestive timeline data received:', digestiveData);

    // Sort digestive timeline by meal order: breakfast, lunch, dinner, snack
    const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
    const sortedDigestiveData = digestiveData.sort((a: any, b: any) => {
      const aIndex = mealOrder.indexOf(a.category.toLowerCase());
      const bIndex = mealOrder.indexOf(b.category.toLowerCase());
      return aIndex - bIndex;
    });

    return sortedDigestiveData;
  } catch (error) {
    console.error('❌ Error fetching digestive timeline:', error);
    throw error;
  }
}; 