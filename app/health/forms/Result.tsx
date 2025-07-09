import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Button, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Progress from 'react-native-progress';

// Define props interface for user data
interface ResultParams {
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  sleepHours: number;
  dietPreference: string;
  stressLevel: 'Low' | 'Moderate' | 'High';
  healthGoal: string;
}

interface ResultProps {
  height?: string | null;
  weight?: { value: number; unit: 'kg' | 'lb' } | null;
  navigation?: any; // Optional navigation prop
  route?: {
    params: Partial<ResultParams>;
  };
}

const Result: React.FC<ResultProps> = ({ route, height: propHeight, weight: propWeight }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Show loader for 1.2s
    return () => clearTimeout(timer);
  }, []);

  // Extract user data from route params or provide default fallback values
  const {
    height: routeHeight = 170,
    weight: routeWeight = 70,
    activityLevel = 'Lightly Active',
    sleepHours = 7,
    dietPreference = 'Balanced',
    stressLevel = 'Moderate',
    healthGoal = 'Maintain Weight',
    name = '',
  } = route?.params || {} as Partial<ResultParams & { name?: string }>;

  // Prefer props over route params when provided
  let height = typeof propHeight === 'string' ? parseFloat(propHeight) : propHeight ?? routeHeight;
  // Ensure we have numeric height fallback
  if (isNaN(height as number)) height = 170;

  let weightKg: number;
  if (propWeight) {
    weightKg = propWeight.unit === 'lb' ? propWeight.value / 2.20462 : propWeight.value;
  } else {
    weightKg = typeof routeWeight === 'number' ? routeWeight : 70;
  }

  // Calculate BMI
  const bmi = (weightKg / (((height as number) / 100) ** 2)).toFixed(1);
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';

  // Calculate Health Score (simplified logic based on previous table)
  const activityScore = {
    'Sedentary': 5,
    'Lightly Active': 10,
    'Moderately Active': 20,
    'Very Active': 25,
  }[activityLevel] || 10;
  const sleepScore = sleepHours >= 7 && sleepHours <= 8 ? 25 : sleepHours < 5 ? 10 : 15;
  const dietScore = dietPreference ? 20 : 10; // Simplified
  const stressScore = stressLevel === 'Low' ? 25 : stressLevel === 'Moderate' ? 15 : 10;
  const healthScore = activityScore + sleepScore + dietScore + stressScore;

  // Recommendations (simplified logic from previous table)
  const activityRecommendation = activityLevel === 'Sedentary'
    ? 'Try 20 min of brisk walking daily to boost heart health!'
    : `Great job staying ${activityLevel.toLowerCase()}! Add a 7-min workout to level up.`;
  const dietRecommendation = `For your ${dietPreference} diet and ${healthGoal} goal, try ${healthGoal === 'Weight Loss' ? 'high-protein, low-calorie meals' : 'balanced, nutrient-rich foods'}.`;
  const sleepRecommendation = sleepHours < 6
    ? 'Aim for 7-8 hours of sleep with a consistent bedtime routine.'
    : 'Great sleep habits! Keep it up for better energy.';
  const stressRecommendation = stressLevel === 'High'
    ? 'Try 5-minute mindfulness exercises to reduce stress.'
    : 'Keep stress in check with deep breathing or yoga.';
  const roadmap = [
    `Step 1: ${healthGoal === 'Weight Loss' ? 'Walk 10,000 steps daily' : 'Set a daily health goal'}.`,
    `Step 2: Try a ${healthGoal === 'Weight Loss' ? '7-min workout' : 'mindfulness session'}.`,
    'Step 3: Track progress in the app!',
  ];

  // Initialize router from expo-router for navigation
  const router = useRouter();

  // Navigate to the signup screen when the CTA button is pressed
  const handleNavigateSignup = () => {
    router.push('/health/forms/Signup');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-teal-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0cb6ab" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-teal-50">
      <ScrollView className="p-8">
        {/* Header */}
        <Text className="text-3xl font-semibold text-[#0cb6ab] mb-1 mt-15">
          {name ? `Hi, ${name}!` : 'Hi!'}
        </Text>
        <Text className="text-lg  text-gray-500 mb-6">
          Here is your Health Snapshot
        </Text>

        {/* BMI Section */}
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Text className="text-md font-semibold text-black">Body Mass Index (BMI)</Text>
          <Text className="text-sm text-gray-500 mt-2">{bmi} - {bmiCategory}</Text>
          <View className="mt-4">
            <Progress.Bar
              progress={Math.min(parseFloat(bmi) / 40, 1)} // Normalize BMI to 0-1 for progress bar
              width={null}
              color={bmiCategory === 'Healthy' ? '#dffd6e' : '#ef4444'}
              unfilledColor="#e5e7eb"
              borderWidth={0}
              height={10}
              className="rounded-full"
            />
            <Text className="text-xs text-gray-600 mt-2">
              {bmiCategory === 'Healthy'
                ? 'You’re in a healthy range! Keep it up.'
                : `Let’s work on getting to a healthier BMI with ${healthGoal.toLowerCase()} tips!`}
            </Text>
          </View>
        </View>

        {/* Health Score Section */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-4">
          <Text className="text-md font-semibold text-gray-800">Health Score</Text>
          <View className="items-center mt-4">
           <Progress.Circle
            size={120}
            progress={healthScore / 100}
            showsText
            color="#daf66e"
            textStyle={{ fontSize: 24, fontWeight: 'bold' }}
            thickness={10}
            formatText={() => `${healthScore}%`}
          />
            <Text className="text-sm font-bold text-gray-500 mt-2">
              Your score: {healthScore}/100
            </Text>
            <Text className="text-xs text-gray-600 mt-2">
              Based on your activity, sleep, diet, and stress. Create an account to track improvements!
            </Text>
          </View>
        </View>

        {/* Recommendations Section */}
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Text className="text-md font-semibold text-gray-800 ">Your Personalized Recommendations</Text>
          <Text className="text-md font-medium text-[#0cb6ab] mt-4">Activity</Text>
          <Text className="text-sm text-gray-600">{activityRecommendation}</Text>
          <Text className="text-md font-medium text-[#0cb6ab] mt-4">Diet</Text>
          <Text className="text-sm text-gray-600">{dietRecommendation}</Text>
          <Text className="text-md font-medium text-[#0cb6ab] mt-4">Sleep</Text>
          <Text className="text-sm text-gray-600">{sleepRecommendation}</Text>
          <Text className="text-md font-medium text-[#0cb6ab] mt-4">Stress</Text>
          <Text className="text-sm text-gray-600">{stressRecommendation}</Text>
        </View>

        {/* Health Roadmap Section */}
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Text className="text-md font-semibold text-gray-800">Your Health Roadmap</Text>
          {roadmap.map((step, index) => (
            <Text key={index} className="text-sm text-gray-600 mt-2">
              • {step}
            </Text>
          ))}
        </View>

        {/* Call to Action */}
        <View className="bg-[#0cb6ab] p-4 rounded-lg mb-6">
          <Text className="text-white text-center text-sm font-semibold">
            Save your progress and unlock personalized plans!
          </Text>
          <View className="mt-4 ">
            <TouchableOpacity
              style={{ backgroundColor: '#dffd6e', borderRadius: 8, paddingVertical: 12 }}
              activeOpacity={0.8}
              onPress={handleNavigateSignup}
            >
              <Text className="text-center text-md font-bold" style={{ color: 'black' }}>
                Create Your Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Result;