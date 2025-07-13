import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const motivationalMessages = [
  'Sip sip hooray! ',
  'Water you waiting for? Drink up! ',
  'Your body loves water as much as your phone loves charging ',
  'Stay hydrated, stay glowing ',
  'Hydration station loading… ',
  'You\'re 70% water. Refill your inner ocean ',
  'Drinking water = self-love ',
  'Drop by drop, you\'re getting closer! ',
  'H2-YES! Keep going! ',
  'Every sip counts! ',
];

const timeBasedMessages: Record<string, string[]> = {
  morning: ['Good morning! Start your day with a glass of water! ', 'Rise and hydrate! '],
  afternoon: ['Afternoon boost! Time for some water! ', 'Keep the energy flowing with H2O! '],
  evening: ['Evening hydration check! ', 'Wind down with some water! '],
  night: ['Last call for hydration! ', 'Night cap of water? '],
};

const cupSizes: { size: number; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { size: 150, icon: 'cup-water', label: 'Small Glass' },
  { size: 250, icon: 'cup', label: 'Regular Glass' },
  { size: 350, icon: 'glass-cocktail', label: 'Large Glass' },
  { size: 500, icon: 'bottle-soda', label: 'Bottle' },
  { size: 750, icon: 'bottle-tonic', label: 'Large Bottle' },
];

const achievements: Achievement[] = [
  { threshold: 0.25, icon: 'leaf', message: 'Getting started!' },
  { threshold: 0.5, icon: 'arm-flex', message: 'Halfway hero!' },
  { threshold: 0.75, icon: 'fire', message: 'On fire!' },
  { threshold: 1.0, icon: 'trophy', message: 'Goal achieved!' },
  { threshold: 1.25, icon: 'star', message: 'Overachiever!' },
];

interface Achievement {
  threshold: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  message: string;
}

const Water = () => {
  const [weight, setWeight] = useState(60);
  const [waterDrank, setWaterDrank] = useState(0);
  const [message, setMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [lastDrinkTime, setLastDrinkTime] = useState<Date | null>(null);
  const [todayDate, setTodayDate] = useState(new Date().toDateString());
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const waterGoal = weight * 35;
  const glasses = Math.ceil(waterGoal / 250);
  const progress = Math.min(waterDrank / waterGoal, 1);

  // Check if it's a new day and reset if needed
  useEffect(() => {
    const checkNewDay = async () => {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('lastActiveDate');
      const savedWaterIntake = await AsyncStorage.getItem('waterIntake');
      const savedStreak = await AsyncStorage.getItem('streak');
      const savedWeight = await AsyncStorage.getItem('weight');

      if (savedWeight) {
        setWeight(parseInt(savedWeight));
      }

      if (savedDate !== today) {
        // New day - reset water intake but maintain streak if goal was met
        const yesterdayIntake = savedWaterIntake ? parseInt(savedWaterIntake) : 0;
        const yesterdayGoal = (savedWeight ? parseInt(savedWeight) : 60) * 35;
        
        if (yesterdayIntake >= yesterdayGoal) {
          setStreak(prev => prev + 1);
          await AsyncStorage.setItem('streak', (streak + 1).toString());
        } else if (savedDate) {
          // Reset streak if goal wasn't met (but not on first launch)
          setStreak(0);
          await AsyncStorage.setItem('streak', '0');
        }

        setWaterDrank(0);
        setTodayDate(today);
        await AsyncStorage.setItem('lastActiveDate', today);
        await AsyncStorage.setItem('waterIntake', '0');
      } else if (savedWaterIntake) {
        setWaterDrank(parseInt(savedWaterIntake));
        if (savedStreak) {
          setStreak(parseInt(savedStreak));
        }
      }
    };

    checkNewDay();
  }, []);

  // Update motivational message based on time and progress
  useEffect(() => {
    const updateMessage = () => {
      const hour = new Date().getHours();
      let timeOfDay: string;
      
      if (hour < 12) timeOfDay = 'morning';
      else if (hour < 17) timeOfDay = 'afternoon';
      else if (hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      const timeMessages = timeBasedMessages[timeOfDay];
      const allMessages = [...motivationalMessages, ...timeMessages];
      
      if (progress >= 1) {
        const celebrationMessages = [
          'Goal crushed! You\'re a hydration champion! ',
          'Mission accomplished! Your body thanks you! ',
          'Perfect hydration achieved! ',
        ];
        const randomIndex = Math.floor(Math.random() * celebrationMessages.length);
        setMessage(celebrationMessages[randomIndex]);
      } else {
        const randomIndex = Math.floor(Math.random() * allMessages.length);
        setMessage(allMessages[randomIndex]);
      }
    };

    updateMessage();
    const interval = setInterval(updateMessage, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [progress]);

  // Check for achievements
  useEffect(() => {
    const checkAchievements = () => {
      const currentProgress = waterDrank / waterGoal;
      
      for (let i = achievements.length - 1; i >= 0; i--) {
        const achievement = achievements[i];
        if (currentProgress >= achievement.threshold && 
            (!currentAchievement || currentAchievement.threshold < achievement.threshold)) {
          setCurrentAchievement(achievement);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          break;
        }
      }
    };

    checkAchievements();
  }, [waterDrank, waterGoal, currentAchievement]);

  const handleAddWater = async (amount: number) => {
    const newAmount = Math.min(waterDrank + amount, waterGoal * 1.5); // Allow 150% of goal
    setWaterDrank(newAmount);
    setLastDrinkTime(new Date());
    
    // Save to storage
    await AsyncStorage.setItem('waterIntake', newAmount.toString());
    await AsyncStorage.setItem('weight', weight.toString());
    
    // Show quick feedback
    if (newAmount >= waterGoal && waterDrank < waterGoal) {
      Alert.alert(' Congratulations!', 'You\'ve reached your daily hydration goal!');
    }
  };

  // Add restart handler
  const handleRestartDay = async () => {
    setWaterDrank(0);
    setLastDrinkTime(null);
    await AsyncStorage.setItem('waterIntake', '0');
    await AsyncStorage.removeItem('lastDrinkTime');
  };

  const getHydrationStatus = (): { icon: keyof typeof MaterialCommunityIcons.glyphMap; status: string; color: string } => {
    if (progress >= 1) return { icon: 'trophy', status: 'Excellent!', color: '#0cb6ab' };
    if (progress >= 0.75) return { icon: 'fire', status: 'Great!', color: '#0cb6ab' };
    if (progress >= 0.5) return { icon: 'arm-flex', status: 'Good!', color: '#0cb6ab' };
    if (progress >= 0.25) return { icon: 'leaf', status: 'Getting there!', color: '#0cb6ab' };
    return { icon: 'sleep', status: 'Need water!', color: '#0cb6ab' };
  };

  const getTimeUntilNextReminder = () => {
    if (!lastDrinkTime) return 'Drink your first glass!';
    
    const timeSinceLastDrink = (new Date().getTime() - lastDrinkTime.getTime()) / (1000 * 60); // minutes
    const nextReminderIn = Math.max(0, 120 - timeSinceLastDrink); // 2 hours = 120 minutes
    
    if (nextReminderIn === 0) {
      return 'Time for water! ';
    } else {
      const hours = Math.floor(nextReminderIn / 60);
      const minutes = Math.floor(nextReminderIn % 60);
      return `Next reminder in ${hours}h ${minutes}m`;
    }
  };

  const hydrationStatus = getHydrationStatus();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header with streak */}
        <View className="items-center mt-8">
          <Text className="text-3xl font-serif text-center font-bold text-black mb-2 mt-1">
             AquaTracker
          </Text>
          {streak > 0 && (
            <View className="bg-yellow-100 px-4 py-2 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="fire" size={20} color="#f59e0b" style={{ marginRight: 4 }} />
              <Text className="text-yellow-800 font-semibold">
                {streak} day streak!
              </Text>
            </View>
          )}
        </View>

        {/* Motivational Message - moved to top */}
        <View className=" rounded-2xl  mt-1">
          <Text className="text-base text-sm text-gray-500 italic text-center">
            {message}
          </Text>
        </View>

       

        {/* Water Goal */}
        <View className=" shadow-sm">
         
          
        </View>

        {/* Achievement Celebration */}
        {showCelebration && currentAchievement && (
          <View className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mt-4 items-center">
            <MaterialCommunityIcons name={currentAchievement.icon} size={36} color="#f59e0b" />
            <Text className="text-lg font-semibold text-yellow-800 text-center mt-2">
              {currentAchievement.message}
            </Text>
          </View>
        )}
  
        {/* Current Status */}
        <View className="bg-white rounded-3xl p-4 mt-4 shadow-sm">
          <View className="flex-row items-center justify-center mb-4">
            <MaterialCommunityIcons name={hydrationStatus.icon} size={32} color={hydrationStatus.color} style={{ marginRight: 8 }} />
            <Text className="text-xl font-semibold" style={{ color: hydrationStatus.color }}>
              {hydrationStatus.status}
            </Text>
          </View>
          
          <View className="items-center">
            <Text className="text-lg font-semibold text-gray-700 mb-2">
              Progress: {waterDrank} ml / {waterGoal} ml
            </Text>
            <Progress.Bar
              progress={progress}
              width={width - 80}
              height={25}
              color={hydrationStatus.color}
              unfilledColor="#e5e7eb"
              borderWidth={0}
              borderRadius={12}
            />
            <Text className="text-sm text-gray-600 mt-2">
              {Math.floor(waterDrank / 250)} of {glasses} glasses ({Math.round(progress * 100)}%)
            </Text>
             <Text className="text-md text-gray-700 mt-6 text-center">
             Daily Goal: <Text className="font-semibold text-[#0cb6ab]">{waterGoal} ml</Text>
          </Text>
          <Text className="text-base text-xs text-black text-center mt-1">
            That's about {glasses} glasses of water
          </Text>
          </View>
        </View>

        {/* Cup Size Options */}
   
          <Text className="text-lg font-semibold text-black mt-4 mb-1 text-center">
             Add Water Intake
          </Text>
          <View className="flex-row flex-wrap justify-center">
            {cupSizes.map((cup) => (
              <TouchableOpacity
                key={cup.size}
                onPress={() => handleAddWater(cup.size)}
                className=" border-2 border-[#0cb6ab] rounded-xl p-3 m-1 items-center"
                style={{ width: (width - 80) / 3 - 8 }}
              >
                <MaterialCommunityIcons name={cup.icon} size={28} color="#0cb6ab" style={{ marginBottom: 4 }} />
                <Text className="text-xs font-semibold text-[#0cb6ab]">{cup.size}ml</Text>
           
              </TouchableOpacity>
            ))}
          </View>
       

        {/* Smart Reminders */}
        
          <Text className="text-lg  text-white mt-6 mb-2 text-center">
             Smart Reminders
          </Text>
          <Text className="text-base text-gray-600 text-center">
            {getTimeUntilNextReminder()}
          </Text>
          {lastDrinkTime && (
            <Text className="text-sm text-gray-500 text-center mt-2">
              Last drink: {lastDrinkTime.toLocaleTimeString()}
            </Text>
          )}
     

        {/* Quick Stats */}
        
          <Text className="text-lg font-semibold text-gray-700 mb-3 text-center mt-8">
            <MaterialCommunityIcons name="chart-bar" size={20} color="#0cb6ab" /> Today's Stats
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <MaterialCommunityIcons name="cup" size={29} color="#FFFF" />
              <Text className="text-lg font-semibold text-black">
                {Math.floor(waterDrank / 250)}
              </Text>
              <Text className="text-sm text-gray-600">Glasses</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons name="target" size={29} color="#FFFF" />
              <Text className="text-lg font-semibold text-black">
                {Math.round(progress * 100)}%
              </Text>
              <Text className="text-sm text-gray-600">Complete</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons name="fire" size={29} color="#FFFF" />
              <Text className="text-lg font-semibold text-black">
                {streak}
              </Text>
              <Text className="text-sm text-gray-600">Day Streak</Text>
            </View>
          </View>
     

        {/* Restart Day Button */}
        <TouchableOpacity
          onPress={handleRestartDay}
          className="flex-row items-center justify-center bg-red-100 border-2 border-red-300 rounded-xl p-3 mb-8 mt-9"
          style={{ alignSelf: 'center', width: width - 80 }}
        >
          <MaterialCommunityIcons name="refresh" size={22} color="#dc2626" style={{ marginRight: 8 }} />
          <Text className="text-base font-semibold text-red-700">Restart Day</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default Water;