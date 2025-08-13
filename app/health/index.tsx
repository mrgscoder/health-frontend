import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { checkAuthStatus } from '../utils/authUtils';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

// Heart animation JSON path: assets/lottie/heart.json

const WelcomeScreen = () => {
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication status...');
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        console.log('✅ User is authenticated, redirecting to dashboard');
        // User is already logged in, redirect to dashboard
        router.replace('/navigation/tabs');
      } else {
        console.log('❌ User is not authenticated, staying on welcome screen');
      }
    };
    
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    router.push('/health/forms/Inform');
  };

  const handleAlreadyHaveAccount = async () => {
    console.log('🔍 User clicked "I Already Have an Account"');
    // Check if user is already authenticated
    const isAuthenticated = await checkAuthStatus();
    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to dashboard');
      // User is already logged in, redirect to dashboard
      router.replace('/navigation/tabs');
    } else {
      console.log('❌ User is not authenticated, going to Account page');
      // User needs to login, go to Account page
      router.push('/health/Account');
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
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View className="flex-1 items-center px-6 pt-10 pb-8">

          {/* App Name - At the top */}
          <View className="items-center mb-8 mt-6">
            <Text className="text-white font-serif text-4xl">HealthSync</Text>
          </View>

          {/* Heart Animation - Moved higher and larger */}
          <View className="flex-1 justify-center items-center w-full">
            <LottieView
              source={require('../assets/lottie/heart.json')}
              autoPlay
              loop
              style={{ width: 500, height: 500, marginLeft: -20 }}
            />
          </View>

          {/* Buttons */}
          <View className="w-full mt-8">
            <TouchableOpacity
              onPress={handleGetStarted}
              className="bg-[#11B5CF] rounded-full py-4 mb-4 shadow-md"
              activeOpacity={0.9}
            >
              <Text className="text-white text-lg font-semibold text-center">
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAlreadyHaveAccount}
              className="border border-[#11B5CF] rounded-full py-3"
              activeOpacity={0.8}
            >
              <Text className="text-[#11B5CF] text-base font-semibold text-center">
                I Already Have an Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WelcomeScreen; 