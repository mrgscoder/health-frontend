import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from "../../src/config";
import { checkAuthStatus } from '../utils/authUtils';

const Account = () => {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>({});
  const [userId, setUserId] = useState<string>('');
  const [fromSignup, setFromSignup] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const checkExistingAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        // User is already logged in, redirect to dashboard
        router.replace('/navigation/tabs/HomePage');
      }
    };
    
    checkExistingAuth();

    // Extract health data and user info from navigation params
    if (params) {
      const extractedHealthData = {
        name: params.name as string,
        height: params.height as string,
        weight: params.weight as string,
        activityLevel: params.activityLevel as string,
        sleepHours: params.sleepHours as string,
        dietPreference: params.dietPreference as string,
        stressLevel: params.stressLevel as string,
        healthGoal: params.healthGoal as string,
        bmi: params.bmi as string,
        bmiCategory: params.bmiCategory as string,
        healthScore: params.healthScore as string,
        activityRecommendation: params.activityRecommendation as string,
        dietRecommendation: params.dietRecommendation as string,
        sleepRecommendation: params.sleepRecommendation as string,
        stressRecommendation: params.stressRecommendation as string,
        roadmap: params.roadmap as string,
      };

      setHealthData(extractedHealthData);
      setUserId(params.userId as string);
      setFromSignup(params.fromSignup === 'true');
    }
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // First API call: Login
      console.log('Starting login API call...');
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password: password,
        role: 'user' // Default role
      });

      if (response.data && response.data.token) {
        console.log('Login successful, saving user data...');
        
        // Save token in both keys for consistency
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userToken', response.data.token);
        
        // Save user info
        if (response.data.user) {
          await AsyncStorage.setItem('userFullName', response.data.user.name);
          await AsyncStorage.setItem('userEmail', response.data.user.email);
          if (response.data.user.user_id) {
            await AsyncStorage.setItem('userId', response.data.user.user_id.toString());
          }
        }

        // Second API call: User form (only if coming from signup and we have health data)
        if (fromSignup && Object.keys(healthData).length > 0) {
          console.log('Login completed, now calling user-form API...');
          console.log('Attempting to save health data:', {
            fromSignup,
            healthDataKeys: Object.keys(healthData),
            userId,
            loginResponseUser: response.data.user
          });
          
          try {
            // Use the user_id from the login response
            const currentUserId = response.data.user?.user_id || userId;
            
            console.log('Using user ID for health data save:', currentUserId);
            
            if (currentUserId) {
              console.log('Making user-form API call...');
              
              // Get the authentication token
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                console.warn('No authentication token available');
                return;
              }
              
              const userFormResponse = await axios.post(`${BASE_URL}/api/user-form/user-form`, {
                name: healthData.name,
                age: healthData.age,
                gender: healthData.gender,
                height: healthData.height,
                weight: healthData.weight,
                bmi: healthData.bmi,
                activityLevel: healthData.activityLevel,
                sleepHours: healthData.sleepHours,
                dietPreference: healthData.dietPreference,
                healthGoal: healthData.healthGoal,
                stressLevel: healthData.stressLevel,
                healthScore: healthData.healthScore
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log('User form saved successfully:', userFormResponse.data);
            } else {
              console.warn('No user ID available for saving health data');
            }
          } catch (userFormError: any) {
            console.error('Error saving user form:', userFormError);
            console.error('Error details:', userFormError.response?.data);
            // Don't fail the login if user form save fails
            Alert.alert('Warning', 'Login successful but failed to save health data. You can update it later.');
          }
        } else {
          console.log('Skipping health data save:', {
            fromSignup,
            hasHealthData: Object.keys(healthData).length > 0
          });
        }
        
        console.log('All API calls completed, showing success alert...');
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => router.push('/navigation/tabs/HomePage')
          }
        ]);
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Login failed. Please check your credentials and try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        
        <ScrollView className="flex-1 p-5" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          {/* White rounded container for the signin form */}
          <View className="bg-white rounded-3xl p-6 shadow-lg" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity>
                
              </TouchableOpacity>
              <Text className="text-black text-2xl font-medium text-center">Enter your details</Text>
              <View className="w-6" />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <TextInput
                className="w-full px-4 py-3 bg-white text-black rounded-lg border border-gray-300"
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-4 relative">
              <TextInput
                className="w-full px-4 py-3 pr-12 bg-white text-black rounded-lg border border-gray-300"
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-4 top-3"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <View className="items-end mb-6">
              <TouchableOpacity onPress={() => router.push('/health/forgot')} disabled={isLoading}>
                <Text className="text-blue-400 text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <View className="items-center">
              <TouchableOpacity 
                className={`w-full py-3 mb-6 rounded-3xl ${isLoading ? 'bg-gray-400' : 'bg-[#11B5CF]'}`}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-medium">
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Motivational Quote */}
            <View className="items-center mb-6">
              <Text className="text-center text-gray-600 px-4 text-sm italic leading-5">
                "Your health is an investment, not an expense. Take care of your body, it's the only place you have to live."
              </Text>
            </View>

            {/* Social Sign In Buttons */}
            <View>
              


           

            </View>

            {/* Terms */}
            <Text className="text-gray-400 text-center text-xs mt-6 leading-5">
              By signing in to HealthSync, you agree to our{' '}
              <Text className="text-blue-400">Terms</Text> and{' '}
              <Text className="text-blue-400">Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Account;