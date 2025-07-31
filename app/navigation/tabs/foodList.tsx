import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../../../src/config';

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

  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    carbs: '',
    fat: '',
    protein: '',
    sodium: '',
    sugar: ''
  });

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
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

  const fetchSavedFoodData = async (date: Date) => {
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
      
      const response = await fetch(`${BASE_URL}/api/food/getfood?date=${dateKey}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
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

        const dateKey = formatDateKey(date);
        setMealFoodsByDate(prev => ({
          ...prev,
          [dateKey]: savedMealFoods
        }));

        console.log('Successfully loaded saved food data for date:', dateKey);
      } else {
        console.error('Failed to fetch saved food data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching saved food data:', error);
    } finally {
      setLoadingSavedData(false);
    }
  };

  React.useEffect(() => {
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
          colors={['#f0fdfa', '#e6f3f1']}
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
                        setSelectedDate(day);
                        setShowCalendarModal(false);
                      }}
                      className={`flex-1 justify-center items-center rounded-lg ${
                        day.toDateString() === selectedDate.toDateString()
                          ? 'bg-teal-500'
                          : day.toDateString() === new Date().toDateString()
                          ? 'bg-teal-100'
                          : 'bg-transparent'
                      }`}
                    >
                      <Text className={`text-base ${
                        day.toDateString() === selectedDate.toDateString()
                          ? 'font-bold text-white'
                          : day.toDateString() === new Date().toDateString()
                          ? 'text-teal-600'
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

  const fetchFoodData = async (mealType: string) => {
    setLoading(true);
    setError('');
    try {
      const mealEndpoint = mealType.toLowerCase();
      console.log('Fetching from:', `${BASE_URL}/api/foodlist/${mealEndpoint}`);
      
      const response = await fetch(`${BASE_URL}/api/foodlist/${mealEndpoint}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Food data received:', data);
        setFoodItems(data);
        setFilteredFoodItems(data);
        setSelectedMeal(mealType);
        setShowFoodModal(true);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setError(`Failed to fetch food data: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodDetails = async (foodId: number): Promise<DetailedFoodItem | null> => {
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

  const handleAddFood = (mealType: string) => {
    setSelectedMeal(mealType);
    setShowFoodModal(true);
    fetchFoodData(mealType);
  };

  const handleAddFoodToDiary = async (foodItem: FoodItem) => {
    try {
      const detailedFood = await fetchFoodDetails(foodItem.id);
      
      if (detailedFood) {
        const newMealFood: MealFood = {
          food: detailedFood,
          mealType: selectedMeal,
          addedAt: new Date(),
          quantity: 1
        };

        const dateKey = formatDateKey(selectedDate);
        setMealFoodsByDate(prev => ({
          ...prev,
          [dateKey]: {
            ...(prev[dateKey] || {}),
            [selectedMeal]: [...(prev[dateKey]?.[selectedMeal] || []), newMealFood]
          }
        }));

        Alert.alert('Success', `${detailedFood.name} added to ${selectedMeal}!`);
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

        const dateKey = formatDateKey(selectedDate);
        setMealFoodsByDate(prev => ({
          ...prev,
          [dateKey]: {
            ...(prev[dateKey] || {}),
            [selectedMeal]: [...(prev[dateKey]?.[selectedMeal] || []), newMealFood]
          }
        }));

        Alert.alert('Success', `${foodItem.name} added to ${selectedMeal}!`);
      }
      
      setShowFoodModal(false);
    } catch (error) {
      console.error('Error adding food to diary:', error);
      Alert.alert('Error', 'Failed to add food to diary. Please try again.');
    }
  };

  const handleAddManualFood = () => {
    if (!newFood.name.trim() || !newFood.calories.trim()) {
      Alert.alert('Error', 'Please enter at least the food name and calories.');
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
      sodium: parseInt(newFood.sodium) || 0,
      sugar: parseInt(newFood.sugar) || 0,
      description: 'Custom food',
      serving_size: '1 serving',
      ingredients: [],
      allergens: []
    };

    const newMealFood: MealFood = {
      food: manualFood,
      mealType: selectedMeal,
      addedAt: new Date(),
      quantity: 1
    };

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
      protein: '',
      sodium: '',
      sugar: ''
    });
    
    setShowAddFoodModal(false);
    Alert.alert('Success', `${manualFood.name} added to ${selectedMeal}!`);
  };

  const removeFoodFromMeal = (mealType: string, foodIndex: number) => {
    const dateKey = formatDateKey(selectedDate);
    setMealFoodsByDate(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [mealType]: (prev[dateKey]?.[mealType] || []).filter((_, index) => index !== foodIndex)
      }
    }));
  };

  const updateFoodQuantity = (mealType: string, foodIndex: number, newQuantity: number) => {
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
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View className="flex-row items-center p-3 bg-white rounded-xl mb-2 shadow-sm border border-gray-100">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.calories}</Text>
      </View>
      <TouchableOpacity 
        className="bg-[#11B5CF] px-3 py-2 rounded-lg"
        onPress={() => handleAddFoodToDiary(item)}
      >
        <Text className="text-white font-medium text-sm">Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMealFoodItem = (mealFood: MealFood, index: number) => (
    <View key={index} className="bg-white rounded-xl p-3 mb-2 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">{mealFood.food.name}</Text>
          <Text className="text-sm text-gray-600 mb-1">{mealFood.food.calories * mealFood.quantity} calories</Text>
          {mealFood.food.description && (
            <Text className="text-xs text-gray-500 mb-1">{mealFood.food.description}</Text>
          )}
          <View className="flex-row flex-wrap gap-2">
            <Text className="text-xs text-gray-600">C: {mealFood.food.carbs * mealFood.quantity}g</Text>
            <Text className="text-xs text-gray-600">F: {mealFood.food.fat * mealFood.quantity}g</Text>
            <Text className="text-xs text-gray-600">P: {mealFood.food.protein * mealFood.quantity}g</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => updateFoodQuantity(mealFood.mealType, index, Math.max(1, mealFood.quantity - 1))}
            className="bg-[#11B5CF] w-8 h-8 rounded-full justify-center items-center mr-2"
          >
            <Text className="text-white font-bold text-lg">-</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800 mx-2">{mealFood.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateFoodQuantity(mealFood.mealType, index, mealFood.quantity + 1)}
            className="bg-[#11B5CF] w-8 h-8 rounded-full justify-center items-center ml-2"
          >
            <Text className="text-white font-bold text-lg">+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeFoodFromMeal(mealFood.mealType, index)}
            className="bg-[#a8e063] w-6 h-6 rounded-full justify-center items-center ml-3"
          >
            <Text className="text-white font-bold text-xs">×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const saveFoodDiary = async () => {
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please log in to save your food diary.');
        return;
      }

      const allFoodData: Array<{
        food_id: number;
        food_name: string;
        meal_type: string;
        calories: number;
        carbs: number;
        fat: number;
        protein: number;
        sodium: number;
        sugar: number;
        description: string;
        serving_size: string;
        added_at: string;
        quantity: number;
      }> = [];
      
      const dateKey = formatDateKey(selectedDate);
      const currentDateMealFoods = mealFoodsByDate[dateKey] || {};
      if (currentDateMealFoods && typeof currentDateMealFoods === 'object') {
        Object.keys(currentDateMealFoods).forEach(mealType => {
          if (currentDateMealFoods[mealType] && Array.isArray(currentDateMealFoods[mealType])) {
            currentDateMealFoods[mealType].forEach(mealFood => {
              allFoodData.push({
                food_id: mealFood.food.id,
                food_name: mealFood.food.name,
                meal_type: mealType,
                calories: mealFood.food.calories,
                carbs: mealFood.food.carbs,
                fat: mealFood.food.fat,
                protein: mealFood.food.protein,
                sodium: mealFood.food.sodium,
                sugar: mealFood.food.sugar,
                description: mealFood.food.description || '',
                serving_size: mealFood.food.serving_size || '1 serving',
                added_at: mealFood.addedAt.toISOString(),
                quantity: mealFood.quantity
              });
            });
          }
        });
      }

      if (allFoodData.length === 0) {
        Alert.alert('No Data', 'Please add some foods to your diary before saving.');
        return;
      }

      console.log('Saving food diary data:', allFoodData);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const foodData of allFoodData) {
        try {
          const response = await fetch(`${BASE_URL}/api/food/addfood`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: formatDateKey(selectedDate),
              meal: foodData.meal_type.toLowerCase(),
              name: foodData.food_name,
              calories: foodData.calories,
              carbs: foodData.carbs,
              fat: foodData.fat,
              protein: foodData.protein,
              sodium: foodData.sodium,
              sugar: foodData.sugar,
              quantity: foodData.quantity
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to save food item ${foodData.food_name}:`, response.status);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error saving food item ${foodData.food_name}:`, error);
        }
      }

      if (successCount > 0) {
        Alert.alert('Success', `Successfully saved ${successCount} food items!${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      } else {
        Alert.alert('Error', 'Failed to save any food items. Please try again.');
      }
    } catch (error) {
      console.error('Error saving food diary:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6 mb-4">
          <View className="bg-white rounded-2xl p-6 shadow-md">
            <View className="items-center">
              <Text className="text-gray-800 text-3xl font-bold mb-2">Your Food Diary</Text>
              <Text className="text-gray-600 text-sm italic mb-4">Track your nutrition, fuel your wellness journey</Text>
              <View className="w-16 h-0.5 bg-[#11B5CF] mb-4"></View>
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity 
                  onPress={() => navigateDate('prev')}
                  className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <MaterialCommunityIcons name="chevron-left" size={20} color="#11B5CF" />
                </TouchableOpacity>
                <Text className="text-sm font-semibold text-gray-800 mx-4">
                  {formatDisplayDate(selectedDate)}
                </Text>
                <TouchableOpacity 
                  onPress={() => navigateDate('next')}
                  className="p-2 rounded-full bg-gray-100 active:bg-gray-200 mr-5"
                >
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#11B5CF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowCalendarModal(true)}
                  className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#11B5CF" />
                </TouchableOpacity>
              </View>
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
            <View key={meal} className="mb-6 p-4 bg-white rounded-2xl shadow-md border border-gray-200">
              <View className="flex-row items-center mb-3">
                {meal === 'Breakfast' && (
                  <MaterialCommunityIcons name="food-croissant" size={24} color="#11B5CF" />
                )}
                {meal === 'Lunch' && (
                  <MaterialCommunityIcons name="food-variant" size={24} color="#11B5CF" />
                )}
                {meal === 'Dinner' && (
                  <MaterialCommunityIcons name="food-fork-drink" size={24} color="#11B5CF" />
                )}
                {meal === 'Snack' && (
                  <MaterialCommunityIcons name="food-apple" size={24} color="#11B5CF" />
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
                className="bg-[#11B5CF] px-4 py-2 rounded-xl shadow-sm"
                onPress={() => handleAddFood(meal)}
                disabled={loading}
              >
                <Text className="text-white text-center font-semibold">
                  {loading && selectedMeal === meal ? 'Loading...' : 'Add Food'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Save Button */}
        <View className="mb-6">
          <TouchableOpacity
            className="bg-[#11B5CF] px-6 py-4 rounded-xl shadow-sm items-center"
            onPress={saveFoodDiary}
          >
            <Text className="text-white font-semibold text-lg">Save Diary</Text>
          </TouchableOpacity>
        </View>

        {/* Nutrition Summary */}
        <View className="mb-6 rounded-2xl p-5 bg-white">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Nutrition Summary</Text>
          
          <View className="rounded-xl p-4 bg-gray-50">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-[10px] font-semibold text-gray-600 w-12 text-center">Cal</Text>
              <Text className="text-[10px] font-semibold text-gray-600 w-12 text-center">Carbs</Text>
              <Text className="text-[10px] font-semibold text-gray-600 w-12 text-center">Fat</Text>
              <Text className="text-[10px] font-semibold text-gray-600 w-12 text-center">Protein</Text>
              <Text className="text-[10px] font-semibold text-gray-600 w-12 text-center">Sodium</Text>
              <Text className="text-[10px] font-semibold text-gray-600 w-12 text-center">Sugar</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base font-bold text-gray-800 w-12 text-center">{calculateTotals().calories}</Text>
              <Text className="text-base font-bold text-gray-800 w-12 text-center">{calculateTotals().carbs}</Text>
              <Text className="text-base font-bold text-gray-800 w-12 text-center">{calculateTotals().fat}</Text>
              <Text className="text-base font-bold text-gray-800 w-12 text-center">{calculateTotals().protein}</Text>
              <Text className="text-base font-bold text-gray-800 w-12 text-center">{calculateTotals().sodium}</Text>
              <Text className="text-base font-bold text-gray-800 w-12 text-center">{calculateTotals().sugar}</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.calories}</Text>
              <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.carbs}</Text>
              <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.fat}</Text>
              <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.protein}</Text>
              <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.sodium}</Text>
              <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.sugar}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{calculateRemaining().calories}</Text>
              <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{calculateRemaining().carbs}</Text>
              <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{calculateRemaining().fat}</Text>
              <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{calculateRemaining().protein}</Text>
              <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{calculateRemaining().sodium}</Text>
              <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{calculateRemaining().sugar}</Text>
            </View>
          </View>
        </View>

        {/* Daily Progress */}
        <View className="mb-6 rounded-2xl p-5 bg-white">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Daily Progress</Text>
          
                      <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-800">Calories</Text>
                <Text className="text-sm text-gray-800">{calculateTotals().calories}/{dailyGoals.calories}</Text>
              </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <LinearGradient
                colors={['#11B5CF', '#11B5CF']}
                className="h-full rounded-full"
                style={{ width: `${calculateProgress().calories}%` }}
              />
            </View>
          </View>
          
                      <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-800">Carbs</Text>
                <Text className="text-sm text-gray-800">{calculateTotals().carbs}/{dailyGoals.carbs}</Text>
              </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <LinearGradient
                colors={['#11B5CF', '#11B5CF']}
                className="h-full rounded-full"
                style={{ width: `${calculateProgress().carbs}%` }}
              />
            </View>
          </View>
          
                      <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-800">Fat</Text>
                <Text className="text-sm text-gray-800">{calculateTotals().fat}/{dailyGoals.fat}</Text>
              </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <LinearGradient
                colors={['#11B5CF', '#11B5CF']}
                className="h-full rounded-full"
                style={{ width: `${calculateProgress().fat}%` }}
              />
            </View>
          </View>
          
                      <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-800">Protein</Text>
                <Text className="text-sm text-gray-800">{calculateTotals().protein}/{dailyGoals.protein}</Text>
              </View>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <LinearGradient
                colors={['#11B5CF', '#11B5CF']}
                className="h-full rounded-full"
                style={{ width: `${calculateProgress().protein}%` }}
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
            colors={['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399']}
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
              className="bg-[#11B5CF] px-4 py-3 rounded-xl mb-4 flex-row items-center justify-center shadow-sm"
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
                  className="bg-[#11B5CF] px-4 py-2 rounded-lg"
                  onPress={() => fetchFoodData(selectedMeal)}
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
                    className="bg-[#11B5CF] px-4 py-2 rounded-lg"
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
            colors={['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399']}
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
                  className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                  placeholder="Enter food name"
                  value={newFood.name}
                  onChangeText={(text) => setNewFood({...newFood, name: text})}
                />
              </View>

              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-700 mb-2">Calories *</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                  placeholder="Enter calories"
                  value={newFood.calories}
                  onChangeText={(text) => setNewFood({...newFood, calories: text})}
                  keyboardType="numeric"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 mb-4">
                  <Text className="text-base font-semibold text-gray-700 mb-2">Carbs (g)</Text>
                  <TextInput
                    className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                    placeholder="0"
                    value={newFood.carbs}
                    onChangeText={(text) => setNewFood({...newFood, carbs: text})}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1 mb-4">
                  <Text className="text-base font-semibold text-gray-700 mb-2">Fat (g)</Text>
                  <TextInput
                    className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                    placeholder="0"
                    value={newFood.fat}
                    onChangeText={(text) => setNewFood({...newFood, fat: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 mb-4">
                  <Text className="text-base font-semibold text-gray-700 mb-2">Protein (g)</Text>
                  <TextInput
                    className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                    placeholder="0"
                    value={newFood.protein}
                    onChangeText={(text) => setNewFood({...newFood, protein: text})}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1 mb-4">
                  <Text className="text-base font-semibold text-gray-700 mb-2">Sodium (mg)</Text>
                    <TextInput
                      className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                      placeholder="0"
                      value={newFood.sodium}
                      onChangeText={(text) => setNewFood({...newFood, sodium: text})}
                      keyboardType="numeric"
                    />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-700 mb-2">Sugar (g)</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl text-base border border-gray-200"
                  placeholder="0"
                  value={newFood.sugar}
                  onChangeText={(text) => setNewFood({...newFood, sugar: text})}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                className="bg-[#11B5CF] py-4 rounded-xl items-center shadow-sm"
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
  );
};

export default FoodDiary;