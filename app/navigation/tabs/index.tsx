import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { User, Target, Plus, TrendingUp, Calendar, Edit, MoreVertical, Flame, Bell, ArrowRight, Activity, Moon, Droplets, Utensils, Dumbbell, Scale, Heart, Thermometer, Wind, Zap, Brain, Pill } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';


const HealthTrackerDashboard = () => {
  const router = useRouter();
  const [currentDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [goals] = useState({
    calories: { current: 1450, target: 1550 },
    water: { current: 6, target: 8 },
    steps: { current: 8240, target: 10000 },
    sleep: { current: 7.5, target: 8 },
    bloodPressure: { current: 120, target: 120 }, // systolic
    heartRate: { current: 72, target: 80 },
    temperature: { current: 98.6, target: 98.6 },
    respiratoryRate: { current: 16, target: 18 },
    bloodOxygen: { current: 98, target: 100 },
    bloodSugar: { current: 110, target: 140 }
  });

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🔍 Token from AsyncStorage:', token ? 'Token exists' : 'No token found');
        
        if (!token) {
          console.log('❌ No token available, trying AsyncStorage fallback for user name');
          // Try to get user name from AsyncStorage as fallback
          const storedName = await AsyncStorage.getItem('userFullName');
          if (storedName) {
            console.log('✅ Setting user name from AsyncStorage (no token):', storedName);
            setUserName(storedName);
          } else {
            console.log('❌ No user name found in AsyncStorage either');
          }
          return;
        }
        
        console.log('🚀 Making API call to profile endpoint...');
        const response = await fetch('http://192.168.1.54:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.user && data.user.name) {
          console.log('✅ Setting user name from API:', data.user.name);
          setUserName(data.user.name);
        } else {
          console.log('❌ No user data or name in response, trying AsyncStorage fallback');
          // Fallback to AsyncStorage
          const storedName = await AsyncStorage.getItem('userFullName');
          if (storedName) {
            console.log('✅ Setting user name from AsyncStorage:', storedName);
            setUserName(storedName);
          } else {
            console.log('❌ No user name found in AsyncStorage either');
          }
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch user profile:', err);
        console.error('❌ Error details:', {
          message: err?.message || 'Unknown error',
          stack: err?.stack || 'No stack trace'
        });
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#11B5CF';
    if (percentage >= 75) return '#11B5CF';
    if (percentage >= 50) return '#11B5CF';
    return '#11B5CF';
  };

  const handleItemSelect = (itemId: string) => {
    // Navigation logic for specific cards
    if (itemId === 'calories') {
      router.push('/navigation/tabs/food');
      return;
    }
    if (itemId === 'water') {
      router.push('/navigation/tabs/water');
      return;
    }
    if (itemId === 'steps') {
      router.push('/record/stepCount');
      return;
    }
    if (itemId === 'sleep') {
      router.push('/record/sleeptracker');
      return;
    }
    if (itemId === 'bloodPressure') {
      router.push('/record/bloodpressuretracker');
      return;
    }
    if (itemId === 'heartRate') {
      router.push('/record/heartratetracker');
      return;
    }
    if (itemId === 'temperature') {
      router.push('/record/bodytemperaturetracker');
      return;
    }
    if (itemId === 'respiratoryRate') {
      router.push('/record/respiratoryRate');
      return;
    }
    if (itemId === 'bloodOxygen') {
      router.push('/record/bloodoxygentracker');
      return;
    }
    if (itemId === 'stressAssessment') {
      router.push('/stress-assessment');
      return;
    }
    if (itemId === 'medicineTracking') {
      router.push('/medicine-tracking');
      return;
    }
    if (itemId === 'cardio') {
      router.push('/record/Cardio');
      return;
    }
    if (itemId === 'bloodSugar') {
      router.push('/record/AddSugarReading');
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
        className={`rounded-full p-4 shadow-lg mb-4 w-[48%] border-2 ${
          isSelected ? 'border-transparent bg-green-50' : 'border-transparent'
        }`}
        style={{
          borderColor: isSelected ? '#11B5CF' : 'transparent',
          aspectRatio: 1,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={() => handleItemSelect(id)}
      >
        <View className="flex-1 justify-center items-center">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: color + '33' }}
          >
            <Icon size={32} color={color} />
          </View>
          
          <Text className="text-sm font-semibold text-gray-700 text-center mb-1">{title}</Text>
          <Text className="text-xs text-gray-500 text-center">
            {current}/{target}{unit}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#11B5CF', '#0EA5BF', '#0B95AF', '#08859F', '#05758F', '#02657F', '#01556F', '#00455F', '#00354F', '#00253F']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          <View className="flex-1 max-w-[1200px] self-center w-full" style={{ borderRadius: 24, overflow: 'hidden' }}>
            {/* Header */}
            <View className="">
              <View className="px-6 py-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View>
                      <Text className="text-2xl mt-6 font-bold text-white">{getGreeting()}, {userName ? userName : 'User'}!</Text>
                      <Text className="text-white font-medium">{formatDate(currentDate)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Main Content */}
            <View className="px-6 pb-6">
              {/* Health Metrics Grid */}
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
                <StatCard
                  id="bloodPressure"
                  icon={Heart}
                  title="Blood Pressure"
                  current={goals.bloodPressure.current}
                  target={goals.bloodPressure.target}
                  unit=" mmHg"
                />
                <StatCard
                  id="heartRate"
                  icon={Zap}
                  title="Heart Rate"
                  current={goals.heartRate.current}
                  target={goals.heartRate.target}
                  unit=" bpm"
                />
                <StatCard
                  id="temperature"
                  icon={Thermometer}
                  title="Temperature"
                  current={goals.temperature.current}
                  target={goals.temperature.target}
                  unit="°F"
                />
                <StatCard
                  id="respiratoryRate"
                  icon={Wind}
                  title="Respiratory Rate"
                  current={goals.respiratoryRate.current}
                  target={goals.respiratoryRate.target}
                  unit=" bpm"
                />
                <StatCard
                  id="bloodOxygen"
                  icon={Activity}
                  title="Blood Oxygen"
                  current={goals.bloodOxygen.current}
                  target={goals.bloodOxygen.target}
                  unit="%"
                />
                <StatCard
                  id="cardio"
                  icon={Activity}
                  title="Cardio"
                  current={goals.bloodOxygen.current}
                  target={goals.bloodOxygen.target}
                  unit="%"
                />
                <StatCard
                  id="bloodSugar"
                  icon={Flame}
                  title="Blood Sugar"
                  current={goals.bloodSugar.current}
                  target={goals.bloodSugar.target}
                  unit=" mg/dL"
                />


              </View>

              {/* Medicine Tracking Section */}
              <View className="mb-6">
                <TouchableOpacity 
                  className="bg-white p-6 shadow-lg"
                  style={{
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 12,
                    borderWidth: 2,
                    borderColor: '#EC4899',
                    backgroundColor: '#ffffff',
                  }}
                  onPress={() => handleItemSelect('medicineTracking')}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-4">
                        <View className="w-16 h-16 rounded-full items-center justify-center mr-4 shadow-lg"
                          style={{
                            backgroundColor: '#EC4899',
                            shadowColor: '#EC4899',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                          }}>
                          <Pill size={28} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 text-2xl font-bold mb-1">Medicine Tracking</Text>
                          <Text className="text-gray-600 text-base font-medium">Manage your medications</Text>
                        </View>
                      </View>
                      <Text className="text-gray-700 text-base leading-6 mb-4">
                        Track your daily medications, set reminders, and maintain a complete medication history for better health management.
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 rounded-full bg-pink-500 mr-2"></View>
                          <Text className="text-pink-600 font-semibold text-sm">Medication Reminders</Text>
                        </View>
                        <View className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: '#EC4899',
                            shadowColor: '#EC4899',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                          }}>
                          <ArrowRight size={24} color="white" />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Stress Assessment Section */}
              <View className="mb-6">
                <TouchableOpacity 
                  className="bg-white p-6 shadow-lg"
                  style={{
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 12,
                    borderWidth: 2,
                    borderColor: '#11B5CF',
                    backgroundColor: '#ffffff',
                  }}
                  onPress={() => handleItemSelect('stressAssessment')}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-4">
                        <View className="w-16 h-16 rounded-full items-center justify-center mr-4 shadow-lg"
                          style={{
                            backgroundColor: '#11B5CF',
                            shadowColor: '#11B5CF',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                          }}>
                          <Brain size={28} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 text-2xl font-bold mb-1">Stress Assessment</Text>
                          <Text className="text-gray-600 text-base font-medium">Evaluate your mental wellness</Text>
                        </View>
                      </View>
                      <Text className="text-gray-700 text-base leading-6 mb-4">
                        Take a comprehensive stress assessment to understand your mental health status and get personalized recommendations for better mental health.
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 rounded-full bg-green-500 mr-2"></View>
                          <Text className="text-green-600 font-semibold text-sm">Quick Assessment</Text>
                        </View>
                        <View className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: '#11B5CF',
                            shadowColor: '#11B5CF',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                          }}>
                          <ArrowRight size={24} color="white" />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HealthTrackerDashboard;