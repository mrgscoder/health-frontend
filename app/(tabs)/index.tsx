import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { User, Target, Plus, TrendingUp, Calendar, Edit, MoreVertical, Flame, Bell, ArrowRight, Activity, Moon, Droplets, Utensils, Dumbbell, Scale, Heart, Thermometer, Wind, Zap } from 'lucide-react-native';
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
    bloodPressure: { current: 120, target: 120 }, // systolic
    heartRate: { current: 72, target: 80 },
    temperature: { current: 98.6, target: 98.6 },
    respiratoryRate: { current: 16, target: 18 },
    bloodOxygen: { current: 98, target: 100 }
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
        <View className="flex-row justify-center items-center mb-3">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon size={32} color={color} />
          </View>
        </View>
        
        <Text className="text-base font-semibold text-gray-700 text-center">{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0cb6ab]">
      <ScrollView className="flex-1">
        <View className="flex-1 max-w-[1200px] self-center w-full">
          {/* Header */}
          <View className="">
            <View className="px-6 py-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-2xl mt-10 font-bold text-gray-900">Good Morning, {userName ? userName : 'User'}!</Text>
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
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HealthTrackerDashboard;