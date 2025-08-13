import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  name?: string;
  age?: string;
  gender?: 'Male' | 'Female';
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
  const [userName, setUserName] = useState<string>('');

  // Get params using useLocalSearchParams (recommended for Expo Router)
  const params = useLocalSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Show loader for 1.2s
    return () => clearTimeout(timer);
  }, []);

  // Try to get name from AsyncStorage as fallback
  useEffect(() => {
    const getNameFromStorage = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userFullName');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.log('Error getting name from AsyncStorage:', error);
      }
    };
    
    getNameFromStorage();
  }, []);

  // Extract user data from params - use actual values, no fallbacks
  const {
    height: routeHeight,
    weight: routeWeight,
    activityLevel,
    sleepHours,
    dietPreference,
    stressLevel,
    healthGoal,
    name = '',
    age = '',
    gender = 'Male', // Default to Male if not provided
  } = params as Partial<ResultParams>;

  // Debug: Log what data we're receiving
  console.log('Result.tsx - Received params:', params);
  console.log('Result.tsx - Extracted name:', name);
  console.log('Result.tsx - userName from AsyncStorage:', userName);
  console.log('Result.tsx - All extracted data:', {
    name,
    height: routeHeight,
    weight: routeWeight,
    activityLevel,
    sleepHours,
    dietPreference,
    stressLevel,
    healthGoal,
    age,
    gender
  });

  // Use name from params, then AsyncStorage, then default
  const displayName = name || userName || 'there';

  // Convert string values to numbers and use actual user data
  let height: number;
  if (propHeight) {
    height = typeof propHeight === 'string' ? parseFloat(propHeight) : propHeight;
  } else if (routeHeight) {
    height = typeof routeHeight === 'string' ? parseFloat(routeHeight) : routeHeight;
  } else {
    height = 170;
  }

  let weightKg: number;
  if (propWeight) {
    weightKg = propWeight.unit === 'lb' ? propWeight.value / 2.20462 : propWeight.value;
  } else if (routeWeight) {
    weightKg = typeof routeWeight === 'string' ? parseFloat(routeWeight) : routeWeight;
  } else {
    weightKg = 70;
  }

  // Convert sleepHours to number if it's a string
  const sleepHoursNum = typeof sleepHours === 'string' ? parseFloat(sleepHours) : sleepHours || 7;

  // Calculate BMI using actual user data
  const bmiValue = (weightKg / ((height / 100) ** 2));
  const bmi = bmiValue.toFixed(1);

  // Gender-specific BMI categories
  const bmiCategory = gender === 'Male'
    ? bmiValue < 18.5 ? 'Underweight' : bmiValue < 25 ? 'Healthy' : bmiValue < 30 ? 'Overweight' : 'Obese'
    : bmiValue < 18.5 ? 'Underweight' : bmiValue < 24 ? 'Healthy' : bmiValue < 29 ? 'Overweight' : 'Obese';

  // Enhanced Health Score Calculation with Gender Adjustment
  const activityScore: Record<string, number> = {
    'Sedentary': 5,
    'Lightly Active': 15,
    'Moderately Active': 25,
    'Very Active': 35,
  };
  
  const activityScoreValue = activityLevel ? activityScore[activityLevel] || 15 : 15;
  const sleepScore = sleepHoursNum >= 7 && sleepHoursNum <= 8 ? 30 : sleepHoursNum < 5 ? 10 : 20;
  const dietScore = dietPreference ? (dietPreference.includes('Vegan') || dietPreference.includes('Vegetarian') ? 25 : 20) : 15;
  const stressScore = stressLevel === 'Low' ? 30 : stressLevel === 'Moderate' ? 20 : 10;
  
  // Gender-specific adjustment: females may need slightly higher protein and activity focus for muscle maintenance
  const genderAdjustment = gender === 'Female' ? 5 : 0; // Add 5 points for females to account for higher protein needs
  const healthScore = Math.round((activityScoreValue + sleepScore + dietScore + stressScore + genderAdjustment) * 0.588); // Scale to 0-100

  // Health Score Categories
  const getHealthScoreCategory = (score: number): { category: string; description: string } => {
    if (score >= 80) {
      return {
        category: 'Excellent',
        description: 'You’re thriving! Your lifestyle choices are top-notch. Keep pushing for consistency.'
      };
    } else if (score >= 60) {
      return {
        category: 'Good',
        description: 'You’re on a solid path! Small tweaks can elevate your health to the next level.'
      };
    } else if (score >= 40) {
      return {
        category: 'Fair',
        description: 'You’ve got a foundation to build on. Focus on key areas to boost your score.'
      };
    } else {
      return {
        category: 'Needs Improvement',
        description: 'Time for a health reset! Start with small, sustainable changes to see progress.'
      };
    }
  };

  const { category: healthScoreCategory, description: healthScoreDescription } = getHealthScoreCategory(healthScore);

  // Enhanced Recommendations with Indian-Specific Protein Sources and Gender Adjustment
  const activityRecommendation = gender === 'Female'
    ? (activityLevel === 'Sedentary'
        ? 'Start with 20 min of brisk walking or yoga daily to boost heart health and muscle tone.'
        : `Great job staying ${activityLevel?.toLowerCase()}! Add a 10-min strength workout to support bone health.`)
    : (activityLevel === 'Sedentary'
        ? 'Start with 20 min of brisk walking daily to boost heart health and energy levels.'
        : `Great job staying ${activityLevel?.toLowerCase()}! Add a 10-min bodyweight workout to enhance strength.`);

  const proteinSources = {
    Vegetarian: ['paneer', 'chickpeas (chole)', 'lentils (dal)', 'rajma (kidney beans)', 'dahi (yogurt)'],
    Vegan: ['tofu', 'chickpeas (chole)', 'lentils (dal)', 'rajma (kidney beans)', 'soy milk'],
    NonVegetarian: ['eggs', 'chicken', 'fish (machhli)', 'mutton', 'prawns']
  };

  const selectedDiet = dietPreference?.includes('Vegan') ? 'Vegan' :
                      dietPreference?.includes('Vegetarian') ? 'Vegetarian' : 'NonVegetarian';

  // Gender-specific protein needs: Females 1.0-1.4g/kg, Males 0.8-1.2g/kg
  const proteinRange = gender === 'Female' ? '1.0-1.4g' : '0.8-1.2g';
  const proteinRecommendation = `Incorporate protein-rich foods like ${proteinSources[selectedDiet].slice(0, 3).join(', ')} into your ${dietPreference || 'Balanced'} diet to support ${healthGoal || 'General Wellness'}. Aim for ${proteinRange} of protein per kg of body weight daily. Try recipes like ${selectedDiet === 'Vegan' ? 'dal tadka or tofu bhurji' : selectedDiet === 'Vegetarian' ? 'paneer tikka or chana masala' : 'chicken curry or fish fry'}.`;

  const dietRecommendation = `${proteinRecommendation} For ${healthGoal || 'General Wellness'}, include ${healthGoal === 'Weight Loss' ? 'high-protein, low-calorie meals like dal with roti' : healthGoal === 'Gain Muscle' ? 'protein-heavy meals with complex carbs like paneer paratha' : 'balanced meals with whole grains like brown rice and dal'}.`;

  const sleepRecommendation = sleepHoursNum < 6
    ? 'Aim for 7-8 hours of sleep with a consistent bedtime routine to improve recovery.'
    : 'Excellent sleep habits! Maintain this for optimal energy and focus.';

  const stressRecommendation = stressLevel === 'High'
    ? 'Practice 5-minute mindfulness or meditation daily to reduce stress and improve focus.'
    : 'Keep stress in check with deep breathing exercises or a short yoga session.';

  // Motivational Quotes
  const motivationalQuotes = [
    "Small steps every day lead to big results!",
    "Your health is an investment, not an expense.",
    "Progress, not perfection, is the key to success.",
    "Every healthy choice you make is a victory!",
    "You’re stronger than you think—keep going!"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Enhanced Health Roadmap with Indian Context and Gender Adjustment
  const roadmap = [
    `Step 1: ${(healthGoal || 'General Wellness') === 'Weight Loss' ? 'Walk 10,000 steps daily' : healthGoal === 'Gain Muscle' ? 'Start a strength training routine 3x/week' : 'Set a daily health goal'}.`,
    `Step 2: Include ${proteinSources[selectedDiet][0]} in at least one meal daily, like ${selectedDiet === 'Vegan' ? 'dal with rice' : selectedDiet === 'Vegetarian' ? 'paneer sabzi' : 'chicken curry'}.`,
    `Step 3: Track your ${healthGoal?.toLowerCase() || 'health'} progress in the app!`,
  ];

  // Initialize router from expo-router for navigation
  const router = useRouter();

  // Navigate to the signup screen when the CTA button is pressed
  const handleNavigateSignup = () => {
    try {
      // Prepare all health data to pass to signup
      const healthData = {
        name: displayName,
        age: params.age as string,
        height: height.toString(),
        weight: weightKg.toString(),
        activityLevel: activityLevel || '',
        sleepHours: sleepHoursNum.toString(),
        dietPreference: dietPreference || '',
        stressLevel: stressLevel || '',
        healthGoal: healthGoal || '',
        gender: gender,
        bmi: bmi,
        bmiCategory: bmiCategory,
        healthScore: healthScore.toString(),
        healthScoreCategory,
        activityRecommendation,
        dietRecommendation,
        sleepRecommendation,
        stressRecommendation,
        roadmap: JSON.stringify(roadmap),
        motivationalQuote: randomQuote
      };

      // Create URL with all health data as query parameters
      const queryParams = new URLSearchParams(healthData).toString();
      
      console.log('✅ Result.tsx - Navigating to signup with health data:', healthData);
      console.log('📊 All params received:', params);
      console.log('👤 Display name:', displayName);
      
      router.push({
        pathname: '/health/forms/Signup',
        params: healthData
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      router.push({ pathname: '/navigation/tabs/food'});
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cyan-50 justify-center items-center">
        <ActivityIndicator size="large" color="#11B5CF" />
      </SafeAreaView>
    );
  }

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
          {/* White rounded container for the health snapshot */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-12" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
            borderRadius: 24,
          }}>
            {/* Header */}
            <Text className="text-2xl font-semibold text-[#11B5CF] mb-1">
              Hi, {displayName}!
            </Text>
            <Text className="text-sm text-gray-500 mb-6">
              Your Personalized Health Snapshot
            </Text>

            {/* Motivational Quote */}
            <View className="bg-white p-4 rounded-lg shadow-md mb-4">
              <Text className="text-md font-semibold text-black italic text-center">
                "{randomQuote}"
              </Text>
            </View>

            {/* BMI Section */}
            <View className="bg-gray-50 p-4 rounded-lg shadow-md mb-4">
              <Text className="text-md font-semibold text-gray-800">Body Mass Index (BMI)</Text>
              <Text className="text-sm text-gray-500 mt-2">{bmi} - {bmiCategory}</Text>
              <View className="mt-4">
                <Progress.Bar
                  progress={Math.min(parseFloat(bmi) / 40, 1)}
                  width={null}
                  color={bmiCategory === 'Healthy' ? '#dffd6e' : '#ef4444'}
                  unfilledColor="#e5e7eb"
                  borderWidth={0}
                  height={10}
                  className="rounded-full"
                />
                <Text className="text-xs text-gray-600 mt-2">
                  {bmiCategory === 'Healthy'
                    ? `You're in a healthy range for ${gender === 'Male' ? 'men' : 'women'}! Maintain with balanced nutrition and exercise.`
                    : `Let's optimize your BMI with tailored ${healthGoal?.toLowerCase()} strategies for ${gender === 'Male' ? 'men' : 'women'}!`}
                </Text>
              </View>
            </View>

            {/* Health Score Section */}
            <View className="bg-gray-50 p-4 rounded-xl shadow-md mb-4">
              <Text className="text-md font-semibold text-gray-800">Health Score: {healthScoreCategory}</Text>
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
                <Text className="text-xs text-gray-600 mt-2 text-center">
                  {healthScoreDescription}
                </Text>
              </View>
            </View>

            {/* Recommendations Section */}
            <View className="p-6 rounded-3xl mb-6" style={{
              borderWidth: 2,
              borderColor: '#11B5CF',
              borderStyle: 'dashed',
            }}>
              <Text className="text-lg font-bold font-serif text-center text-[#11B5CF] mb-4 mt-6">
               Recommendations
              </Text>
              
              {/* Activity Recommendation */}
              <View className="p-4 mb-4 rounded-3xl">
                <View className="flex-row items-center mb-2 ">
                  <Ionicons name="fitness-outline" size={24} color="#11B5CF" style={{ marginRight: 8 }} />
                  <Text className="text-lg font-bold text-[#11B5CF]">Activity</Text>
                </View>
                <Text className="text-sm text-gray-700 leading-6">{activityRecommendation}</Text>
              </View>

              {/* Diet Recommendation */}
              <View className="p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="restaurant-outline" size={24} color="#11B5CF" style={{ marginRight: 8 }} />
                  <Text className="text-lg font-bold text-[#11B5CF]">Diet</Text>
                </View>
                <Text className="text-sm text-gray-700 leading-6">{dietRecommendation}</Text>
              </View>

              {/* Sleep Recommendation */}
              <View className="p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="moon-outline" size={24} color="#11B5CF" style={{ marginRight: 8 }} />
                  <Text className="text-lg font-bold text-[#11B5CF]">Sleep</Text>
                </View>
                <Text className="text-sm text-gray-700 leading-6">{sleepRecommendation}</Text>
              </View>
            </View>

            {/* Call to Action */}
            <View className="bg-[#11B5CF] p-4 rounded-lg mb-6">
              <Text className="text-white text-center text-sm font-semibold">
                Save your progress and unlock personalized plans!
              </Text>
              <View className="mt-4">
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Result;