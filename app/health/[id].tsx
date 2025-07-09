import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image } from 'react-native';
import { router } from 'expo-router';

const WelcomeScreen = () => {
  const handleGetStarted = () => {
    router.push('/health/forms/MultiStepForm');
  };

  const handleAlreadyHaveAccount = () => {
    router.push('/health/Account'); // navigate to Account.tsx in the forms folder
  };

  return (
    <View className="flex-1 bg-[#0cb6ab]">
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Main Container */}
      <View className="flex-1 justify-between items-center px-8 pt-20">
        
        {/* Logo and Text */}
        <View className="flex-1 justify-center items-center">
          <Image
            source={require('../../assets/images/icon.png')}
            className="w-80 h-80"
            resizeMode="contain"
          />
           <Text className="text-black font-bold font-serif text-3xl text-center mt-4">
            HealthSync
          </Text>
          <Text className="text-black text-md text-center mt-4">
            Kickstart your journey to a{'\n'} stronger, healthier you! {'\n'}
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full mb-20">
          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-[#dffd6e] rounded-full py-4 mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-black text-md font-bold text-center">
              GET STARTED
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAlreadyHaveAccount}
            className="border border-[#dffd6e] rounded-full py-4"
            activeOpacity={0.8}
          >
            <Text className="text-[#dffd6e] text-md font-bold text-center">
              I ALREADY HAVE AN ACCOUNT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;
