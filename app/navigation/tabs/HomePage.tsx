import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Dimensions, Image } from 'react-native';
import { User, Target, Plus, TrendingUp, Calendar, Edit, MoreVertical, Flame, Bell, ArrowRight, Activity, Moon, Droplets, Utensils, Dumbbell, Scale, Heart, Thermometer, Wind, Zap, Brain, Pill, Timer, Apple, BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';


import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../../../src/config';
import { clearAuthData } from '../../utils/authUtils';
import { PanGestureHandler, NativeViewGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import cardSequenceService, { CardPosition } from '../../../src/services/cardSequenceService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.44; // Adjusted to 44% to fit two columns with larger circles
const CARD_MARGIN = 8;

interface Stat {
  id: string;
  icon: any;
  title: string;
  current?: number;
  target?: number;
  unit?: string;
}

const HealthTrackerDashboard = () => {
  console.log('🏠 HomePage: Component loaded');
  const router = useRouter();
  const [currentDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [goals] = useState({
    calories: { current: 1450, target: 1550 },
    water: { current: 6, target: 8 },
    steps: { current: 8240, target: 10000 },
    sleep: { current: 7.5, target: 8 },
    bloodPressure: { current: 120, target: 120 },
    heartRate: { current: 72, target: 80 },
    temperature: { current: 98.6, target: 98.6 },
    respiratoryRate: { current: 16, target: 18 },
    bloodOxygen: { current: 98, target: 100 },
    bloodSugar: { current: 110, target: 140 },
    bodyFat: { current: 20, target: 18 },
  });

  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<string | null>(null);
  const [statOrder, setStatOrder] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default stat configuration
  const defaultStats: Stat[] = [
    { id: 'medicineTracking', icon: require('../../../assets/icons/medicine.png'), title: 'Medicine' },
    { id: 'calories', icon: require('../../../assets/icons/calories.png'), title: 'Food', current: goals.calories.current, target: goals.calories.target, unit: ' cal' },
    { id: 'water', icon: require('../../../assets/icons/water.png'), title: 'Water', current: goals.water.current, target: goals.water.target, unit: ' glasses' },
    { id: 'steps', icon: require('../../../assets/icons/steps.png'), title: 'Steps', current: goals.steps.current, target: goals.steps.target },
    { id: 'sleep', icon: require('../../../assets/icons/sleep.png'), title: 'Sleep', current: goals.sleep.current, target: goals.sleep.target, unit: 'h' },
    { id: 'bloodPressure', icon: require('../../../assets/icons/blood-pressure.png'), title: 'Blood Pressure', current: goals.bloodPressure.current, target: goals.bloodPressure.target, unit: ' mmHg' },
    { id: 'heartRate', icon: require('../../../assets/icons/heart.png'), title: 'Heart Rate', current: goals.heartRate.current, target: goals.heartRate.target, unit: ' bpm' },
    { id: 'temperature', icon: require('../../../assets/icons/temperature.png'), title: 'Temp', current: goals.temperature.current, target: goals.temperature.target, unit: '°F' },
    { id: 'breathRetention', icon: require('../../../assets/icons/breath.png'), title: 'Breath Retention', current: goals.respiratoryRate.current, target: goals.respiratoryRate.target, unit: 's' },
    { id: 'bloodOxygen', icon: require('../../../assets/icons/oxygen.png'), title: 'Blood Oxygen', current: goals.bloodOxygen.current, target: goals.bloodOxygen.target, unit: '%' },
    { id: 'cardio', icon: require('../../../assets/icons/exercise.png'), title: 'Exercise', current: goals.bloodOxygen.current, target: goals.bloodOxygen.target, unit: '%' },
    { id: 'bloodSugar', icon: require('../../../assets/icons/blood-sugar.png'), title: 'Blood Sugar', current: goals.bloodSugar.current, target: goals.bloodSugar.target, unit: ' mg/dL' },
    { id: 'bodyFat', icon: require('../../../assets/icons/body-fat.png'), title: 'Body Fat', current: goals.bodyFat.current, target: goals.bodyFat.target, unit: '%' },
    { id: 'stressAssessment', icon: require('../../../assets/icons/child.png'), title: 'Happiness' },
  ];

  const positions: { [key: string]: { translateX: Animated.SharedValue<number>; translateY: Animated.SharedValue<number>; zIndex: Animated.SharedValue<number> } } = {
    medicineTracking: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    calories: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    water: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    steps: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    sleep: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    bloodPressure: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    heartRate: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    temperature: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    breathRetention: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    bloodOxygen: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    cardio: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    bloodSugar: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    bodyFat: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
    stressAssessment: { translateX: useSharedValue(0), translateY: useSharedValue(0), zIndex: useSharedValue(0) },
  };

  const scrollViewRef = useRef<ScrollView>(null);

  // Function to load card sequence from backend
  const loadCardSequence = async () => {
    try {
      const response = await cardSequenceService.getUserCardSequence();
      if (response.success && response.cardSequence) {
        // Map backend card names to frontend IDs
        const cardNameToId: { [key: string]: string } = {
          'medicine_tracking': 'medicineTracking',
          'calories': 'calories',
          'water': 'water',
          'steps': 'steps',
          'sleep': 'sleep',
          'blood_pressure': 'bloodPressure',
          'heart_rate': 'heartRate',
          'temperature': 'temperature',
          'breath_retention': 'breathRetention',
          'blood_oxygen': 'bloodOxygen',
          'cardio': 'cardio',
          'blood_sugar': 'bloodSugar',
          'body_fat': 'bodyFat',
          'happiness_score': 'stressAssessment'
        };

        // Create ordered stats based on backend sequence
        const orderedStats: Stat[] = [];
        response.cardSequence.forEach((card: any) => {
          const statId = cardNameToId[card.card_name];
          const stat = defaultStats.find(s => s.id === statId);
          if (stat) {
            orderedStats.push(stat);
          }
        });

        // Add any missing stats at the end
        defaultStats.forEach(stat => {
          if (!orderedStats.find(s => s.id === stat.id)) {
            orderedStats.push(stat);
          }
        });

        setStatOrder(orderedStats);
      } else {
        // Fallback to default order if API fails
        setStatOrder(defaultStats);
      }
    } catch (error) {
      console.error('Error loading card sequence:', error);
      // Fallback to default order
      setStatOrder(defaultStats);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save card sequence to backend
  const saveCardSequence = async (newOrder: Stat[]) => {
    try {
      console.log('🔄 Saving card sequence...', newOrder.map(s => s.id));
      
      // Map frontend IDs to backend card names
      const idToCardName: { [key: string]: string } = {
        'medicineTracking': 'medicine_tracking',
        'calories': 'calories',
        'water': 'water',
        'steps': 'steps',
        'sleep': 'sleep',
        'bloodPressure': 'blood_pressure',
        'heartRate': 'heart_rate',
        'temperature': 'temperature',
        'breathRetention': 'breath_retention',
        'bloodOxygen': 'blood_oxygen',
        'cardio': 'cardio',
        'bloodSugar': 'blood_sugar',
        'bodyFat': 'body_fat',
        'stressAssessment': 'happiness_score'
      };

      const cardSequence: CardPosition[] = newOrder.map((stat, index) => ({
        card_name: idToCardName[stat.id],
        position_number: index + 1
      }));

      console.log('📤 Sending card sequence to backend:', cardSequence);
      const response = await cardSequenceService.updateCardPositions(cardSequence);
      console.log('✅ Card sequence saved successfully:', response);
      
      // Reload the card sequence to verify it was saved
      setTimeout(() => {
        console.log('🔄 Reloading card sequence to verify save...');
        loadCardSequence();
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving card sequence:', error);
    }
  };

  // Function to fetch user form data including gender
  const fetchUserFormData = async (token: string) => {
    try {
      console.log('🚀 Fetching user form data...');
      const response = await fetch(`${BASE_URL}/api/user-form/user-form`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 User form data:', data);
        if (data.data && data.data.gender) {
          console.log('✅ Setting user gender:', data.data.gender);
          setUserGender(data.data.gender.toLowerCase());
        }
      } else {
        console.log('⚠️ No user form data found or error:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching user form data:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🔍 Token from AsyncStorage:', token ? 'Token exists' : 'No token found');
        if (!token) {
          const storedName = await AsyncStorage.getItem('userFullName');
          if (storedName) {
            console.log('✅ Setting user name from AsyncStorage (no token):', storedName);
            setUserName(storedName);
          }
          return;
        }
        console.log('🚀 Making API call to profile endpoint...');
        const response = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        const data = await response.json();
        console.log('📦 Response data:', data);
        if (data.user && data.user.name) {
          console.log('✅ Setting user name from API:', data.user.name);
          setUserName(data.user.name);
        } else {
          const storedName = await AsyncStorage.getItem('userFullName');
          if (storedName) {
            console.log('✅ Setting user name from AsyncStorage:', storedName);
            setUserName(storedName);
          }
        }
        
        // Fetch user form data to get gender
        await fetchUserFormData(token);
      } catch (err: any) {
        console.error('❌ Failed to fetch user profile:', err);
        console.error('❌ Error details:', {
          message: err?.message || 'Unknown error',
          stack: err?.stack || 'No stack trace',
        });
      }
    };
    
    fetchUserProfile();
    loadCardSequence();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    return '#11B5CF';
  };

  const handleItemSelect = (itemId: string) => {
    if (itemId === 'calories') {
      router.push('/navigation/tabs/foodList');
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
    if (itemId === 'breathRetention') {
      router.push('/record/Hold');
      return;
    }
    if (itemId === 'bloodOxygen') {
      router.push('/record/bloodoxygentracker');
      return;
    }
    if (itemId === 'stressAssessment') {
      router.push('/record/Happiness');
      return;
    }
    if (itemId === 'cardio') {
      router.push('/record/WorkoutHome');
      return;
    }
    if (itemId === 'bloodSugar') {
      router.push('/record/AddSugarReading');
      return;
    }
    if (itemId === 'bodyFat') {
      router.push('/record/BodyFatScreen');
      return;
    }
    if (itemId === 'medicineTracking') {
      router.push('../../health/medicine');
      return;
    }

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
            style={{ width: `${percentage}%`, backgroundColor: color }}
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

  const DraggableStatCard = ({ stat, index }: { stat: Stat; index: number }) => {
    if (!positions[stat.id]) {
      console.warn(`Position not found for stat: ${stat.id}`);
      return null;
    }

    const translateX = positions[stat.id].translateX;
    const translateY = positions[stat.id].translateY;
    const zIndex = positions[stat.id].zIndex;
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
    const panRef = useRef(null);

    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
      if (!isDraggingEnabled) return;

      const { translationX, translationY } = event.nativeEvent;
      translateX.value = translationX;
      translateY.value = translationY;
      zIndex.value = 100;
    };

    const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
      if (event.nativeEvent.state === State.ACTIVE && isDraggingEnabled) {
        // Disable scrolling when dragging is active
        scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
      }
      if (event.nativeEvent.state === State.END && isDraggingEnabled) {
        const { translationX, translationY } = event.nativeEvent;
        const cardX = (index % 2) * (CARD_WIDTH + CARD_MARGIN);
        const cardY = Math.floor(index / 2) * (CARD_WIDTH + CARD_MARGIN);
        const newX = cardX + translationX;
        const newY = cardY + translationY;

        let closestIndex = index;
        let minDistance = Infinity;

        if (statOrder && statOrder.length > 0) {
          statOrder.forEach((_, i) => {
            if (i !== index) {
              const otherX = (i % 2) * (CARD_WIDTH + CARD_MARGIN);
              const otherY = Math.floor(i / 2) * (CARD_WIDTH + CARD_MARGIN);
              const distance = Math.sqrt(
                Math.pow(newX - otherX, 2) + Math.pow(newY - otherY, 2)
              );
              console.log(`📏 Distance from ${index} to ${i}: ${distance.toFixed(2)}`);
              if (distance < minDistance && distance < CARD_WIDTH) { // Increased threshold
                minDistance = distance;
                closestIndex = i;
              }
            }
          });
        }

        if (closestIndex !== index && statOrder && statOrder.length > 0) {
          console.log(`🔄 Swapping cards: index ${index} with ${closestIndex}`);
          runOnJS(setStatOrder)((prev) => {
            if (!prev || prev.length === 0) return prev;
            const newOrder = [...prev];
            [newOrder[index], newOrder[closestIndex]] = [newOrder[closestIndex], newOrder[index]];
            console.log('📝 New order after swap:', newOrder.map(s => s.id));
            // Save the new order to backend
            runOnJS(saveCardSequence)(newOrder);
            return newOrder;
          });
        } else {
          console.log('❌ No swap detected or invalid conditions');
        }

        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        zIndex.value = 0;
        setIsDraggingEnabled(false);
        // Re-enable scrolling when dragging ends
        runOnJS(() => scrollViewRef.current?.setNativeProps({ scrollEnabled: true }))();
      }
    };

    const handleLongPress = () => {
      console.log('🎯 Long press detected for card:', stat.id);
      setIsDraggingEnabled(true);
    };

    const handlePressIn = () => {
      const timer = setTimeout(() => {
        handleLongPress();
      }, 800); // Reduced to 800ms for easier testing
      setLongPressTimer(timer);
    };

    const handlePressOut = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      // Only trigger navigation if dragging was not enabled
      if (!isDraggingEnabled) {
        handleItemSelect(stat.id);
      }
    };

    useEffect(() => {
      return () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
        }
      };
    }, [longPressTimer]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      zIndex: zIndex.value,
    }));

    const isSelected = selectedItems.has(stat.id);
    const progress = stat.current && stat.target ? calculateProgress(stat.current, stat.target) : 0;
    const color = getProgressColor(progress);

    return (
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={scrollViewRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={isDraggingEnabled}
      >
        <View className="w-[48%] mb-2" style={{ marginBottom: CARD_MARGIN }}>
          {isDraggingEnabled && (
            <LinearGradient
              colors={['rgba(17, 181, 207, 0.8)', 'rgba(17, 181, 207, 0)']}
              style={{
                position: 'absolute',
                width: CARD_WIDTH + 20,
                height: CARD_WIDTH + 20,
                borderRadius: (CARD_WIDTH + 20) / 2,
                top: -10,
                left: -10,
                shadowColor: '#11B5CF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 10,
              }}
            />
          )}
          <Animated.View
            style={[
              animatedStyle,
              {
                width: '100%',
                aspectRatio: 1,
                borderColor: isSelected ? '#11B5CF' : 'transparent',
                backgroundColor: isDraggingEnabled ? '#f0f9ff' : 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDraggingEnabled ? 0.3 : 0.1,
                shadowRadius: isDraggingEnabled ? 12 : 8,
                elevation: isDraggingEnabled ? 8 : 4,
              }
            ]}
            className={`rounded-full p-10 shadow-lg border-2 ${
              isSelected ? 'border-transparent bg-green-50' : 'border-transparent'
            }`}
          >
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className="flex-1 justify-center items-center"
              activeOpacity={0.7}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-3"
                style={{
                  backgroundColor: 'transparent',
                }}
              >
                {(stat.id === 'calories' || stat.id === 'medicineTracking' || stat.id === 'water' || stat.id === 'steps' || stat.id === 'sleep' || stat.id === 'bloodPressure' || stat.id === 'heartRate' || stat.id === 'temperature' || stat.id === 'breathRetention' || stat.id === 'bloodOxygen' || stat.id === 'cardio' || stat.id === 'bloodSugar' || stat.id === 'bodyFat' || stat.id === 'stressAssessment') ? (
                  <Image 
                    source={stat.icon} 
                    style={{ 
                      width: 50, 
                      height: 50,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <stat.icon size={50} color="#11B5CF" />
                )}
              </View>
              <Text className="text-sm font-semibold text-gray-700 text-center mb-1">
                {stat.title}
              </Text>
              {isDraggingEnabled && (
                <Text className="text-xs text-blue-600 font-medium text-center mb-1">
                  🎯 Drag to reorder
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </PanGestureHandler>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={[
          '#11B5CF',
          '#0EA5BF',
          '#0B95AF',
          '#08859F',
          '#05758F',
          '#02657F',
          '#01556F',
          '#00455F',
          '#00354F',
          '#00253F',
        ]}
        style={{ flex: 1 }}
      >
        <NativeViewGestureHandler ref={scrollViewRef}>
          <ScrollView className="flex-1" scrollEnabled={true}>
            <View className="flex-1 max-w-[1200px] self-center w-full" style={{ borderRadius: 24, overflow: 'hidden' }}>
              {/* Header */}
              <View className="">
                <View className="px-6 py-5 mt-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => router.push('/health/profile')}
                        className="w-16 h-16 rounded-full items-center justify-center mr-4 shadow-lg"
                        style={{
                          backgroundColor: 'white',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 6,
                        }}
                        activeOpacity={0.7}
                      >
                        {userGender === 'female' ? (
                          <Image 
                            source={require('../../../assets/icons/woman.png')}
                            style={{ 
                              width: 50, 
                              height: 50,
                              borderRadius: 25
                            }}
                            resizeMode="cover"
                          />
                        ) : userGender === 'male' ? (
                          <Image 
                            source={require('../../../assets/icons/boy.png')}
                            style={{ 
                              width: 50, 
                              height: 50,
                              borderRadius: 25
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <User size={40} color="#11B5CF" />
                        )}
                      </TouchableOpacity>
                      <View>
                        <Text className="text-xl font-bold text-gray-800">
                          {getGreeting()}, {userName ? userName : 'User'}!
                        </Text>
                        <Text className="text-gray-600 font-medium mb-2">{formatDate(currentDate)}</Text>
                      </View>

                    </View>
                  </View>
                </View>
              </View>

              {/* Main Content */}
              <View className="px-6 pb-6">
                {/* Health Metrics Grid */}
                <View className="flex-row flex-wrap justify-between">
                  {isLoading ? (
                    <View className="w-full items-center py-8">
                      <Text className="text-gray-700 text-center text-lg">Loading your health cards...</Text>
                    </View>
                  ) : statOrder && statOrder.length > 0 ? (
                    statOrder.map((stat, index) => (
                      <DraggableStatCard key={stat.id} stat={stat} index={index} />
                    ))
                  ) : (
                    <Text className="text-gray-700 text-center">No cards available</Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </NativeViewGestureHandler>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HealthTrackerDashboard;