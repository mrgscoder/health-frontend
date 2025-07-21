import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, SafeAreaView, Alert, ScrollView, FlatList } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const THEME_COLOR = '#00b8f1';

interface StepHistory {
  id?: number;
  day: string;
  steps: number;
  miles: number;
  minutes: number;
  calories: number;
  floors: number;
}

const StepCount = () => {
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<StepHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const stepGoal = 10000;
  const progressPercentage = Math.min((steps / stepGoal) * 100, 100);

  // Animation values
  const scaleValue = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  // Debug modal state
  useEffect(() => {
    console.log('showHistory state changed to:', showHistory);
  }, [showHistory]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleAddStep = async () => {
    // Animate button press
    buttonScale.value = withSpring(0.95);
    setTimeout(() => {
      buttonScale.value = withSpring(1);
    }, 100);

    const newSteps = steps + 1;
    const newCalories = calories + 0.04; // Approx calories burned per step
    const newDistance = distance + 0.762; // Approx meters per step

    setSteps(newSteps);
    setCalories(newCalories);
    setDistance(newDistance);

    // Animate progress
    scaleValue.value = withSpring(1.1);
    setTimeout(() => {
      scaleValue.value = withSpring(1);
    }, 200);

    // Save to database via API
    await saveStepDataToAPI(newSteps, newCalories, newDistance);
  };

  const saveStepDataToAPI = async (stepCount: number, caloriesBurned: number, distanceMeters: number) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please log in to save step data');
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const miles = distanceMeters * 0.000621371; // Convert meters to miles
      const minutes = Math.floor(stepCount / 100); // Approximate minutes based on steps

      const response = await fetch('http://192.168.1.16:5001/api/step/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          day: today,
          steps: stepCount,
          miles: miles,
          minutes: minutes,
          calories: Math.round(caloriesBurned),
          floors: 0 // Default value, can be updated later
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save step data:', response.status, errorText);
        Alert.alert('Error', 'Failed to save step data to database. Please try again.');
      } else {
        const result = await response.json();
        console.log('Step data saved successfully:', result);
      }
    } catch (error) {
      console.error('Error saving step data:', error);
      Alert.alert('Error', 'Failed to connect to server. Step data saved locally only.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStepHistory = async () => {
    try {
      console.log('Fetching step history...');
      setIsLoadingHistory(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      console.log('Token found:', !!token);
      
      if (!token) {
        Alert.alert('Error', 'Please log in to view history');
        return;
      }

      console.log('Making API request to:', 'http://192.168.1.16:5001/api/step/get');
      
      const response = await fetch('http://192.168.1.16:5001/api/step/get', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch step history:', response.status, errorText);
        Alert.alert('Error', `Failed to fetch step history. Status: ${response.status}`);
      } else {
        const data = await response.json();
        console.log('Received data:', data);
        // Ensure data is an array and has valid structure
        if (Array.isArray(data)) {
          console.log('Data is array, length:', data.length);
          setHistoryData(data);
        } else {
          console.error('Invalid data format received:', data);
          setHistoryData([]);
          Alert.alert('Error', 'Invalid data format received from server.');
        }
      }
    } catch (error) {
      console.error('Error fetching step history:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to connect to server: ${errorMessage}`);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = () => {
    console.log('View History button clicked');
    if (showHistory) {
      // If history is already shown, hide it
      setShowHistory(false);
    } else {
      // If history is hidden, show it and fetch data
      setShowHistory(true);
      fetchStepHistory();
    }
  };

  const handleReset = () => {
    setSteps(0);
    setCalories(0);
    setDistance(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderHistoryItem = ({ item }: { item: StepHistory }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          {formatDate(item.day)}
        </Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-600 font-medium">{item.steps || 0} steps</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        <View className="items-center">
          <Ionicons name="flame" size={16} color="#f59e0b" />
          <Text className="text-sm text-gray-600">{item.calories || 0} cal</Text>
        </View>
        <View className="items-center">
          <Ionicons name="map" size={16} color="#3b82f6" />
          <Text className="text-sm text-gray-600">{(item.miles || 0).toFixed(1)} mi</Text>
        </View>
        <View className="items-center">
          <Ionicons name="time" size={16} color="#10b981" />
          <Text className="text-sm text-gray-600">{item.minutes || 0} min</Text>
        </View>
        <View className="items-center">
          <Ionicons name="trending-up" size={16} color="#8b5cf6" />
          <Text className="text-sm text-gray-600">{item.floors || 0} floors</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-800 text-center">Step Tracker</Text>
          <Text className="text-gray-500 text-center mt-1">Track your daily steps</Text>
        </View>

        {/* Progress Card */}
        <LinearGradient
          colors={['#00b8f1', '#0099cc']}
          className="rounded-2xl p-6 mb-6 shadow-lg"
        >
          <View className="items-center">
            <Animated.View style={animatedStyle}>
              <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-4">
                <FontAwesome5 name="shoe-prints" size={40} color="white" />
              </View>
            </Animated.View>
            
            <Text className="text-white text-2xl font-bold mb-2">
              {steps.toLocaleString()} / {stepGoal.toLocaleString()}
            </Text>
            <Text className="text-white/90 text-lg mb-4">
              {progressPercentage.toFixed(1)}% Complete
            </Text>
            
            {/* Progress Bar */}
            <View className="w-full bg-white/20 rounded-full h-3 mb-4">
              <View 
                className="bg-white rounded-full h-3"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
            <View className="items-center">
              <Ionicons name="flame" size={24} color="#f59e0b" />
              <Text className="text-xl font-bold text-gray-800 mt-2">{calories.toFixed(1)}</Text>
              <Text className="text-gray-600 text-sm">Calories</Text>
            </View>
          </View>
          
          <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
            <View className="items-center">
              <Ionicons name="map" size={24} color="#3b82f6" />
              <Text className="text-xl font-bold text-gray-800 mt-2">{distance.toFixed(1)}</Text>
              <Text className="text-gray-600 text-sm">Distance (m)</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mb-6">
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleAddStep}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl mb-4 ${isLoading ? 'opacity-50' : ''}`}
            >
              <LinearGradient
                colors={['#00b8f1', '#0099cc']}
                className="rounded-xl py-4 items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? 'Saving...' : 'Add Step'}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View className="flex-row space-x-3">
            <Pressable
              onPress={handleReset}
              className="flex-1 py-4 rounded-xl bg-gray-200"
            >
              <Text className="text-center text-gray-700 font-semibold">Reset</Text>
            </Pressable>
            
            <Pressable
              onPress={handleViewHistory}
              className="flex-1 py-4 rounded-xl bg-blue-100"
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text className="text-center text-blue-600 font-semibold">
                {showHistory ? 'Hide History' : 'View History'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Tips Section */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="lightbulb" size={20} color="#facc15" />
            <Text className="text-gray-800 font-semibold ml-2">Tips</Text>
          </View>
          <Text className="text-gray-600 text-sm leading-5">
            Press "Add Step" each time you take a step. Aim for 10,000 steps daily for optimal health benefits.
          </Text>
        </View>

        {/* History Section */}
        {showHistory && (
          <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#3b82f6" />
                <Text className="text-gray-800 font-semibold ml-2">Step History</Text>
              </View>
              <Pressable
                onPress={() => setShowHistory(false)}
                className="p-2"
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </Pressable>
            </View>

            {isLoadingHistory ? (
              <View className="py-8 items-center">
                <Text className="text-gray-600">Loading history...</Text>
              </View>
            ) : (
              <View>
                {historyData.length > 0 ? (
                  <FlatList
                    data={historyData}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    ListEmptyComponent={
                      <View className="py-8 items-center">
                        <Feather name="activity" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 text-center mt-4">
                          No step data found.{'\n'}Start tracking your steps to see your history here.
                        </Text>
                      </View>
                    }
                  />
                ) : (
                  <View className="py-8 items-center">
                    <Feather name="activity" size={48} color="#9ca3af" />
                    <Text className="text-gray-500 text-center mt-4">
                      No step data found.{'\n'}Start tracking your steps to see your history here.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StepCount;
