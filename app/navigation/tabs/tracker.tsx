import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const StepCounter = () => {
  const insets = useSafeAreaInsets();
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [stepData, setStepData] = useState<{ [key: number]: { steps: number; miles: number; minutes: number; calories: number; floors: number } }>({
    0: { steps: 4200, miles: 2.1, minutes: 63, calories: 254, floors: 1 }, // Sunday
    1: { steps: 6800, miles: 3.4, minutes: 102, calories: 408, floors: 3 }, // Monday
    2: { steps: 7200, miles: 3.6, minutes: 108, calories: 432, floors: 2 }, // Tuesday
    3: { steps: 5700, miles: 2.7, minutes: 81, calories: 321, floors: 2 }, // Wednesday (today)
    4: { steps: 8100, miles: 4.1, minutes: 122, calories: 486, floors: 4 }, // Thursday
    5: { steps: 3200, miles: 1.6, minutes: 48, calories: 192, floors: 1 }, // Friday
    6: { steps: 2800, miles: 1.4, minutes: 42, calories: 168, floors: 1 }, // Saturday
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentData = stepData[currentDay];
  const goalSteps = 10000;
  const progressPercentage = Math.min((currentData.steps / goalSteps) * 100, 100);

  // Circle parameters
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDay((prev) => (prev === 0 ? 6 : prev - 1));
    } else {
      setCurrentDay((prev) => (prev === 6 ? 0 : prev + 1));
    }
  };

  const getCompletionLevel = (dayIndex: number) => {
    const steps = stepData[dayIndex].steps;
    const percentage = (steps / goalSteps) * 100;
    
    if (percentage >= 100) return 'complete';
    if (percentage >= 75) return 'high';
    if (percentage >= 50) return 'medium';
    if (percentage >= 25) return 'low';
    return 'minimal';
  };

  const getDayCircleColors = (dayIndex: number): string[] | null => {
    // Unique gradients for each day
    const gradients = [
      ['#dffd6e', '#14b8a6'],    // Sunday
      ['#fbbf24', '#f59e42'],    // Monday
      ['#f472b6', '#a78bfa'],    // Tuesday
      ['#60a5fa', '#2563eb'],    // Wednesday
      ['#f87171', '#fbbf24'],    // Thursday
      ['#34d399', '#10b981'],    // Friday
      ['#a3e635', '#f472b6'],    // Saturday
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
        {/* Background circle */}
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#FFFF"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
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
      {/* Center text */}
      <View className="items-center justify-center">
        <Text className="text-[40px] font-bold text-black mb-1">
          {currentData.steps.toLocaleString()}
        </Text>
        <Text className="text-xs text-gray-400 tracking-wider">
          STEPS
        </Text>
      </View>
    </View>
  );

  interface DayCircleProps {
    dayIndex: number;
    dayName: string;
  }

  const DayCircle = ({ dayIndex, dayName }: DayCircleProps) => {
    let colors = getDayCircleColors(dayIndex);
    const isSelected = dayIndex === currentDay;
    const level = getCompletionLevel(dayIndex);
    // Ensure colors is always a tuple of at least two strings for LinearGradient
    if (!colors) {
      colors = ['#6b7280', '#6b7280'];
    } else if (colors.length === 1) {
      colors = [colors[0], colors[0]];
    }
    return (
      <TouchableOpacity
        onPress={() => setCurrentDay(dayIndex)}
        className="items-center mx-1"
      >
        <View className={`w-8 h-8 rounded-full items-center justify-center ${isSelected ? 'border-2 border-white' : ''}`}> 
          {colors ? (
            <LinearGradient
              colors={colors as [string, string]}
              style={{
                width: isSelected ? 28 : 32,
                height: isSelected ? 28 : 32,
                borderRadius: isSelected ? 14 : 16
              }}
            />
          ) : (
            <View className="w-8 h-8 rounded-full border-2 border-gray-400" />
          )}
        </View>
        <Text className="text-[10px] text-gray-400 mt-2">{dayName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#D1FAE5', '#86EFAC', '#4ADE80', '#22C55E']}
      style={{
        flex: 1,
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        alignItems: 'center'
      }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          paddingBottom: 20
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between w-full max-w-[300px] mb-10">
          <TouchableOpacity onPress={() => navigateDay('prev')} className="p-2">
            <Ionicons name="chevron-back" size={24} color="teal" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-black">Today</Text>
          <TouchableOpacity onPress={() => navigateDay('next')} className="p-2">
            <Ionicons name="chevron-forward" size={24} color="teal" />
          </TouchableOpacity>
        </View>
        {/* Progress Circle */}
        <ProgressCircle />
        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-around w-full max-w-[300px] mt-10 mb-10">
          <View className="items-center w-[45%] mb-5">
            <FontAwesome name="map-marker" size={24} color="#14b8a6" style={{ marginBottom: 8 }} />
            <Text className="text-2xl font-bold text-black">{currentData.miles}</Text>
            <Text className="text-xs text-[#14b8a6]">MILES</Text>
          </View>
          <View className="items-center w-[45%] mb-5">
            <FontAwesome name="fire" size={24} color="#14b8a6" style={{ marginBottom: 8 }} />
            <Text className="text-2xl font-bold text-black">{currentData.calories}</Text>
            <Text className="text-xs text-[#14b8a6]">KCAL</Text>
          </View>
          <View className="items-center w-[45%]">
            <MaterialIcons name="timer" size={24} color="#14b8a6" style={{ marginBottom: 8 }} />
            <Text className="text-2xl font-bold text-black">{currentData.minutes}</Text>
            <Text className="text-xs text-[#14b8a6]">MIN</Text>
          </View>
          <View className="items-center w-[45%]">
            <MaterialIcons name="stairs" size={24} color="#14b8a6" style={{ marginBottom: 8 }} />
            <Text className="text-2xl font-bold text-black">{currentData.floors}</Text>
            <Text className="text-xs text-[#14b8a6]">FLOORS</Text>
          </View>
        </View>
        {/* Weekly Progress */}
        <View className="flex-row justify-center items-center mb-8">
          {dayNames.map((day, index) => (
            <DayCircle key={day} dayIndex={index} dayName={day} />
          ))}
        </View>
        {/* Progress Bar */}
        <View className="items-center w-full max-w-[300px]">
          <Text className="text-xs text-gray-400 mb-2">
            {progressPercentage.toFixed(1)}% of daily goal
          </Text>
          <View className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <LinearGradient
              colors={['#14b8a6', '#0cb6ab', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: '100%', width: `${progressPercentage}%` }}
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default StepCounter;