import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { User, Target, Plus, TrendingUp, Calendar, Edit, MoreVertical, Flame, Bell, ArrowRight, Activity, Moon, Droplets, Utensils, Dumbbell, Scale } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HealthTrackerDashboard = () => {
  const router = useRouter();
  const [currentDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [goals] = useState({
    calories: { current: 1450, target: 1550 },
    water: { current: 6, target: 8 },
    steps: { current: 8240, target: 10000 },
    sleep: { current: 7.5, target: 8 },
    weight: { current: 68.5, target: 65 },
    workout: { current: 4, target: 5 }
  });

  const [macros] = useState({
    protein: { current: 85, target: 120 },
    carbs: { current: 145, target: 200 },
    fat: { current: 48, target: 65 },
    fiber: { current: 18, target: 25 }
  });

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const response = await fetch('http://192.168.1.16:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.user && data.user.name) {
          setUserName(data.user.name);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUserProfile();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#0cb6ab';
    if (percentage >= 75) return '#0cb6ab';
    if (percentage >= 50) return '#0cb6ab';
    return '#0cb6ab';
  };

  const handleItemSelect = (itemId: string) => {
    // Navigation logic for specific cards
    if (itemId === 'calories') {
      router.push('/(tabs)/food');
      return;
    }
    if (itemId === 'water') {
      router.push('/(tabs)/water');
      return;
    }
    if (itemId === 'steps') {
      router.push('/(tabs)/tracker');
      return;
    }
    if (itemId === 'sleep') {
      // If you have a sleep screen, update the path accordingly
      router.push('/record/vitalSigns'); // Example: change to your actual sleep screen path
      return;
    }
    // Default selection logic
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const ProgressBar = ({ current, target, color, showPercentage = false }: { current: number; target: number; color: string; showPercentage?: boolean }) => {
    const percentage = calculateProgress(current, target);
    return (
      <View className="relative">
        <View className="w-full h-2 bg-gray-200 rounded overflow-hidden">
          <View 
            className="h-full rounded"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }}
          />
        </View>
        {showPercentage && (
          <Text className="absolute -top-6 right-0 text-xs font-semibold text-gray-500">
            {Math.round(percentage)}%
          </Text>
        )}
      </View>
    );
  };

  const StatCard = ({ id, icon: Icon, title, current, target, unit = '' }: { id: string; icon: any; title: string; current: number; target: number; unit?: string }) => {
    const progress = calculateProgress(current, target);
    const color = getProgressColor(progress);
    const isSelected = selectedItems.has(id);
    
    return (
      <TouchableOpacity 
        className={`bg-white rounded-2xl p-4 shadow-lg mb-4 w-[48%] border-2 ${
          isSelected ? 'border-[#0cb6ab] bg-green-50' : 'border-transparent'
        }`}
        onPress={() => handleItemSelect(id)}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon size={24} color={color} />
          </View>
          <TouchableOpacity className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center">
            <MoreVertical size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-base font-semibold text-gray-700 mb-2">{title}</Text>
        
        <View className="flex-row items-baseline mb-3">
          <Text className="text-2xl font-bold text-gray-900">
            {typeof current === 'number' && current > 1000 ? current.toLocaleString() : current}
          </Text>
          <Text className="text-sm text-gray-500 ml-1">
            {unit} / {typeof target === 'number' && target > 1000 ? target.toLocaleString() : target}{unit}
          </Text>
        </View>
        
        <ProgressBar 
          current={current} 
          target={target} 
          color={color}
          showPercentage={false}
        />
        
        <Text className="text-center text-xs font-semibold mt-2" style={{ color }}>
          {Math.round(progress)}% Complete
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 max-w-[1200px] self-center w-full">
          {/* Header */}
          <View className="">
            <View className="px-6 py-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                 
                  <View>
                    <Text className="text-2xl mt-10 font-bold text-gray-900">Good Morning, {userName ? userName : 'User'}!</Text>
                    <Text className="text-gray-500 font-medium">{formatDate(currentDate)}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                 
                  <TouchableOpacity className="relative p-2 bg-gray-100 rounded-full">
                    <Bell size={24} color="#374151" />
                    <View className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View className="px-6 pb-6">
        
            {/* Goals Grid */}
            <View className="flex-row flex-wrap justify-between mb-6">
              <StatCard
                id="calories"
                icon={Utensils}
                title="Calories"
                current={goals.calories.current}
                target={goals.calories.target}
                unit=" cal"
              />
              <StatCard
                id="water"
                icon={Droplets}
                title="Water"
                current={goals.water.current}
                target={goals.water.target}
                unit=" glasses"
              />
              <StatCard
                id="steps"
                icon={Activity}
                title="Steps"
                current={goals.steps.current}
                target={goals.steps.target}
              />
              <StatCard
                id="sleep"
                icon={Moon}
                title="Sleep"
                current={goals.sleep.current}
                target={goals.sleep.target}
                unit="h"
              />
            </View>

            {/* Nutrition Tracking */}
            <TouchableOpacity 
              className="bg-white rounded-3xl p-6 shadow-lg mb-6"
              onPress={() => handleItemSelect('nutrition')}
            >
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
                    <Target size={24} color="#0cb6ab" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-gray-900">Nutrition Breakdown</Text>
                    <Text className="text-sm text-gray-500 mt-1">Macros & Micronutrients</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <Edit size={18} color="#4f46e5" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center border border-blue-200">
                    <Plus size={18} color="#0cb6ab" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row flex-wrap justify-between">
                  {Object.entries(macros).map(([key, value]) => (
                    <View key={key} className="w-[48%] mb-4">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-sm font-semibold text-gray-600">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                        <Text className="text-xs font-semibold text-gray-500">
                          {Math.round(calculateProgress(value.current, value.target))}%
                        </Text>
                      </View>
                      <View className="mb-2">
                        <Text className="text-sm font-medium text-gray-900">
                          {value.current}g / {value.target}g
                        </Text>
                      </View>
                      <View className="h-1.5 bg-gray-200 rounded overflow-hidden">
                        <View 
                          className="h-full rounded"
                          style={{ 
                            width: `${calculateProgress(value.current, value.target)}%`, 
                            backgroundColor: getProgressColor(calculateProgress(value.current, value.target))
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View className="bg-white rounded-3xl p-6 shadow-lg">
              <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity 
                  className="w-[48%] items-center mb-4"
                  onPress={() => handleItemSelect('weight')}
                >
                  <View className="w-15 h-15 bg-blue-50 rounded-full items-center justify-center mb-3">
                    <Scale size={28} color="#0cb6ab" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900 text-center">Weight</Text>
                  <Text className="text-2xl font-bold text-gray-900 mt-2">{goals.weight.current}kg</Text>
                  <Text className="text-xs text-gray-500 mt-1">Target: {goals.weight.target}kg</Text>
                  <View className="w-full h-1.5 bg-gray-200 rounded mt-3 overflow-hidden">
                    <View className="w-3/4 h-full bg-[#0cb6ab] rounded" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="w-[48%] items-center mb-4"
                  onPress={() => handleItemSelect('workout')}
                >
                  <View className="w-15 h-15 bg-blue-50 rounded-full items-center justify-center mb-3">
                    <Dumbbell size={28} color="#0cb6ab" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900 text-center">Workout</Text>
                  <Text className="text-2xl font-bold text-gray-900 mt-2">{goals.workout.current}/{goals.workout.target}</Text>
                  <Text className="text-xs text-gray-500 mt-1">This week</Text>
                  <View className="w-full h-1.5 bg-gray-200 rounded mt-3 overflow-hidden">
                    <View className="w-4/5 h-full bg-[#0cb6ab] rounded" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HealthTrackerDashboard;