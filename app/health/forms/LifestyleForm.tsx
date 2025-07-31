import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface LifestyleData {
  activityLevel: string;
  sleepHours: string;
  dietPreference: string;
}

interface LifestyleFormProps {
  onNext?: (data: LifestyleData) => void;
  onBack?: () => void;
}

const LifestyleForm: React.FC<LifestyleFormProps> = ({ onNext, onBack }) => {
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<string>('');
  const [selectedSleepHours, setSelectedSleepHours] = useState<string>('');
  const [selectedDietPreference, setSelectedDietPreference] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  
  // Get data from previous form
  const params = useLocalSearchParams();
  const previousData = {
    name: params.name as string,
    age: params.age as string,
    gender: params.gender as string,
    height: params.height as string,
    weight: params.weight as string
  };

  // Debug: Log what data we're receiving
  console.log('LifestyleForm.tsx - Received params:', params);
  console.log('LifestyleForm.tsx - previousData:', previousData);

  const activityLevels = [
    { id: 'Sedentary', label: 'SEDENTARY', icon: <MaterialCommunityIcons name="account" size={22} color="#11B5CF" /> },
    { id: 'Lightly Active', label: 'LIGHTLY ACTIVE', icon: <Feather name="activity" size={22} color="#11B5CF" /> },
    { id: 'Moderately Active', label: 'MODERATELY ACTIVE', icon: <MaterialCommunityIcons name="run" size={22} color="#11B5CF" /> },
    { id: 'Very Active', label: 'VERY ACTIVE', icon: <MaterialCommunityIcons name="weight-lifter" size={22} color="#11B5CF" /> },
  ];

  const sleepOptions = [
    { id: '4', label: '<5 HOURS', icon: <Feather name="moon" size={22} color="#11B5CF" /> },
    { id: '5', label: '5-6 HOURS', icon: <Feather name="clock" size={22} color="#11B5CF" /> },
    { id: '7', label: '6-8 HOURS', icon: <MaterialCommunityIcons name="sleep" size={22} color="#11B5CF" /> },
    { id: '9', label: '>8 HOURS', icon: <MaterialCommunityIcons name="emoticon-happy-outline" size={22} color="#11B5CF" /> },
  ];

  const dietPreferences = [
    { id: 'Vegetarian', label: 'VEGETARIAN', icon: <MaterialCommunityIcons name="food-apple-outline" size={22} color="#11B5CF" /> },
    { id: 'Vegan', label: 'VEGAN', icon: <MaterialCommunityIcons name="leaf" size={22} color="#11B5CF" /> },
    { id: 'Omnivore', label: 'OMNIVORE', icon: <MaterialCommunityIcons name="food-steak" size={22} color="#11B5CF" /> },
    { id: 'Keto', label: 'KETO', icon: <MaterialCommunityIcons name="food-variant" size={22} color="#11B5CF" /> },
    { id: 'Other', label: 'OTHER', icon: <FontAwesome5 name="utensils" size={20} color="#11B5CF" /> },
  ];

  const handleNext = () => {
    if (!selectedActivityLevel || !selectedSleepHours || !selectedDietPreference) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    const data: LifestyleData = {
      activityLevel: selectedActivityLevel,
      sleepHours: selectedSleepHours,
      dietPreference: selectedDietPreference,
    };
    
    if (onNext) {
      onNext(data);
    } else {
      // Default behavior when used as standalone page
      // Navigate to the next step in the form flow with all collected data
      const wellnessParams = {
        // Pass previous form data
        name: previousData.name,
        age: previousData.age,
        gender: previousData.gender,
        height: previousData.height,
        weight: previousData.weight,
        // Pass current form data
        activityLevel: selectedActivityLevel,
        sleepHours: selectedSleepHours,
        dietPreference: selectedDietPreference
      };
      
      // Debug: Log what data we're passing
      console.log('✅ LifestyleForm.tsx - Passing to Wellness:', wellnessParams);
      console.log('📊 Previous data received:', previousData);
      console.log('📊 Current form data:', data);
      
      router.push({
        pathname: '/health/forms/Wellness',
        params: wellnessParams
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
    option: { id: string; label: string; icon: React.ReactNode };
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
          className={`text-sm font-medium ${
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
              <Text className="text-xl font-semibold text-gray-800 text-center">Your Lifestyle Habits</Text>
              <Text className="text-xs text-gray-600 text-center">Select the options that best describe your lifestyle.</Text>
            </View>

            {/* Activity Level Section */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-[#11B5CF] mb-4">Activity Level</Text>
              {activityLevels.map((level) => (
                <OptionButton
                  key={level.id}
                  option={level}
                  isSelected={selectedActivityLevel === level.id}
                  onPress={() => setSelectedActivityLevel(level.id)}
                />
              ))}
            </View>

            {/* Sleep Hours Section */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-[#11B5CF] mb-4">Sleep Hours</Text>
              {sleepOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  option={option}
                  isSelected={selectedSleepHours === option.id}
                  onPress={() => setSelectedSleepHours(option.id)}
                />
              ))}
            </View>

            {/* Diet Preference Section */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-[#11B5CF] mb-4">Diet Preference</Text>
              {dietPreferences.map((diet) => (
                <OptionButton
                  key={diet.id}
                  option={diet}
                  isSelected={selectedDietPreference === diet.id}
                  onPress={() => setSelectedDietPreference(diet.id)}
                />
              ))}
            </View>

            {showWarning && (
              <Text className="text-center text-xs text-red-500 mb-2">Please select an option in each category before continuing.</Text>
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
};

export default LifestyleForm;