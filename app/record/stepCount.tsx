import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Pedometer } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../src/config';

const StepCounter = () => {
  const insets = useSafeAreaInsets();
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [stepCount, setStepCount] = useState(0);
  const [isAccelerometerActive, setIsAccelerometerActive] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<string>('none');
  const [weeklyData, setWeeklyData] = useState<Record<string, any>>({});

  // Accelerometer-based step detection
  const accelerometerData = useRef({ x: 0, y: 0, z: 0 });
  const lastStepTime = useRef(0);
  const stepThreshold = 0.8; // Lowered threshold for better sensitivity
  const minStepInterval = 200; // Reduced minimum time between steps



  // Load weekly data from backend
  const loadWeeklyData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping backend data load');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/step/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const weeklyDataMap: Record<string, any> = {};
        data.forEach((item: any) => {
          weeklyDataMap[item.day] = item;
        });
        setWeeklyData(weeklyDataMap);
      } else {
        console.log('Failed to load weekly data:', response.status);
      }
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  // Save step data to backend
  const saveStepData = async (day: string, data: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping backend save');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/step/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day,
          steps: data.steps,
          miles: data.miles,
          minutes: data.minutes,
          calories: data.calories,
          floors: data.floors,
        }),
      });

      if (response.ok) {
        console.log('Step data saved successfully');
        await loadWeeklyData();
      } else {
        console.error('Failed to save step data:', response.status);
      }
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  };

  // Load stored step count from AsyncStorage
  const loadStoredStepCount = async () => {
    try {
      const today = new Date().toDateString();
      const storedData = await AsyncStorage.getItem(`steps_${today}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStepCount(parsedData.steps || 0);
      }
    } catch (error) {
      console.error('Error loading stored step count:', error);
    }
  };

  // Save step count to AsyncStorage
  const saveStepCount = async (steps: number) => {
    try {
      const today = new Date().toDateString();
      const data = { steps, timestamp: Date.now() };
      await AsyncStorage.setItem(`steps_${today}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving step count:', error);
    }
  };

  // Accelerometer-based step detection algorithm
  const detectStepFromAccelerometer = (x: number, y: number, z: number) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const prevMagnitude = Math.sqrt(
      accelerometerData.current.x * accelerometerData.current.x +
      accelerometerData.current.y * accelerometerData.current.y +
      accelerometerData.current.z * accelerometerData.current.z
    );

    accelerometerData.current = { x, y, z };

    const difference = Math.abs(magnitude - prevMagnitude);
    const currentTime = Date.now();

    // Only log when difference is significant to avoid spam
    if (difference > stepThreshold * 0.5) {
      console.log('Significant movement detected:', { difference, threshold: stepThreshold });
    }

    if (
      difference > stepThreshold &&
      currentTime - lastStepTime.current > minStepInterval
    ) {
      lastStepTime.current = currentTime;
      console.log('Step detected! Difference:', difference);
      return true;
    }
    return false;
  };

  // Initialize step counting systems
  const initializeStepCounting = async () => {
    try {
      // Load stored step count first
      await loadStoredStepCount();
      await loadWeeklyData();

      // Automatically use accelerometer for step counting (most reliable method)
      console.log('Setting up accelerometer for step counting...');
      setDetectionMethod('accelerometer');
      setIsAccelerometerActive(true);
      
      Accelerometer.setUpdateInterval(50);
      console.log('Accelerometer update interval set to 50ms');
      
      const subscription = Accelerometer.addListener(({ x, y, z }) => {
        if (detectStepFromAccelerometer(x, y, z)) {
          setStepCount(prev => {
            const newCount = prev + 1;
            saveStepCount(newCount);
            console.log('Accelerometer detected step:', newCount);
            return newCount;
          });
        }
      });

      console.log('Accelerometer listener added successfully');
      return () => subscription?.remove();
    } catch (error) {
      console.error("Step counting initialization error:", error);
      setDetectionMethod('manual');
    }
  };





  // Reset daily step count
  const resetStepCount = () => {
    Alert.alert(
      "Reset Step Count",
      "Are you sure you want to reset today's step count?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            setStepCount(0);
            saveStepCount(0);
          }
        }
      ]
    );
  };

  // Auto-save step data when it changes
  useEffect(() => {
    if (stepCount > 0) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const currentData = {
        steps: stepCount,
        miles: (stepCount * 0.0005).toFixed(2),
        minutes: Math.floor(stepCount / 100),
        calories: Math.floor(stepCount * 0.06),
        floors: Math.floor(stepCount / 1500),
      };
      
      const timeoutId = setTimeout(() => {
        saveStepData(today, currentData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [stepCount]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      cleanup = await initializeStepCounting();
    };

    setup();

    return () => {
      cleanup?.();
      // Clean up accelerometer listeners properly
      if (isAccelerometerActive) {
        try {
          Accelerometer.removeAllListeners();
        } catch (error) {
          console.log('Error removing accelerometer listeners:', error);
        }
      }
    };
  }, []);

  const goalSteps = 10000;
  
  const getCurrentDayName = (dayIndex: number) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[dayIndex];
  };

  const getCurrentDayData = () => {
    const today = getCurrentDayName(currentDay);
    const backendData = weeklyData[today];
    
    if (currentDay === new Date().getDay()) {
      const currentSteps = stepCount;
      return {
        steps: currentSteps,
        miles: (currentSteps * 0.0005).toFixed(2),
        minutes: Math.floor(currentSteps / 100),
        calories: Math.floor(currentSteps * 0.06),
        floors: Math.floor(currentSteps / 1500),
      };
    } else if (backendData) {
      return {
        steps: backendData.steps || 0,
        miles: backendData.miles || 0,
        minutes: backendData.minutes || 0,
        calories: backendData.calories || 0,
        floors: backendData.floors || 0,
      };
    } else {
      return {
        steps: 0,
        miles: 0,
        minutes: 0,
        calories: 0,
        floors: 0,
      };
    }
  };

  const currentData = getCurrentDayData();
  const currentSteps = currentData.steps;
  const progressPercentage = Math.min((currentSteps / goalSteps) * 100, 100);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDay((prev) => direction === 'prev' ? (prev === 0 ? 6 : prev - 1) : (prev === 6 ? 0 : prev + 1));
  };

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDayCircleColors = (dayIndex: number): string[] | null => {
    const gradients = [
      ['#dffd6e', '#14b8a6'],
      ['#fbbf24', '#f59e42'],
      ['#f472b6', '#a78bfa'],
      ['#60a5fa', '#2563eb'],
      ['#f87171', '#fbbf24'],
      ['#34d399', '#10b981'],
      ['#a3e635', '#f472b6'],
    ];
    return gradients[dayIndex % 7];
  };

  const ProgressCircle = () => (
    <View className="w-[200px] h-[200px] items-center justify-center">
      <Svg width="200" height="200" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#065f46" />
            <Stop offset="25%" stopColor="#0891b2" />
            <Stop offset="50%" stopColor="#0cb6ab" />
            <Stop offset="75%" stopColor="#14b8a6" />
            <Stop offset="100%" stopColor="#6ee7b7" />
          </SvgLinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r={radius} stroke="#FFFF" strokeWidth="8" fill="none" />
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View className="items-center justify-center">
        <Text className="text-[40px] font-bold text-lightblue mb-1">{currentSteps.toLocaleString()}</Text>
        <Text className="text-xs text-lightblue tracking-wider">STEPS</Text>
      </View>
    </View>
  );

  const DayCircle = ({ dayIndex, dayName }: { dayIndex: number; dayName: string }) => {
    const colors = getDayCircleColors(dayIndex) ?? ['#6b7280', '#6b7280'];
    const isSelected = dayIndex === currentDay;
    return (
      <TouchableOpacity onPress={() => setCurrentDay(dayIndex)} className="items-center mx-1">
        <View className={`w-8 h-8 rounded-full items-center justify-center ${isSelected ? 'border-2 border-white' : ''}`}>
          <LinearGradient
            colors={colors as [string, string]}
            style={{
              width: isSelected ? 28 : 32,
              height: isSelected ? 28 : 32,
              borderRadius: isSelected ? 14 : 16,
            }}
          />
        </View>
        <Text className="text-[10px] text-lightblue mt-2">{dayName}</Text>
      </TouchableOpacity>
    );
  };



      return (
      <View className="flex-1" style={{ backgroundColor: '#d6f3a0' }}>
                <View className="flex-1" style={{ paddingTop: insets.top }}>
          {/* Header */}
          <View className="px-6 py-4 mt-4">
          <Text className="text-3xl font-bold text-lightblue text-center mb-2">
            Step Counter
          </Text>
          <Text className="text-lightblue/80 text-center text-sm mb-6">
            Track your daily activity and stay motivated
          </Text>
        </View>

        {/* Main Content */}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Progress Circle */}
          <View className="items-center mb-8">
            <ProgressCircle />
          </View>

          {/* Current Day Stats */}
          <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#e8ffb3' }}>
            <Text className="text-xl font-semibold text-blue-600 mb-4 text-center">
              {currentDay === new Date().getDay() ? "Today's Progress" : `${getCurrentDayName(currentDay)}'s Progress`}
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-lightblue">{getCurrentDayData().steps}</Text>
                <Text className="text-lightblue/80 text-sm">Steps</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-lightblue">{getCurrentDayData().miles}</Text>
                <Text className="text-lightblue/80 text-sm">Miles</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-lightblue">{getCurrentDayData().calories}</Text>
                <Text className="text-lightblue/80 text-sm">Calories</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-lightblue">{getCurrentDayData().minutes}</Text>
                <Text className="text-lightblue/80 text-sm">Minutes</Text>
              </View>
            </View>
          </View>



          {/* Weekly Overview */}
          <View className="rounded-2xl p-6 mb-8" style={{ backgroundColor: '#e8ffb3' }}>
            <Text className="text-xl font-semibold text-lightblue mb-4 text-center">
              Weekly Overview
            </Text>
            <View className="flex-row justify-between">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <DayCircle
                  key={dayIndex}
                  dayIndex={dayIndex}
                  dayName={getCurrentDayName(dayIndex)}
                />
              ))}
            </View>
          </View>

          {/* Navigation */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={() => navigateDay('prev')}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3"
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-lightblue">
              {getCurrentDayName(currentDay)}
            </Text>
            <TouchableOpacity
              onPress={() => navigateDay('next')}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3"
            >
              <Ionicons name="chevron-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>


                  </ScrollView>
        </View>
      </View>
    );
};

export default StepCounter;