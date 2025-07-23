import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const WelcomeScreen = () => {
  const handleGetStarted = () => {
    router.push('/health/forms/Inform');
  };

  const handleAlreadyHaveAccount = () => {
    router.push('/health/Account');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="flex-1 justify-between items-center px-6 pt-10 pb-8">

        {/* Logo and App Name */}
        <View className="items-center">
          <Image
            source={require('../../assets/images/leaf.png')}
            style={{ width: 150, height: 150, marginBottom: 16 }}
            resizeMode="stretch"
          />
          <Text className="text-[#11B5CF] font-bold text-3xl ">HealthMed Pro</Text>
        </View>

        {/* Illustration */}
        <View className="flex-1 justify-center items-center ">
          <Image
            source={require('../../assets/images/icon.png')}
            className="w-150 h-150"
            resizeMode="contain"
          />
        </View>

        {/* Buttons */}
        <View className="w-full">
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
  );
};

export default WelcomeScreen;
