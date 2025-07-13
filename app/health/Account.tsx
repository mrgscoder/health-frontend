import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Account = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-8">
        <TouchableOpacity>
          
        </TouchableOpacity>
        <Text className="text-black text-2xl font-medium text-center mt-9">Enter your details</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-4">
        {/* Email Input */}
        <View className="mb-4">
          <TextInput
            className="w-full px-4 py-3 bg-white text-black rounded-lg border border-black"
            placeholder="Email address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View className="mb-4 relative">
          <TextInput
            className="w-full px-4 py-3 pr-12 bg-white text-black rounded-lg border border-black"
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setShowPassword(!showPassword)}
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
          <TouchableOpacity>
            <Text className="text-blue-400 text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Image in Center */}
        <View className="items-center mb-8 mt-8">
          <Image
            source={require('../../assets/images/account.png')}
            className="w-56 h-56"
            resizeMode="contain"
          />
          <Text className="text-center text-gray-600 mt-4 px-6 text-lg italic">
            Your health is an investment, not an expense. Take care of your body, it's the only place you have to live.
          </Text>
        </View>

        {/* Sign In Button */}
        <View className="items-center">
          <TouchableOpacity className="w-full py-3 mb-8 bg-[#0cb6ab] rounded-3xl">
            <Text className="text-white text-center font-medium">SIGN IN</Text>
          </TouchableOpacity>
        </View>

        {/* Social Sign In Buttons */}
        <View>
          


       
        </View>

        {/* Terms */}
        <Text className="text-gray-400 text-center text-xs mt-8 leading-5">
          By signing in to HealthSync, you agree to our{' '}
          <Text className="text-blue-400">Terms</Text> and{' '}
          <Text className="text-blue-400">Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
};

export default Account;