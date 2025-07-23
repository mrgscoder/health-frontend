import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WellnessData {
  goal: string;
  stress: string;
}

interface WellnessProps {
  onNext?: (data: WellnessData) => void;
  onBack?: () => void;
}

const options = [
  { label: 'Weight Loss', icon: <MaterialCommunityIcons name="weight" size={20} color="#11B5CF" /> },
  { label: 'Muscle Gain', icon: <MaterialCommunityIcons name="dumbbell" size={20} color="#11B5CF" /> },
  { label: 'Stress Management', icon: <Feather name="smile" size={20} color="#11B5CF" /> },
  { label: 'Better Sleep', icon: <Feather name="moon" size={20} color="#11B5CF" /> },
  { label: 'General Wellness', icon: <FontAwesome5 name="heartbeat" size={20} color="#11B5CF" /> },
];

const stressLevels = ["Low", "Moderate", "High"];

export default function Wellness({ onNext, onBack }: WellnessProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedStress, setSelectedStress] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const params = useLocalSearchParams();

  // Get data from previous forms
  const previousData = {
    name: params.name as string,
    height: params.height as string,
    weight: params.weight as string,
    activityLevel: params.activityLevel as string,
    sleepHours: params.sleepHours as string,
    dietPreference: params.dietPreference as string
  };

  // Try to get the name from various sources
  useEffect(() => {
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
  }, [params.name]);

  const handleNext = () => {
    if (!selectedGoal || !selectedStress) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    
    const data = { goal: selectedGoal, stress: selectedStress };
    
    if (onNext) {
      onNext(data);
    } else {
      // Default behavior when used as standalone page
      // Navigate to the result page with all collected data
      const resultParams = {
        // Pass all collected data from previous forms
        name: previousData.name || userName || 'there',
        height: previousData.height,
        weight: previousData.weight,
        activityLevel: previousData.activityLevel,
        sleepHours: previousData.sleepHours,
        dietPreference: previousData.dietPreference,
        // Pass current form data
        healthGoal: selectedGoal,
        stressLevel: selectedStress
      };
      
      // Debug: Log what data we're passing
      console.log('Wellness.tsx - Passing to Result:', resultParams);
      console.log('Wellness.tsx - previousData.name:', previousData.name);
      console.log('Wellness.tsx - userName:', userName);
      
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-5 bg-white">
        <Text className="text-xl font-semibold text-gray-800 mb-1">What are you looking for?</Text>
        {/* Health Goals */}
        {options.map((item) => {
          const isSelected = selectedGoal === item.label;
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => setSelectedGoal(item.label)}
              className={`flex-row items-center justify-between border rounded-xl px-4 py-4 mb-3  ${
                isSelected ? "border-[#11B5CF] bg-cyan-50" : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center">
                {item.icon}
                <View style={{ width: 12 }} />
                <Text className="text-base text-gray-800">{item.label}</Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border ${
                  isSelected ? "bg-[#11B5CF] border-[#11B5CF]" : "border-gray-300"
                } items-center justify-center`}
              >
                {isSelected && <Feather name="check" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Stress Level Title */}
        <Text className="text-lg font-semibold text-gray-800 mt-6 mb-3">Your Stress Level</Text>

        {/* Stress Levels */}
        <View className="flex-row flex-wrap">
          {stressLevels.map((level) => {
            const isSelected = selectedStress === level;
            return (
              <TouchableOpacity
                key={level}
                onPress={() => setSelectedStress(level)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                  isSelected ? "bg-cyan-50 border-[#11B5CF]" : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected ? "text-[#11B5CF] font-semibold" : "text-gray-700"
                  }`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showWarning && (
          <Text className="text-center text-xs text-red-500 mt-2">Please select a goal and stress level before continuing.</Text>
        )}

        {/* Navigation Buttons */}
        <View className="mt-10 flex-row justify-between">
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
      </ScrollView>
    </SafeAreaView>
  );
}
