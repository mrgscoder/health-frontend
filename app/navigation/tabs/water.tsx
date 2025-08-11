import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Dimensions, Image, Switch } from 'react-native';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from "../../../src/config";

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
  const [userId, setUserId] = useState<number | null>(null); // Will be set from token
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const waterGoal = weight * 35;
  const glasses = Math.ceil(waterGoal / 250);
  const progress = Math.min(waterDrank / waterGoal, 1);

  // Using default user ID for now

  // Clear old AsyncStorage data when user logs in for the first time
  useEffect(() => {
    const clearOldData = async () => {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      const hasClearedData = await AsyncStorage.getItem('hasClearedWaterData');
      
      if (token && !hasClearedData) {
        // User is logged in but we haven't cleared old data yet
        console.log('Clearing old AsyncStorage water data for first-time login');
        await AsyncStorage.removeItem('waterIntake');
        await AsyncStorage.removeItem('lastActiveDate');
        await AsyncStorage.removeItem('streak');
        await AsyncStorage.setItem('hasClearedWaterData', 'true');
      }
    };

    clearOldData();
  }, []);

  // Check if it's a new day and reset if needed
  useEffect(() => {
    const checkNewDay = async () => {
      const today = new Date().toDateString();
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      // If user is logged in, try to load data from database first
      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/api/water/today`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Loaded water intake from database:', data);
            
            // Set water intake from database
            setWaterDrank(data.total_intake || 0);
            
            // Clear old AsyncStorage data to prevent conflicts
            await AsyncStorage.removeItem('waterIntake');
            await AsyncStorage.removeItem('lastActiveDate');
            
            // Set today's date
            setTodayDate(today);
            await AsyncStorage.setItem('lastActiveDate', today);
            
            // Load weight from AsyncStorage or use default
            const savedWeight = await AsyncStorage.getItem('weight');
            if (savedWeight) {
              setWeight(parseInt(savedWeight));
            }
            
            return; // Exit early since we loaded from database
          } else {
            console.error('Failed to load water intake from database:', response.status);
          }
        } catch (error) {
          console.error('Error loading water intake from database:', error);
        }
      }
      
      // Fallback to AsyncStorage logic for non-logged in users or when database fails
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

  // Load reminder settings on component mount
  useEffect(() => {
    const loadReminderSettings = async () => {
      try {
        // First try to load from database
        const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
        if (token) {
          try {
                    // Get user's reminder preferences from database
        const response = await fetch(`${BASE_URL}/api/water/get-reminder-preferences`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.reminder_enabled !== undefined) {
                setRemindersEnabled(data.reminder_enabled);
                await AsyncStorage.setItem('remindersEnabled', JSON.stringify(data.reminder_enabled));
                return;
              }
            }
          } catch (error) {
            console.error('Error loading reminder preferences from database:', error);
          }
        }
        
        // Fallback to local storage
        const savedRemindersEnabled = await AsyncStorage.getItem('remindersEnabled');
        if (savedRemindersEnabled !== null) {
          setRemindersEnabled(JSON.parse(savedRemindersEnabled));
        }
      } catch (error) {
        console.error('Error loading reminder settings:', error);
      }
    };

    loadReminderSettings();
  }, []);

  // Save reminder settings when changed
  const handleReminderToggle = async (value: boolean) => {
    setRemindersEnabled(value);
    try {
      await AsyncStorage.setItem('remindersEnabled', JSON.stringify(value));
      
      // Call API to update reminder preferences in database
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch(`${BASE_URL}/api/water/update-reminder-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            reminder_enabled: value
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to update reminder preferences:', response.status, errorText);
        } else {
          console.log('Reminder preferences updated successfully');
        }
      } else {
        console.error('No token available for updating reminder preferences');
      }
    } catch (error) {
      console.error('Error saving reminder settings:', error);
    }
  };

  // Call reminders API every 2 minutes when reminders are enabled
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (remindersEnabled) {
      // Call immediately when enabled
      const callRemindersAPI = async () => {
        try {
          const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
          if (token) {
            const response = await fetch(`${BASE_URL}/api/water/send-reminders`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (!response.ok) {
              console.error('Failed to call reminders API:', response.status);
            } else {
              console.log('Reminders API called successfully');
            }
          }
        } catch (error) {
          console.error('Error calling reminders API:', error);
        }
      };

      // Call immediately
      callRemindersAPI();
      
      // Set up interval for every 2 minutes (120000 ms)
      intervalId = setInterval(callRemindersAPI, 120000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [remindersEnabled]);

  const handleAddWater = async (amount: number) => {
    const newAmount = Math.min(waterDrank + amount, waterGoal * 1.5); // Allow 150% of goal
    setWaterDrank(newAmount);
    setLastDrinkTime(new Date());
    
    // Save to storage
    await AsyncStorage.setItem('waterIntake', newAmount.toString());
    await AsyncStorage.setItem('weight', weight.toString());
    
    // Call API to record water intake
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch(`${BASE_URL}/api/water/record-water`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            total_intake: newAmount,
            intake_logs: [{
              amount: amount,
              timestamp: new Date().toISOString(),
              totalIntake: newAmount
            }]
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to record water intake:', response.status, errorText);
        } else {
          console.log('Water intake recorded successfully');
        }
      } else {
        console.error('No token available');
      }
    } catch (error) {
      console.error('Error recording water intake:', error);
      // Continue with local storage even if API fails
    }
    
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
    
    // Also clear database data if user is logged in
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await fetch(`${BASE_URL}/api/water/record-water`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            total_intake: 0,
            intake_logs: []
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to reset water intake in database:', response.status);
        } else {
          console.log('Water intake reset in database successfully');
        }
      }
    } catch (error) {
      console.error('Error resetting water intake in database:', error);
    }
  };

  const getHydrationStatus = (): { icon: keyof typeof MaterialCommunityIcons.glyphMap; status: string; color: string } => {
    if (progress >= 1) return { icon: 'trophy', status: 'Excellent!', color: '#f1ca00' };
    if (progress >= 0.75) return { icon: 'fire', status: 'Great!', color: '#00b8f1' };
    if (progress >= 0.5) return { icon: 'arm-flex', status: 'Good!', color: '#00b8f1' };
    if (progress >= 0.25) return { icon: 'leaf', status: 'Getting there!', color: '#00b8f1' };
    return { icon: 'sleep', status: 'Need water!', color: '#00b8f1' };
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
    <LinearGradient
      colors={['#E0F7FA', '#B2EBF2', '#4DD0E1', '#00ACC1']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView className="flex-1">
        <View className="p-4">
        {/* Header with streak */}
        <View className="items-center mt-4">
          <Text className="text-3xl text-bold text-center text-black mb-2 mt-3">
             AquaTracker
          </Text>
          {streak > 0 && (
            <View className="bg-yellow-100/20 backdrop-blur-sm px-4 py-2 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="fire" size={20} color="#2196F3" style={{ marginRight: 4 }} />
              <Text className="text-black font-semibold">
                {streak} day streak!
              </Text>
            </View>
          )}
        </View>

        {/* Motivational Message - moved to top */}
        <View className="rounded-2xl mt-1">
          <Text className="text-base text-sm text-black/80 italic text-center">
            {message}
          </Text>
        </View>

        {/* Achievement Celebration */}
        {showCelebration && currentAchievement && (
          <View className="bg-yellow-50/20 backdrop-blur-sm border-2 border-yellow-200/30 rounded-2xl p-4 mt-4 items-center">
            <MaterialCommunityIcons name={currentAchievement.icon} size={36} color="#2196F3" />
            <Text className="text-lg font-semibold text-black text-center mt-2">
              {currentAchievement.message}
            </Text>
          </View>
        )}
  
        {/* Current Status */}
        <View className="bg-white rounded-3xl p-3 mt-3 shadow-sm">
          <View className="flex-row items-center justify-center mb-2">
            <MaterialCommunityIcons name={hydrationStatus.icon} size={28} color={hydrationStatus.color} style={{ marginRight: 8 }} />
            <Text className="text-lg font-semibold text-black">
              {hydrationStatus.status}
            </Text>
          </View>
          
          <View className="items-center">
            <Text className="text-base font-semibold text-black mb-1">
              Progress: {waterDrank} ml / {waterGoal} ml
            </Text>
            <Progress.Bar
              progress={progress}
              width={width - 80}
              height={20}
              color={hydrationStatus.color}
              unfilledColor="rgba(255,255,255,0.2)"
              borderWidth={0}
              borderRadius={10}
            />
            <Text className="text-xs text-black/80 mt-1">
              {Math.floor(waterDrank / 250)} of {glasses} glasses ({Math.round(progress * 100)}%)
            </Text>
             <Text className="text-sm text-black mt-3 text-center">
             Daily Goal: <Text className="font-semibold text-black">{waterGoal} ml</Text>
          </Text>
          <Text className="text-xs text-black/80 text-center mt-1">
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
                className="border-2 border-white/30 rounded-xl p-3 m-1 items-center bg-white/10 backdrop-blur-sm"
                style={{ width: (width - 80) / 3 - 8 }}
              >
                <MaterialCommunityIcons name={cup.icon} size={28} color="#2196F3" style={{ marginBottom: 4 }} />
                <Text className="text-xs font-semibold text-black">{cup.size}ml</Text>
           
              </TouchableOpacity>
            ))}
          </View>
       

        {/* Smart Reminders */}
        <View className="bg-white rounded-3xl p-4 mt-4 shadow-sm">
          <Text className="text-xl text-black font-semibold text-center mb-3">
            Smart Reminders
          </Text>
          
          <View className="flex-row items-center justify-center mb-3">
            <Text className="text-sm text-black/80 mr-2">
              {remindersEnabled ? 'On' : 'Off'}
            </Text>
            <Switch
              value={remindersEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#ffffff' }}
              thumbColor={remindersEnabled ? '#11B5CF' : '#f3f4f6'}
            />
          </View>
          
          {remindersEnabled ? (
            <>
              <Text className="text-base text-black/80 text-center">
                {getTimeUntilNextReminder()}
              </Text>
              {lastDrinkTime && (
                <Text className="text-sm text-black/60 text-center mt-2">
                  Last drink: {lastDrinkTime.toLocaleTimeString()}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-base text-black/60 text-center italic">
              Reminders are currently disabled
            </Text>
          )}
        </View>

        {/* Quick Stats */}
        
          <Text className="text-lg font-semibold text-black mb-3 text-center mt-8">
            <MaterialCommunityIcons name="chart-bar" size={20} color="#2196F3" /> Today's Stats
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
                              <MaterialCommunityIcons name="cup" size={29} color="#2196F3" />
                <Text className="text-lg font-semibold text-black">
                  {Math.floor(waterDrank / 250)}
                </Text>
                <Text className="text-sm text-black/80">Glasses</Text>
            </View>
            <View className="items-center">
                              <MaterialCommunityIcons name="target" size={29} color="#2196F3" />
                <Text className="text-lg font-semibold text-black">
                  {Math.round(progress * 100)}%
                </Text>
                <Text className="text-sm text-black/80">Complete</Text>
            </View>
            <View className="items-center">
                              <MaterialCommunityIcons name="fire" size={29} color="#2196F3" />
                <Text className="text-lg font-semibold text-black">
                  {streak}
                </Text>
                <Text className="text-sm text-black/80">Day Streak</Text>
            </View>
          </View>
     

        {/* Restart Day Button */}
        <TouchableOpacity
          onPress={handleRestartDay}
          className="flex-row items-center justify-center bg-red-100/20 backdrop-blur-sm border-2 border-red-300/30 rounded-xl p-3 mb-8 mt-9"
          style={{ alignSelf: 'center', width: width - 80 }}
        >
          <MaterialCommunityIcons name="refresh" size={22} color="#2196F3" style={{ marginRight: 8 }} />
          <Text className="text-base font-semibold text-black">Restart Day</Text>
        </TouchableOpacity>

        {/* Send Reminder Button */}
        <TouchableOpacity
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
              if (token) {
                const response = await fetch(`${BASE_URL}/api/water/send-reminders`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                if (response.ok) {
                  Alert.alert('Success', 'Reminder sent successfully!');
                } else {
                  const errorText = await response.text();
                  Alert.alert('Error', `Failed to send reminder: ${response.status} ${errorText}`);
                }
              } else {
                Alert.alert('Error', 'No token available to send reminder.');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while sending reminder.');
            }
          }}
          className="flex-row items-center justify-center bg-blue-100/20 backdrop-blur-sm border-2 border-blue-300/30 rounded-xl p-3 mb-8"
          style={{ alignSelf: 'center', width: width - 80 }}
        >
          <MaterialCommunityIcons name="bell" size={22} color="#2196F3" style={{ marginRight: 8 }} />
          <Text className="text-base font-semibold text-black">Send Reminder Now</Text>
        </TouchableOpacity>

        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Water;