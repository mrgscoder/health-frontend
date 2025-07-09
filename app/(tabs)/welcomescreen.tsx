import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    // Navigate to your next screen
    // Replace 'NextScreen' with your actual screen name
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      
        {/* Content Container */}
        <View className="flex-1 justify-center items-center px-8">
          {/* Logo and Brand Section */}
          <View className="items-center mb-16">
            {/* Versa Logo */}
            <View className="mb-8">
              <Text className="text-white text-5xl font-light tracking-wide">
                versa
              </Text>
              <View className="flex-row items-center justify-center mt-1">
                <View className="bg-white rounded-full px-3 py-1">
                  <Text className="text-black text-xs font-medium">AI</Text>
                </View>
              </View>
            </View>

            {/* Tagline */}
            <View className="items-center">
              <Text className="text-white text-base font-light text-center leading-6">
                Real-time insights, track performance,
              </Text>
              <Text className="text-white text-base font-light text-center leading-6">
                and make smarter decisions.
              </Text>
            </View>
          </View>

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Get Started Button */}
          <View className="w-full mb-12">
            <TouchableOpacity
              onPress={handleGetStarted}
              className="bg-white rounded-full py-4 px-8 shadow-lg"
              activeOpacity={0.8}
            >
              <Text className="text-black text-lg font-medium text-center">
                Get started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      
    </View>
  );
};

export default WelcomeScreen;