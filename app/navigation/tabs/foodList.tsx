import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, Alert, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../../../src/config';
import { fetchImagesForFoodItems, fetchImageForFood } from './food/services/imageService';
import { fetchFoodData as fetchFoodDataFromService, fetchFoodDetails as fetchFoodDetailsFromService } from './food/services/foodService';

interface FoodItem {
  id: number;
  name: string;
  icon: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
  imageUrl?: string;
}

interface DetailedFoodItem extends FoodItem {
  description?: string;
  serving_size?: string;
  ingredients?: string[];
  allergens?: string[];
}

interface MealFood {
  food: DetailedFoodItem;
  mealType: string;
  addedAt: Date;
  quantity: number;
}

interface DigestiveTimelineItem {
  id: number;
  name: string;
  category: string;
  digestion: {
    carbs: { duration: number; amount: number };
    protein: { duration: number; amount: number };
    fat: { duration: number; amount: number };
  };
  totalDigestionTime: number;
}

const FoodDiary = () => {
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSavedData, setLoadingSavedData] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [mealFoodsByDate, setMealFoodsByDate] = useState<{ [dateKey: string]: { [key: string]: MealFood[] } }>({});

  // Digestive timeline state
  const [digestiveTimeline, setDigestiveTimeline] = useState<DigestiveTimelineItem[]>([]);
  const [digestiveLoading, setDigestiveLoading] = useState(false);
  const [digestiveNoData, setDigestiveNoData] = useState(false);

  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    carbs: '',
    fat: '',
    protein: ''
  });

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentDateMealFoods = () => {
    const dateKey = formatDateKey(selectedDate);
    const currentMealFoods = mealFoodsByDate?.[dateKey] || {};
    return {
      Breakfast: currentMealFoods?.Breakfast || [],
      Lunch: currentMealFoods?.Lunch || [],
      Dinner: currentMealFoods?.Dinner || [],
      Snack: currentMealFoods?.Snack || []
    };
  };

  const calculateTotals = () => {
    const currentMealFoods = getCurrentDateMealFoods();
    let totals = {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      sodium: 0,
      sugar: 0
    };

    Object.values(currentMealFoods).forEach(mealFoods => {
      mealFoods.forEach(mealFood => {
        totals.calories += (mealFood.food.calories || 0) * mealFood.quantity;
        totals.carbs += (mealFood.food.carbs || 0) * mealFood.quantity;
        totals.fat += (mealFood.food.fat || 0) * mealFood.quantity;
        totals.protein += (mealFood.food.protein || 0) * mealFood.quantity;
        totals.sodium += (mealFood.food.sodium || 0) * mealFood.quantity;
        totals.sugar += (mealFood.food.sugar || 0) * mealFood.quantity;
      });
    });

    return totals;
  };

  const dailyGoals = {
    calories: 1870,
    carbs: 209,
    fat: 58,
    protein: 84,
    sodium: 2300,
    sugar: 63
  };

  // Fetch digestive timeline on component mount
  useEffect(() => {
    loadDigestiveTimeline();
  }, []);

  const loadDigestiveTimeline = async () => {
    try {
      setDigestiveLoading(true);
      setDigestiveNoData(false);
      
      const data = await fetchDigestiveTimeline();
      setDigestiveTimeline(data);
      setDigestiveNoData(data.length === 0);
    } catch (error) {
      console.error('❌ Error fetching digestive timeline:', error);
      Alert.alert(
        'Error', 
        'Failed to load digestive timeline. Please try again or check if you have logged food today.',
        [{ text: 'OK' }]
      );
    } finally {
      setDigestiveLoading(false);
    }
  };

  const calculateRemaining = () => {
    const totals = calculateTotals();
    return {
      calories: Math.max(0, dailyGoals.calories - totals.calories),
      carbs: Math.max(0, dailyGoals.carbs - totals.carbs),
      fat: Math.max(0, dailyGoals.fat - totals.fat),
      protein: Math.max(0, dailyGoals.protein - totals.protein),
      sodium: Math.max(0, dailyGoals.sodium - totals.sodium),
      sugar: Math.max(0, dailyGoals.sugar - totals.sugar)
    };
  };

  const calculateProgress = () => {
    const totals = calculateTotals();
    return {
      calories: Math.min(100, (totals.calories / dailyGoals.calories) * 100),
      carbs: Math.min(100, (totals.carbs / dailyGoals.carbs) * 100),
      fat: Math.min(100, (totals.fat / dailyGoals.fat) * 100),
      protein: Math.min(100, (totals.protein / dailyGoals.protein) * 100)
    };
  };

  const getMealFoodsForMeal = (mealType: string): MealFood[] => {
    const currentMealFoods = getCurrentDateMealFoods();
    return currentMealFoods[mealType as keyof typeof currentMealFoods] || [];
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const fetchSavedFoodData = async (date: Date, retryCount = 0) => {
    setLoadingSavedData(true);
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token available for fetching saved food data');
        setLoadingSavedData(false);
        return;
      }

      const dateKey = formatDateKey(date);
      console.log('Fetching saved food data for date:', dateKey);
      console.log('Full date object:', date);
      console.log('Date string:', date.toISOString());
      
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
      console.log('API Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        const records = data.records || [];
        console.log('Fetched saved food records:', records);

        const savedMealFoods: { [key: string]: MealFood[] } = {
          Breakfast: [],
          Lunch: [],
          Dinner: [],
          Snack: []
        };

        records.forEach((record: any) => {
          const mealFood: MealFood = {
            food: {
              id: record.id,
              name: record.name,
              icon: '🍽️',
              calories: record.calories || 0,
              carbs: record.carbs || 0,
              fat: record.fat || 0,
              protein: record.protein || 0,
              sodium: record.sodium || 0,
              sugar: record.sugar || 0,
              description: 'Saved food item',
              serving_size: '1 serving',
              ingredients: [],
              allergens: []
            },
            mealType: record.meal.charAt(0).toUpperCase() + record.meal.slice(1),
            addedAt: new Date(record.created_at || Date.now()),
            quantity: record.quantity || 1
          };

          const mealMapping: { [key: string]: string } = {
            'breakfast': 'Breakfast',
            'lunch': 'Lunch',
            'dinner': 'Dinner',
            'snacks': 'Snack'
          };

          const mappedMeal = mealMapping[record.meal] || 'Snack';
          savedMealFoods[mappedMeal].push(mealFood);
        });

        // Set the data first without images
        const dateKey = formatDateKey(date);
        setMealFoodsByDate(prev => ({
          ...prev,
          [dateKey]: savedMealFoods
        }));

        console.log('Successfully loaded saved food data for date:', dateKey);
        
        // Now fetch images for all saved foods
        try {
          const allFoods = Object.values(savedMealFoods).flat();
          const foodsWithImages = await fetchImagesForFoodItems(allFoods.map(mealFood => mealFood.food));
          
          // Update the saved foods with images
          const updatedSavedMealFoods: { [key: string]: MealFood[] } = {
            Breakfast: [],
            Lunch: [],
            Dinner: [],
            Snack: []
          };

          Object.keys(savedMealFoods).forEach(mealType => {
            updatedSavedMealFoods[mealType] = savedMealFoods[mealType].map((mealFood, index) => {
              const foodWithImage = foodsWithImages.find((food: any) => food.id === mealFood.food.id);
              return {
                ...mealFood,
                food: {
                  ...mealFood.food,
                  imageUrl: foodWithImage?.imageUrl
                }
              };
            });
          });

          // Update state with images
          setMealFoodsByDate(prev => ({
            ...prev,
            [dateKey]: updatedSavedMealFoods
          }));

          console.log('Successfully updated saved foods with images');
        } catch (imageError) {
          console.error('Error fetching images for saved foods:', imageError);
          // Continue without images if image fetching fails
        }
        
        // Also refresh digestive timeline when food data is updated
        loadDigestiveTimeline();
       } else {
         const errorText = await response.text();
         console.error('Failed to fetch saved food data:', response.status, errorText);
         
         // Retry logic - only retry once
         if (retryCount === 0 && response.status >= 500) {
           console.log('Retrying API call...');
           setTimeout(() => {
             fetchSavedFoodData(date, 1);
           }, 1000);
           return;
         }
       }
     } catch (error) {
       console.error('Error fetching saved food data:', error);
       
       // Retry logic for network errors - only retry once
       if (retryCount === 0) {
         console.log('Retrying API call due to network error...');
         setTimeout(() => {
           fetchSavedFoodData(date, 1);
         }, 1000);
         return;
       }
     } finally {
       if (retryCount === 0) {
         setLoadingSavedData(false);
       }
     }
   };

  React.useEffect(() => {
    console.log('useEffect triggered - selectedDate changed:', selectedDate);
    console.log('Formatted date key:', formatDateKey(selectedDate));
    fetchSavedFoodData(selectedDate);
  }, [selectedDate]);

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }
    
    return days;
  };

  const CalendarModal = () => {
    const calendarDays = generateCalendarDays();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalendarModal(false)}
      >
                 <LinearGradient
           colors={['#E6F4EA', '#C3E6D2', '#A0D8BA']}
           className="flex-1"
         >
          <View className="px-4 py-6 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-gray-800">Select Date</Text>
              <TouchableOpacity 
                onPress={() => setShowCalendarModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-4 py-6">
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center"
              >
                <MaterialCommunityIcons name="chevron-left" size={24} color="#4b5563" />
              </TouchableOpacity>
              
              <Text className="text-xl font-semibold text-gray-800">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center"
              >
                <MaterialCommunityIcons name="chevron-right" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-2">
              {dayNames.map((day, index) => (
                <View key={index} className="flex-1 items-center py-2">
                  <Text className="text-sm font-medium text-gray-600">{day}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => (
                <View key={index} className="w-[14.28%] aspect-square p-1">
                  {day && (
                    <TouchableOpacity
                      onPress={() => {
                        console.log('Calendar date selected:', day);
                        console.log('Selected date before:', selectedDate);
                        setSelectedDate(day);
                        setShowCalendarModal(false);
                        console.log('Selected date after:', day);
                      }}
                                                                     className={`flex-1 justify-center items-center rounded-lg ${
                         day.toDateString() === selectedDate.toDateString()
                           ? 'bg-lime-600'
                           : day.toDateString() === new Date().toDateString()
                           ? 'bg-gray-200'
                           : 'bg-transparent'
                       }`}
                    >
                      <Text className={`text-base ${
                        day.toDateString() === selectedDate.toDateString()
                          ? 'font-bold text-white'
                          : day.toDateString() === new Date().toDateString()
                          ? 'text-black'
                          : 'text-gray-800'
                      }`}>
                        {day.getDate()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Modal>
    );
  };



  const fetchDigestiveTimeline = async () => {
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No auth token available');
      }

      console.log('🔍 Fetching today\'s foods from:', `${BASE_URL}/api/foodlist/today`);

      const todayFoodsRes = await fetch(`${BASE_URL}/api/foodlist/today`, {
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

      const digestiveRes = await fetch(`${BASE_URL}/api/insights/digestive-timeline`, {
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredFoodItems(foodItems);
    } else {
      const filtered = foodItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFoodItems(filtered);
    }
  };

  const handleAddFood = async (mealType: string) => {
    setSelectedMeal(mealType);
    setShowFoodModal(true);
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchFoodDataFromService(mealType);
      setFoodItems(data);
      setFilteredFoodItems(data);
    } catch (error) {
      console.error('Error fetching food data:', error);
      setError('Failed to fetch food data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoodToDiary = async (foodItem: FoodItem) => {
    try {
      const detailedFood = await fetchFoodDetailsFromService(foodItem.id);
      
      if (detailedFood) {
        // Preserve the imageUrl from the selected food item
        const detailedFoodWithImage = {
          ...detailedFood,
          imageUrl: foodItem.imageUrl
        };
        
        const newMealFood: MealFood = {
          food: detailedFoodWithImage,
          mealType: selectedMeal,
          addedAt: new Date(),
          quantity: 1
        };

        // Save to database immediately
        const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'Please log in to add food items.');
          return;
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
             name: detailedFood.name,
             calories: detailedFood.calories,
             carbs: detailedFood.carbs,
             fat: detailedFood.fat,
             protein: detailedFood.protein,
             sodium: detailedFood.sodium,
             sugar: detailedFood.sugar,
             quantity: 1
           })
        });

        if (response.ok) {
          const result = await response.json();
          // Update the food item with the database ID
          newMealFood.food.id = result.id;
          
          const dateKey = formatDateKey(selectedDate);
          setMealFoodsByDate(prev => ({
            ...prev,
            [dateKey]: {
              ...(prev[dateKey] || {}),
              [selectedMeal]: [...(prev[dateKey]?.[selectedMeal] || []), newMealFood]
            }
          }));

                     Alert.alert('Success', `${detailedFood.name} added to ${selectedMeal}!`);
           loadDigestiveTimeline();
         } else {
           const errorData = await response.json();
           console.error('Failed to save food item:', errorData);
           Alert.alert('Error', 'Failed to save food item. Please try again.');
           return;
         }
      } else {
        const fallbackDetailedFood: DetailedFoodItem = {
          ...foodItem,
          description: 'No detailed information available',
          serving_size: '1 serving',
          ingredients: [],
          allergens: []
        };

        const newMealFood: MealFood = {
          food: fallbackDetailedFood,
          mealType: selectedMeal,
          addedAt: new Date(),
          quantity: 1
        };

        // Save to database immediately
        const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'Please log in to add food items.');
          return;
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
             name: foodItem.name,
             calories: foodItem.calories,
             carbs: foodItem.carbs,
             fat: foodItem.fat,
             protein: foodItem.protein,
             sodium: foodItem.sodium,
             sugar: foodItem.sugar,
             quantity: 1
           })
        });

        if (response.ok) {
          const result = await response.json();
          // Update the food item with the database ID
          newMealFood.food.id = result.id;
          
          const dateKey = formatDateKey(selectedDate);
          setMealFoodsByDate(prev => ({
            ...prev,
            [dateKey]: {
              ...(prev[dateKey] || {}),
              [selectedMeal]: [...(prev[dateKey]?.[selectedMeal] || []), newMealFood]
            }
          }));

                     Alert.alert('Success', `${foodItem.name} added to ${selectedMeal}!`);
           loadDigestiveTimeline();
         } else {
           const errorData = await response.json();
           console.error('Failed to save food item:', errorData);
           Alert.alert('Error', 'Failed to save food item. Please try again.');
           return;
         }
      }
      
      setShowFoodModal(false);
    } catch (error) {
      console.error('Error adding food to diary:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const handleAddManualFood = async () => {
    if (!newFood.name.trim()) {
      Alert.alert('Error', 'Food name is required');
      return;
    }

    if (!newFood.calories.trim()) {
      Alert.alert('Error', 'Calories is required');
      return;
    }

    if (!newFood.carbs.trim()) {
      Alert.alert('Error', 'Carbohydrates is required');
      return;
    }

    if (!newFood.fat.trim()) {
      Alert.alert('Error', 'Fat is required');
      return;
    }

    if (!newFood.protein.trim()) {
      Alert.alert('Error', 'Protein is required');
      return;
    }

    const manualFood: DetailedFoodItem = {
      id: Date.now(),
      name: newFood.name.trim(),
      icon: '🍽️',
      calories: parseInt(newFood.calories) || 0,
      carbs: parseInt(newFood.carbs) || 0,
      fat: parseInt(newFood.fat) || 0,
      protein: parseInt(newFood.protein) || 0,
      sodium: 0,
      sugar: 0,
      description: 'Custom food',
      serving_size: '1 serving',
      ingredients: [],
      allergens: []
    };

    // Try to fetch an image for the custom food
    try {
      const imageUrl = await fetchImageForFood(manualFood.name);
      if (imageUrl) {
        manualFood.imageUrl = imageUrl;
      }
    } catch (error) {
      console.error('Error fetching image for custom food:', error);
      // Continue without image if fetching fails
    }

    const newMealFood: MealFood = {
      food: manualFood,
      mealType: selectedMeal,
      addedAt: new Date(),
      quantity: 1
    };

    // Save to database immediately
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to add food items.');
        return;
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
             name: manualFood.name,
             calories: manualFood.calories,
             carbs: manualFood.carbs,
             fat: manualFood.fat,
             protein: manualFood.protein,
             sodium: manualFood.sodium,
             sugar: manualFood.sugar,
             quantity: 1
           })
      });

      if (response.ok) {
        const result = await response.json();
        // Update the food item with the database ID
        newMealFood.food.id = result.id;
        
        const dateKey = formatDateKey(selectedDate);
        setMealFoodsByDate(prev => ({
          ...prev,
          [dateKey]: {
            ...(prev[dateKey] || {}),
            [selectedMeal]: [...(prev[dateKey]?.[selectedMeal] || []), newMealFood]
          }
        }));
        
        setNewFood({
          name: '',
          calories: '',
          carbs: '',
          fat: '',
          protein: ''
        });
        
        setShowAddFoodModal(false);
                 Alert.alert('Success', `${manualFood.name} added to ${selectedMeal}!`);
         loadDigestiveTimeline();
       } else {
         const errorData = await response.json();
         console.error('Failed to save manual food item:', errorData);
         Alert.alert('Error', 'Failed to save food item. Please try again.');
       }
    } catch (error) {
      console.error('Error adding manual food to diary:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const removeFoodFromMeal = async (mealType: string, foodIndex: number) => {
    try {
      const currentMealFoods = getMealFoodsForMeal(mealType);
      const foodToRemove = currentMealFoods[foodIndex];
      
      if (!foodToRemove) {
        console.error('Food item not found for removal');
        return;
      }

      // Get the database ID from the food item
      const foodId = foodToRemove.food.id;
      
      // Call the delete API
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to delete food items.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/food/deletefood/${foodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state
        const dateKey = formatDateKey(selectedDate);
        setMealFoodsByDate(prev => ({
          ...prev,
          [dateKey]: {
            ...(prev[dateKey] || {}),
            [mealType]: (prev[dateKey]?.[mealType] || []).filter((_, index) => index !== foodIndex)
          }
        }));
        
                 Alert.alert('Success', 'Food item removed successfully!');
         loadDigestiveTimeline();
       } else {
         const errorData = await response.json();
         console.error('Failed to delete food item:', errorData);
         Alert.alert('Error', 'Failed to delete food item. Please try again.');
       }
    } catch (error) {
      console.error('Error removing food from meal:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const updateFoodQuantity = async (mealType: string, foodIndex: number, newQuantity: number) => {
    try {
      const currentMealFoods = getMealFoodsForMeal(mealType);
      const foodToUpdate = currentMealFoods[foodIndex];
      
      if (!foodToUpdate) {
        console.error('Food item not found for quantity update');
        return;
      }

      // Update local state first for immediate UI feedback
      const dateKey = formatDateKey(selectedDate);
      setMealFoodsByDate(prev => ({
        ...prev,
        [dateKey]: {
          ...(prev[dateKey] || {}),
          [mealType]: (prev[dateKey]?.[mealType] || []).map((item, index) => 
            index === foodIndex ? { ...item, quantity: newQuantity } : item
          )
        }
      }));

      // Update database
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to update food items.');
        return;
      }

      // Delete the old entry and create a new one with updated quantity
      const deleteResponse = await fetch(`${BASE_URL}/api/food/deletefood/${foodToUpdate.food.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (deleteResponse.ok) {
        // Add new entry with updated quantity
        const addResponse = await fetch(`${BASE_URL}/api/food/addfood`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
                     body: JSON.stringify({
             date: formatDateKey(selectedDate),
             meal: mealType.toLowerCase() === 'snack' ? 'snacks' : mealType.toLowerCase(),
             name: foodToUpdate.food.name,
             calories: foodToUpdate.food.calories,
             carbs: foodToUpdate.food.carbs,
             fat: foodToUpdate.food.fat,
             protein: foodToUpdate.food.protein,
             sodium: foodToUpdate.food.sodium,
             sugar: foodToUpdate.food.sugar,
             quantity: newQuantity
           })
        });

        if (addResponse.ok) {
          const result = await addResponse.json();
          // Update the food item with the new database ID
          setMealFoodsByDate(prev => ({
            ...prev,
            [dateKey]: {
              ...(prev[dateKey] || {}),
              [mealType]: (prev[dateKey]?.[mealType] || []).map((item, index) => 
                index === foodIndex ? { ...item, food: { ...item.food, id: result.id } } : item
              )
            }
                     }));
           loadDigestiveTimeline();
         } else {
           console.error('Failed to update food quantity in database');
         }
       } else {
         console.error('Failed to delete old food entry for quantity update');
       }
    } catch (error) {
      console.error('Error updating food quantity:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View className="flex-row items-center p-3 bg-green-50 rounded-xl mb-2 shadow-sm border border-green-200">
      {/* Food Image */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
          resizeMode="cover"
        />
      ) : (
        <View 
          style={{ 
            width: 60, 
            height: 60, 
            borderRadius: 8, 
            marginRight: 12,
            backgroundColor: '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 24 }}>{item.icon}</Text>
        </View>
      )}
      
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-700">{item.calories} calories</Text>
      </View>
             <TouchableOpacity 
         className="bg-lime-600 px-3 py-2 rounded-lg active:bg-lime-700"
         onPress={() => handleAddFoodToDiary(item)}
       >
        <Text className="text-white font-medium text-sm">Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMealFoodItem = (mealFood: MealFood, index: number) => (
    <View key={index} className="bg-green-50 rounded-xl p-3 mb-2 shadow-sm border border-green-200">
      <View className="flex-row justify-between items-start">
        {/* Food Image */}
        {mealFood.food.imageUrl ? (
          <Image
            source={{ uri: mealFood.food.imageUrl }}
            style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View 
            style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 8, 
              marginRight: 12,
              backgroundColor: '#f3f4f6',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 20 }}>{mealFood.food.icon}</Text>
          </View>
        )}
        
                <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">{mealFood.food.name}</Text>
        </View>
        
        <View className="items-end">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => updateFoodQuantity(mealFood.mealType, index, Math.max(1, mealFood.quantity - 1))}
              className="bg-[#d6f3a0] w-8 h-8 rounded-full justify-center items-center mr-2 active:bg-lime-700"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-black font-bold text-lg" style={{ textAlign: 'center', lineHeight: 20 }}>-</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 mx-2">{mealFood.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateFoodQuantity(mealFood.mealType, index, mealFood.quantity + 1)}
              className="bg-[#d6f3a0] w-8 h-8 rounded-full justify-center items-center ml-2 active:bg-lime-700"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-black font-bold text-lg" style={{ textAlign: 'center', lineHeight: 20 }}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => removeFoodFromMeal(mealFood.mealType, index)}
              className="bg-black w-6 h-6 rounded-full justify-center items-center ml-3"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-xs" style={{ textAlign: 'center', lineHeight: 16 }}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View className="items-end">
            <Text className="text-sm text-gray-700 mb-1">{mealFood.food.calories * mealFood.quantity} cal</Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-xs text-gray-700"><Text className="font-bold">C:</Text> {mealFood.food.carbs * mealFood.quantity}g</Text>
              <Text className="text-xs text-gray-700"><Text className="font-bold">F:</Text> {mealFood.food.fat * mealFood.quantity}g</Text>
              <Text className="text-xs text-gray-700"><Text className="font-bold">P:</Text> {mealFood.food.protein * mealFood.quantity}g</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );



  return (
    <SafeAreaView style={{ flex: 1 }}>
             <LinearGradient
         colors={['#E6F4EA', '#C3E6D2', '#A0D8BA']}
         style={{ flex: 1 }}
         start={{ x: 0, y: 0 }}
         end={{ x: 0, y: 1 }}
       >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6 mb-4">
          <View className="items-center">
            <Text className="text-gray-900 text-3xl font-bold mb-2">Your Food Diary</Text>
            <Text className="text-gray-700 text-sm italic mb-4">Track your nutrition, fuel your wellness journey</Text>
            <View className="w-16 h-0.5 bg-black mb-4"></View>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity 
                onPress={() => navigateDate('prev')}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color="black" />
              </TouchableOpacity>
              <Text className="text-sm font-semibold text-gray-800 mx-4">
                {formatDisplayDate(selectedDate)}
              </Text>
              <TouchableOpacity 
                onPress={() => navigateDate('next')}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200 mr-5"
              >
                <MaterialCommunityIcons name="chevron-right" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowCalendarModal(true)}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons name="calendar" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-4 py-3">
        {loadingSavedData ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-800 text-lg">Loading saved foods...</Text>
          </View>
        ) : (
                     meals.map((meal) => (
             <View key={meal} className="mb-6 p-4 bg-green-50 rounded-2xl shadow-md border border-green-200">
              <View className="flex-row items-center mb-3">
                {meal === 'Breakfast' && (
                  <MaterialCommunityIcons name="food-croissant" size={24} color="black" />
                )}
                {meal === 'Lunch' && (
                  <MaterialCommunityIcons name="food-variant" size={24} color="black" />
                )}
                {meal === 'Dinner' && (
                  <MaterialCommunityIcons name="food-fork-drink" size={24} color="black" />
                )}
                {meal === 'Snack' && (
                  <MaterialCommunityIcons name="food-apple" size={24} color="black" />
                )}
                <Text className="text-xl font-semibold text-gray-800 ml-2">{meal}</Text>
              </View>

              {getMealFoodsForMeal(meal).length > 0 ? (
                <View className="mb-3">
                  {getMealFoodsForMeal(meal).map((mealFood: MealFood, index: number) => 
                    renderMealFoodItem(mealFood, index)
                  )}
                </View>
              ) : (
                <Text className="text-gray-600 text-sm mb-3">No foods added yet</Text>
              )}

                             <TouchableOpacity 
                 className="border-2 border-lime-500 px-4 py-2 rounded-xl"
                 onPress={() => handleAddFood(meal)}
                 disabled={loading}
               >
                 <Text className="text-lime-600 text-center font-semibold">
                   {loading && selectedMeal === meal ? 'Loading...' : 'Add Food'}
                 </Text>
               </TouchableOpacity>
            </View>
          ))
        )}



        {/* Last Meal Fullness Heading - Only show for today */}
        {selectedDate.toDateString() === new Date().toDateString() && digestiveTimeline.length > 0 && (
          <View className="mb-4 p-3 bg-green-100 rounded-xl border border-green-200">
            <Text className="text-center text-green-800 font-semibold">
              Your {digestiveTimeline[digestiveTimeline.length - 1]?.category || 'last meal'} will keep you full for ~{digestiveTimeline[digestiveTimeline.length - 1]?.totalDigestionTime || 0} hours
            </Text>
          </View>
        )}

        {/* Digestive Timeline Section - Only show for today */}
        {selectedDate.toDateString() === new Date().toDateString() && (
          digestiveLoading ? (
            <View className="mb-6 rounded-2xl p-5 bg-green-50 border border-green-100 shadow-sm items-center">
              <ActivityIndicator size="large" color="#65A30D" />
              <Text className="text-gray-600 mt-2">Analyzing your digestive timeline...</Text>
            </View>
          ) : digestiveNoData ? (
            <View className="mb-6 rounded-2xl p-5 bg-green-50 border border-green-100 shadow-sm items-center">
              <Text className="text-gray-800 text-lg font-semibold mb-2">No food data available for today.</Text>
              <Text className="text-gray-600 text-center">Please log your food intake to see your digestive timeline.</Text>
            </View>
          ) : (
            <View className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 shadow-sm">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="clock-outline" size={24} color="#65A30D" />
                <Text className="text-xl font-semibold text-gray-800 ml-2">Digestive Load Timeline</Text>
              </View>
              <Text className="text-sm text-gray-600 mb-4">
                How long different parts of your meals will stay in your system
              </Text>

              {digestiveTimeline.map((meal, index) => (
                <View key={meal.id} className="mb-4 pb-3 border-b border-gray-200">
                  <Text className="text-base font-semibold text-gray-800 mb-2 capitalize">{meal.name} ({meal.category})</Text>

                  <View className="mb-2">
                    <View className="mb-1">
                      <View
                        className="p-2 rounded-md mb-1"
                        style={{
                          backgroundColor: '#e8e4f5',
                          width: `${Math.min((meal.digestion.carbs.duration / 6) * 100, 90)}%`,
                          minWidth: 120
                        }}
                      >
                        <Text className="text-gray-800 text-xs font-semibold text-center">
                          Carbs: {meal.digestion.carbs.duration}h
                        </Text>
                      </View>
                    </View>

                    <View className="mb-1">
                      <View
                        className="p-2 rounded-md mb-1"
                        style={{
                          backgroundColor: '#d1d5db',
                          width: `${Math.min((meal.digestion.protein.duration / 6) * 100, 90)}%`,
                          minWidth: 120
                        }}
                      >
                        <Text className="text-gray-800 text-xs font-semibold text-center">
                          Protein: {meal.digestion.protein.duration}h
                        </Text>
                      </View>
                    </View>

                    <View className="mb-1">
                      <View
                        className="p-2 rounded-md mb-1"
                        style={{
                          backgroundColor: '#d1f5a8',
                          width: `${Math.min((meal.digestion.fat.duration / 6) * 100, 90)}%`,
                          minWidth: 120
                        }}
                      >
                        <Text className="text-gray-800 text-xs font-semibold text-center">
                          Fat: {meal.digestion.fat.duration}h
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        )}

        {/* Daily Progress */}
        <View className="mb-6 rounded-2xl p-5 bg-green-50 border border-green-100 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Daily Progress</Text>
          
                                <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-gray-800">Calories</Text>
              <Text className="text-sm text-gray-800">{calculateTotals().calories}/{dailyGoals.calories}</Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ 
                  width: `${calculateProgress().calories}%`,
                  backgroundColor: '#d1eef7'
                }}
              />
            </View>
          </View>
          
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-gray-800">Carbs</Text>
              <Text className="text-sm text-gray-800">{calculateTotals().carbs}/{dailyGoals.carbs}</Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ 
                  width: `${calculateProgress().carbs}%`,
                  backgroundColor: '#e8d9f7'
                }}
              />
            </View>
          </View>
          
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-gray-800">Fat</Text>
              <Text className="text-sm text-gray-800">{calculateTotals().fat}/{dailyGoals.fat}</Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ 
                  width: `${calculateProgress().fat}%`,
                  backgroundColor: '#e8f5e8'
                }}
              />
            </View>
          </View>
          
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-semibold text-gray-800">Protein</Text>
              <Text className="text-sm text-gray-800">{calculateTotals().protein}/{dailyGoals.protein}</Text>
            </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ 
                  width: `${calculateProgress().protein}%`,
                  backgroundColor: '#f7f4d9'
                }}
              />
            </View>
          </View>
        </View>
        </View>
      </ScrollView>

      {/* Food Selection Modal */}
      <Modal
        visible={showFoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFoodModal(false)}
      >
                 <View className="flex-1 bg-black/50 justify-end">
           <LinearGradient
             colors={['#d6f3a0', '#c4e88a', '#8bc34a']}
              className="bg-white rounded-t-3xl p-6 h-[80%]"
            >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800">{selectedMeal} Foods</Text>
              <TouchableOpacity 
                onPress={() => setShowFoodModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center"
              >
                <Text className="text-gray-600 font-bold text-lg">×</Text>
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <TextInput
                className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                placeholder="Search foods..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

                         <TouchableOpacity
               className="bg-lime-600 px-4 py-3 rounded-xl mb-4 flex-row items-center justify-center shadow-sm active:bg-lime-700"
               onPress={() => setShowAddFoodModal(true)}
             >
              <Text className="text-white font-semibold ml-2">+ Add Custom Food</Text>
            </TouchableOpacity>
            
            {error ? (
              <View className="flex-1 justify-center items-center">
                <View className="w-12 h-12 bg-red-100 rounded-full justify-center items-center mb-4">
                  <Text className="text-red-500 font-bold text-xl">!</Text>
                </View>
                <Text className="text-red-500 text-center mb-4">{error}</Text>
                                 <TouchableOpacity 
                   className="bg-lime-600 px-4 py-2 rounded-lg active:bg-lime-700"
                   onPress={() => handleAddFood(selectedMeal)}
                  >
                  <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : loading ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-600">Loading foods...</Text>
              </View>
            ) : filteredFoodItems.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center mb-4">
                  <Text className="text-gray-500 font-bold text-xl">🍽️</Text>
                </View>
                <Text className="text-gray-600 text-center mb-4">
                  {searchQuery ? 'No foods found matching your search' : 'No foods available'}
                </Text>
                {searchQuery && (
                                     <TouchableOpacity
                     className="bg-lime-600 px-4 py-2 rounded-lg active:bg-lime-700"
                     onPress={() => setShowAddFoodModal(true)}
                   >
                    <Text className="text-white font-semibold">Add Custom Food</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredFoodItems}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                className="flex-1"
              />
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* Add Manual Food Modal */}
      <Modal
        visible={showAddFoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFoodModal(false)}
      >
                 <View className="flex-1 bg-black/50 justify-center px-5">
           <LinearGradient
             colors={['#d6f3a0', '#c4e88a', '#8bc34a']}
              className="bg-white rounded-3xl p-6 max-h-[80%]"
            >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-2xl font-bold text-gray-800">Add Custom Food</Text>
              <TouchableOpacity 
                onPress={() => setShowAddFoodModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center"
              >
                <Text className="text-gray-600 font-bold text-lg">×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-700 mb-2">Food Name *</Text>
                <TextInput
                  className="bg-green-50 p-3 rounded-xl text-base border border-green-200"
                  placeholder="Enter food name"
                  value={newFood.name}
                  onChangeText={(text) => setNewFood({...newFood, name: text})}
                />
              </View>

              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-700 mb-2">Calories *</Text>
                <TextInput
                  className="bg-green-50 p-3 rounded-xl text-base border border-green-200"
                  placeholder="Enter calories"
                  value={newFood.calories}
                  onChangeText={(text) => setNewFood({...newFood, calories: text})}
                  keyboardType="numeric"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 mb-4">
                  <Text className="text-base font-semibold text-gray-700 mb-2">Carbs (g) *</Text>
                  <TextInput
                    className="bg-green-50 p-3 rounded-xl text-base border border-green-200"
                    placeholder="0"
                    value={newFood.carbs}
                    onChangeText={(text) => setNewFood({...newFood, carbs: text})}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1 mb-4">
                  <Text className="text-base font-semibold text-gray-700 mb-2">Fat (g) *</Text>
                  <TextInput
                    className="bg-green-50 p-3 rounded-xl text-base border border-green-200"
                    placeholder="0"
                    value={newFood.fat}
                    onChangeText={(text) => setNewFood({...newFood, fat: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-700 mb-2">Protein (g) *</Text>
                <TextInput
                  className="bg-green-50 p-3 rounded-xl text-base border border-green-200"
                  placeholder="0"
                  value={newFood.protein}
                  onChangeText={(text) => setNewFood({...newFood, protein: text})}
                  keyboardType="numeric"
                />
              </View>

                             <TouchableOpacity
                 className="bg-lime-600 py-4 rounded-xl items-center shadow-sm active:bg-lime-700"
                 onPress={handleAddManualFood}
               >
                <Text className="text-white text-base font-semibold">Add to {selectedMeal}</Text>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
      {CalendarModal()}
    </LinearGradient>
    </SafeAreaView>
  );
};

export default FoodDiary;