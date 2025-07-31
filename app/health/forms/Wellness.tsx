import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface WellnessData {
  goal: string;
  energyLevel: string;
}

interface WellnessProps {
  onNext?: (data: WellnessData) => void;
  onBack?: () => void;
}

const options = [
  { label: 'Lose Weight', icon: <MaterialCommunityIcons name="weight" size={22} color="#11B5CF" /> },
  { label: 'Gain Muscle', icon: <MaterialCommunityIcons name="weight-lifter" size={22} color="#11B5CF" /> },
  { label: 'Improve Fitness', icon: <MaterialCommunityIcons name="run" size={22} color="#11B5CF" /> },
  { label: 'Better Sleep', icon: <MaterialCommunityIcons name="sleep" size={22} color="#11B5CF" /> },
  { label: 'Maintain Health', icon: <FontAwesome5 name="heart" size={20} color="#11B5CF" /> },
];

const energyLevels = [
  { label: 'Low', description: 'I feel tired most of the time' },
  { label: 'Moderate', description: 'I have balanced energy throughout the day' },
  { label: 'High', description: 'I feel energetic and active' },
];

export default function Wellness({ onNext, onBack }: WellnessProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const params = useLocalSearchParams();
  const isInitialized = useRef(false);

  // Get data from previous forms
  const previousData = {
    name: params.name as string,
    age: params.age as string,
    gender: params.gender as string,
    height: params.height as string,
    weight: params.weight as string,
    activityLevel: params.activityLevel as string,
    sleepHours: params.sleepHours as string,
    dietPreference: params.dietPreference as string
  };

  // Try to get the name from various sources
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const getName = async () => {
      // First try to get from route params
      if (params.name) {
        setUserName(params.name as string);
        return;
      }
      
      // Then try to get from AsyncStorage
      try {
        const storedName = await AsyncStorage.getItem('userFullName');
        if (storedName) {
          setUserName(storedName);
          return;
        }
      } catch (error) {
        console.log('Error getting name from AsyncStorage:', error);
      }
      
      // Default fallback
      setUserName('there');
    };
    
    getName();
  }, []);

  const handleNext = () => {
    if (!selectedGoal || !selectedEnergyLevel) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    
    const data = { goal: selectedGoal, energyLevel: selectedEnergyLevel };
    
    if (onNext) {
      onNext(data);
    } else {
      // Default behavior when used as standalone page
      // Navigate to the result page with all collected data
      const resultParams = {
        // Pass all collected data from previous forms
        name: previousData.name || userName || 'there',
        age: previousData.age,
        gender: previousData.gender,
        height: previousData.height,
        weight: previousData.weight,
        activityLevel: previousData.activityLevel,
        sleepHours: previousData.sleepHours,
        dietPreference: previousData.dietPreference,
        // Pass current form data
        healthGoal: selectedGoal,
        energyLevel: selectedEnergyLevel
      };
      
      // Debug: Log what data we're passing
      console.log('✅ Wellness.tsx - Passing to Result:', resultParams);
      console.log('📊 Previous data received:', previousData);
      console.log('📊 Current form data:', data);
      console.log('👤 User name being passed:', resultParams.name);
      
      router.push({
        pathname: '/health/forms/Result',
        params: resultParams
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default behavior when used as standalone page
      // Navigate back to the previous step
      router.back();
    }
  };

  const OptionButton = ({
    option,
    isSelected,
    onPress,
  }: {
    option: { label: string; icon: React.ReactNode };
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-4 mb-2 rounded-lg border ${
        isSelected ? 'bg-cyan-50 border-[#11B5CF]' : 'bg-white border-gray-200'
      }`}
    >
      <View className="flex-row items-center">
        <View className="w-6 h-6 mr-3 items-center justify-center">
          {option.icon}
        </View>
        <Text
          className={`text-md ${
            isSelected ? 'text-[#11B5CF]' : 'text-gray-700'
          }`}
        >
          {option.label}
        </Text>
      </View>
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          isSelected ? 'bg-[#11B5CF] border-[#11B5CF]' : 'border-gray-300'
        }`}
      >
        {isSelected && (
          <Text className="text-white text-xs font-bold">✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
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
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-5">
          {/* White rounded container for the form */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-10" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <View className="mb-3">
              <Text className="text-xl font-semibold text-gray-800 text-center">What are you looking for?</Text>
              <Text className="text-xs text-gray-600 text-center">Select your health goals and energy level.</Text>
            </View>

            {/* Health Goals Section */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-[#11B5CF] mb-4">Health Goals</Text>
              {options.map((option) => (
                <OptionButton
                  key={option.label}
                  option={option}
                  isSelected={selectedGoal === option.label}
                  onPress={() => setSelectedGoal(option.label)}
                />
              ))}
            </View>

            {/* Energy Level Section */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-[#11B5CF] mb-4">Your Energy Level</Text>
              <View className="flex-row flex-wrap">
                {energyLevels.map((level) => {
                  const isSelected = selectedEnergyLevel === level.label;
                  return (
                    <TouchableOpacity
                      key={level.label}
                      onPress={() => setSelectedEnergyLevel(level.label)}
                      className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                        isSelected ? "bg-cyan-50 border-[#11B5CF]" : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isSelected ? "text-[#11B5CF] font-semibold" : "text-gray-700"
                        }`}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {showWarning && (
              <Text className="text-center text-xs text-red-500 mb-2">Please select a goal and energy level before continuing.</Text>
            )}

            {/* Navigation Buttons */}
            <View className="mt-1 mb-4 flex-row justify-between">
              <TouchableOpacity
                onPress={handleBack}
                className="bg-gray-200 py-3 px-6 rounded-lg"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 font-semibold">BACK</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleNext}
                className="bg-[#11B5CF] py-3 px-6 rounded-lg"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">NEXT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
