import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, SafeAreaView, FlatList, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from "../../../src/config";

interface FoodItem {
  name: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
}

interface FoodData {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

const Food = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<keyof FoodData>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    carbs: '',
    fat: '',
    protein: '',
    sodium: '',
    sugar: ''
  });

  // Store food data for each date
  const [foodDataByDate, setFoodDataByDate] = useState<Record<string, FoodData>>({});

  // Fetch food data when component mounts and when selected date changes
  useEffect(() => {
    fetchFoodData(selectedDate);
  }, [selectedDate]);

  // Add a focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      fetchFoodData(selectedDate);
    });

    return unsubscribe;
  }, [navigation, selectedDate]);

  const dailyGoals = {
    calories: 1870,
    carbs: 209,
    fat: 58,
    protein: 84,
    sodium: 2300,
    sugar: 63
  };

  function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getCurrentFoodData(): FoodData {
    const dateKey = formatDateKey(selectedDate);
    return foodDataByDate[dateKey] || {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
  }

  function updateFoodData(newData: FoodData) {
    const dateKey = formatDateKey(selectedDate);
    setFoodDataByDate(prev => ({
      ...prev,
      [dateKey]: newData
    }));
  }

  const fetchFoodData = async (date: Date) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (token) {
        const dateKey = formatDateKey(date);
        const response = await fetch(`${BASE_URL}/api/food/getfood?date=${dateKey}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const records = data.records || [];
          
          // Group records by meal type
          const foodData: FoodData = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
          };
          
          records.forEach((record: any) => {
            const foodItem: FoodItem = {
              name: record.name,
              calories: record.calories,
              carbs: record.carbs,
              fat: record.fat,
              protein: record.protein,
              sodium: record.sodium,
              sugar: record.sugar
            };
            
            if (record.meal && foodData[record.meal as keyof FoodData]) {
              foodData[record.meal as keyof FoodData].push(foodItem);
            }
          });
          
          // Update the food data for this date
          setFoodDataByDate(prev => ({
            ...prev,
            [dateKey]: foodData
          }));
        } else if (response.status === 404) {
          // If no data found for this date, initialize empty food data
          console.log('No food data found for date:', dateKey);
          setFoodDataByDate(prev => ({
            ...prev,
            [dateKey]: {
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: []
            }
          }));
        } else {
          console.error('Failed to fetch food data:', response.status);
          // For other errors, initialize empty food data for this date
          setFoodDataByDate(prev => ({
            ...prev,
            [dateKey]: {
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: []
            }
          }));
        }
      } else {
        console.error('No token available');
        Alert.alert('Error', 'Authentication required');
      }
    } catch (error) {
      console.error('Error fetching food data:', error);
      Alert.alert('Error', 'Failed to load food data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodData(selectedDate);
    setRefreshing(false);
  };

  // Function to refresh data for current date
  const refreshCurrentDateData = () => {
    fetchFoodData(selectedDate);
  };

  const calculateTotals = () => {
    let totals = { calories: 0, carbs: 0, fat: 0, protein: 0, sodium: 0, sugar: 0 };
    const currentFoodData = getCurrentFoodData();
    
    Object.values(currentFoodData).forEach(mealItems => {
      mealItems.forEach((item: FoodItem) => {
        totals.calories += item.calories;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
        totals.protein += item.protein;
        totals.sodium += item.sodium;
        totals.sugar += item.sugar;
      });
    });
    
    return totals;
  };

  const totals = calculateTotals();
  const remaining = {
    calories: Math.max(0, dailyGoals.calories - totals.calories),
    carbs: Math.max(0, dailyGoals.carbs - totals.carbs),
    fat: Math.max(0, dailyGoals.fat - totals.fat),
    protein: Math.max(0, dailyGoals.protein - totals.protein),
    sodium: Math.max(0, dailyGoals.sodium - totals.sodium),
    sugar: Math.max(0, dailyGoals.sugar - totals.sugar)
  };

  const handleAddFood = async () => {
    if (!newFood.name || !newFood.calories) {
      Alert.alert('Error', 'Please enter food name and calories');
      return;
    }

    const foodItem: FoodItem = {
      name: newFood.name,
      calories: parseInt(newFood.calories) || 0,
      carbs: parseInt(newFood.carbs) || 0,
      fat: parseInt(newFood.fat) || 0,
      protein: parseInt(newFood.protein) || 0,
      sodium: parseInt(newFood.sodium) || 0,
      sugar: parseInt(newFood.sugar) || 0
    };

    // Add to local state first
    const currentFoodData = getCurrentFoodData();
    const updatedFoodData: FoodData = {
      ...currentFoodData,
      [selectedMeal]: [...currentFoodData[selectedMeal], foodItem]
    };
    
    updateFoodData(updatedFoodData);

    // Call API to save to database
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch(`${BASE_URL}/api/food/addfood`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: formatDateKey(selectedDate),
            meal: selectedMeal,
            name: foodItem.name,
            calories: foodItem.calories,
            carbs: foodItem.carbs,
            fat: foodItem.fat,
            protein: foodItem.protein,
            sodium: foodItem.sodium,
            sugar: foodItem.sugar
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to add food:', response.status, errorText);
          Alert.alert('Error', 'Failed to save food to database');
        } else {
          console.log('Food added successfully to database');
          // Refresh the food data after adding
          await fetchFoodData(selectedDate);
        }
      } else {
        console.error('No token available');
        Alert.alert('Error', 'Authentication required');
      }
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }

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
  };

  const openAddFoodModal = (meal: keyof FoodData) => {
    setSelectedMeal(meal);
    setShowAddFoodModal(true);
  };

  const removeFood = (mealKey: keyof FoodData, index: number) => {
    const currentFoodData = getCurrentFoodData();
    const updatedFoodData: FoodData = {
      ...currentFoodData,
      [mealKey]: currentFoodData[mealKey].filter((_: FoodItem, i: number) => i !== index)
    };
    updateFoodData(updatedFoodData);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
    // fetchFoodData will be called automatically via useEffect
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
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
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-4 py-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-800">Select Date</Text>
              <TouchableOpacity 
                onPress={() => setShowCalendarModal(false)}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-4 py-6">
            {/* Month/Year Header */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons name="chevron-left" size={24} color="#6b7280" />
              </TouchableOpacity>
              
              <Text className="text-lg font-semibold text-gray-800">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </Text>
              
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons name="chevron-right" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View className="flex-row mb-2">
              {dayNames.map((day, index) => (
                <View key={index} className="flex-1 items-center py-2">
                  <Text className="text-sm font-medium text-gray-500">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => (
                <View key={index} className="w-1/7 aspect-square p-1" style={{ width: '14.28%' }}>
                  {day && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDate(day);
                        setShowCalendarModal(false);
                        // fetchFoodData will be called automatically via useEffect
                      }}
                      className={`flex-1 items-center justify-center rounded-lg ${
                        day.toDateString() === selectedDate.toDateString()
                          ? 'bg-[#11B5CF]'
                          : day.toDateString() === new Date().toDateString()
                          ? 'bg-[#dffd6e]'
                          : 'active:bg-gray-100'
                      }`}
                    >
                      <Text className={`text-base ${
                        day.toDateString() === selectedDate.toDateString()
                          ? 'text-white font-semibold'
                          : day.toDateString() === new Date().toDateString()
                          ? 'text-[#11B5CF] font-semibold'
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
        </SafeAreaView>
      </Modal>
    );
  };

  const MealSection = ({ title, mealKey, items }: { title: string; mealKey: keyof FoodData; items: FoodItem[] }) => (
    <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-800">{title}</Text>
      </View>
      <View className="px-4 py-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800 mb-1">{item.name}</Text>
                <Text className="text-sm text-gray-500">{item.calories} calories</Text>
              </View>
              <View className="flex-row items-center space-x-6">
                <View className="flex-row space-x-4">
                  <View className="items-center">
                    <Text className="text-xs font-medium text-gray-600">C</Text>
                    <Text className="text-sm text-gray-800">{item.carbs}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs font-medium text-gray-600">F</Text>
                    <Text className="text-sm text-gray-800">{item.fat}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs font-medium text-gray-600">P</Text>
                    <Text className="text-sm text-gray-800">{item.protein}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => removeFood(mealKey, index)}
                  className="p-2 rounded-full bg-red-50 active:bg-red-100 ml-2"
                >
                  <Ionicons name="close" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="py-6 items-center">
            <Text className="text-gray-400 text-base mb-2">No items added yet</Text>
            <Text className="text-gray-300 text-sm">Tap "Add Food" to get started</Text>
          </View>
        )}
        <TouchableOpacity 
          onPress={() => openAddFoodModal(mealKey)}
          className="flex-row items-center justify-center py-3 mt-3 bg-[#dffd6e] rounded-lg active:bg-[#11B5CF]"
        >
          <FontAwesome5 name="plus" size={14} color="#11B5CF" />
          <Text className="text-[#11B5CF] font-medium ml-2">Add Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const NutritionBar = ({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return (
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-medium text-gray-700">{label}</Text>
          <Text className="text-sm text-gray-600">{current}/{goal}</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className={`h-full ${color} rounded-full`}
            style={{ width: `${percentage}%` }} 
          />
        </View>
      </View>
    );
  };

  const currentFoodData = getCurrentFoodData();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#11B5CF']}
            tintColor="#11B5CF"
          />
        }
      >
        {/* Header */}
        <View className="bg-white px-4 py-6 shadow-sm">
          <View className="items-center">
            <Text className="text-black text-3xl  font-bold mb-2 mt-4">Your Food Diary</Text>
            <Text className="text-gray-500 text-sm italic mb-4">Track your nutrition, fuel your wellness journey</Text>
            <View className="w-16 h-0.5 bg-[#11B5CF] mb-4"></View>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity 
                onPress={() => navigateDate('prev')}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200 "
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color="#6b7280" />
              </TouchableOpacity>
              <Text className="text-sm font-semibold text-gray-800 mx-4">
                {formatDisplayDate(selectedDate)}
              </Text>
              <TouchableOpacity 
                onPress={() => navigateDate('next')}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200 mr-5"
              >
                <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowCalendarModal(true)}
                className="p-2 rounded-full bg-[#dffd6e] active:bg-[#11B5CF]"
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#11B5CF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View className="px-4 mt-4">
          {isLoading ? (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-base">Loading food data...</Text>
            </View>
          ) : (
            <>
              <MealSection title="🍳 Breakfast" mealKey="breakfast" items={currentFoodData.breakfast} />
              <MealSection title="🥗 Lunch" mealKey="lunch" items={currentFoodData.lunch} />
              <MealSection title="🍽️ Dinner" mealKey="dinner" items={currentFoodData.dinner} />
              <MealSection title="🍿 Snacks" mealKey="snacks" items={currentFoodData.snacks} />
            </>
          )}
        </View>

        {/* Summary */}
        <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm border border-gray-100">
          <View className="px-4 py-4">
            <View className="space-y-4">
              {/* Header Row */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-500 w-16"></Text>
                <View className="flex-row justify-between flex-1">
                  <Text className="text-xs font-medium text-gray-500 w-12 text-center">Cal</Text>
                  <Text className="text-xs font-medium text-gray-500 w-12 text-center">Carbs</Text>
                  <Text className="text-xs font-medium text-gray-500 w-12 text-center">Fat</Text>
                  <Text className="text-xs font-medium text-gray-500 w-12 text-center">Protein</Text>
                  <Text className="text-xs font-medium text-gray-500 w-12 text-center">Sodium</Text>
                  <Text className="text-xs font-medium text-gray-500 w-12 text-center">Sugar</Text>
                </View>
              </View>

              {/* Totals Row */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700 w-16">Totals</Text>
                <View className="flex-row justify-between flex-1">
                  <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{totals.calories}</Text>
                  <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{totals.carbs}</Text>
                  <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{totals.fat}</Text>
                  <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{totals.protein}</Text>
                  <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{totals.sodium}</Text>
                  <Text className="text-sm font-semibold text-gray-800 w-12 text-center">{totals.sugar}</Text>
                </View>
              </View>
              
              {/* Goal Row */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700 w-16">Goal</Text>
                <View className="flex-row justify-between flex-1">
                  <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.calories}</Text>
                  <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.carbs}</Text>
                  <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.fat}</Text>
                  <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.protein}</Text>
                  <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.sodium}</Text>
                  <Text className="text-sm text-gray-600 w-12 text-center">{dailyGoals.sugar}</Text>
                </View>
              </View>
              
              {/* Remaining Row */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-[#11B5CF] w-16">Left</Text>
                <View className="flex-row justify-between flex-1">
                  <Text className="text-sm text-[#11B5CF] w-12 text-center">{remaining.calories}</Text>
                  <Text className="text-sm text-[#11B5CF] w-12 text-center">{remaining.carbs}</Text>
                  <Text className="text-sm text-[#11B5CF] w-12 text-center">{remaining.fat}</Text>
                  <Text className="text-sm text-[#11B5CF] w-12 text-center">{remaining.protein}</Text>
                  <Text className="text-sm text-[#11B5CF] w-12 text-center">{remaining.sodium}</Text>
                  <Text className="text-sm text-[#11B5CF] w-12 text-center">{remaining.sugar}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bars */}
        <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm border border-gray-100 px-4 py-5">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Daily Progress</Text>
          <NutritionBar 
            label="Calories" 
            current={totals.calories} 
            goal={dailyGoals.calories} 
            color="bg-[#11B5CF]" 
          />
          <NutritionBar 
            label="Carbs" 
            current={totals.carbs} 
            goal={dailyGoals.carbs} 
            color="bg-[#dffd6e]" 
          />
          <NutritionBar 
            label="Fat" 
            current={totals.fat} 
            goal={dailyGoals.fat} 
            color="bg-[#11B5CF]" 
          />
          <NutritionBar 
            label="Protein" 
            current={totals.protein} 
            goal={dailyGoals.protein} 
            color="bg-[#dffd6e]" 
          />
        </View>


      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal />

      {/* Add Food Modal */}
      <Modal
        visible={showAddFoodModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddFoodModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-4 py-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-800">Add Food Item</Text>
              <TouchableOpacity 
                onPress={() => setShowAddFoodModal(false)}
                className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView className="flex-1 px-4 py-6">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Food Name *</Text>
                <TextInput
                  value={newFood.name}
                  onChangeText={text => setNewFood(prev => ({ ...prev, name: text }))}
                  placeholder="Enter food name"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Calories *</Text>
                <TextInput
                  value={newFood.calories}
                  onChangeText={text => setNewFood(prev => ({ ...prev, calories: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                />
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Carbs (g)</Text>
                  <TextInput
                    value={newFood.carbs}
                    onChangeText={text => setNewFood(prev => ({ ...prev, carbs: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Fat (g)</Text>
                  <TextInput
                    value={newFood.fat}
                    onChangeText={text => setNewFood(prev => ({ ...prev, fat: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                  />
                </View>
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Protein (g)</Text>
                  <TextInput
                    value={newFood.protein}
                    onChangeText={text => setNewFood(prev => ({ ...prev, protein: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Sodium (mg)</Text>
                  <TextInput
                    value={newFood.sodium}
                    onChangeText={text => setNewFood(prev => ({ ...prev, sodium: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Sugar (g)</Text>
                <TextInput
                  value={newFood.sugar}
                  onChangeText={text => setNewFood(prev => ({ ...prev, sugar: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white focus:border-[#11B5CF]"
                />
              </View>
            </View>
          </ScrollView>

          <View className="px-4 py-6 border-t border-gray-200">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowAddFoodModal(false)}
                className="flex-1 bg-gray-200 py-4 rounded-lg items-center active:bg-gray-300"
              >
                <Text className="text-gray-700 font-medium text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddFood}
                className="flex-1 bg-[#11B5CF] py-4 rounded-lg items-center active:bg-[#0a9a8f]"
              >
                <Text className="text-white font-medium text-base">Add Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Food;