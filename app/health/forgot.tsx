import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsCodeSent(true);
      setIsLoading(false);
      Alert.alert('Success', 'Verification code sent to your email');
    }, 1500);
  };

  const handleResetPassword = async () => {
    if (!email || !verificationCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Password reset link sent to your email');
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-8">
        <View className="w-6" />
        <Text className="text-black text-2xl font-medium text-center mt-2">Forgot Password</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-4">
        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 text-sm mb-2 font-medium">Email Address</Text>
          <TextInput
            className="w-full px-4 py-3 bg-white text-black rounded-lg border border-black"
            placeholder="Enter your email address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isCodeSent}
          />
        </View>

        {/* Send Code Button */}
        {!isCodeSent && (
          <TouchableOpacity 
            className={`w-full py-3 mb-6 rounded-3xl ${isLoading ? 'bg-gray-400' : 'bg-[#0cb6ab]'}`}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-medium">
              {isLoading ? 'SENDING...' : 'SEND VERIFICATION CODE'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Verification Code Input - Only show after code is sent */}
        {isCodeSent && (
          <View className="mb-4">
            <Text className="text-gray-700 text-sm mb-2 font-medium">Verification Code</Text>
            <TextInput
              className="w-full px-4 py-3 bg-white text-black rounded-lg border border-black"
              placeholder="Enter verification code"
              placeholderTextColor="#9ca3af"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
            />
            <Text className="text-gray-500 text-xs mt-1">
              We've sent a 6-digit code to {email}
            </Text>
          </View>
        )}

        {/* Resend Code */}
        {isCodeSent && (
          <View className="items-end mb-6">
            <TouchableOpacity onPress={handleSendCode}>
              <Text className="text-blue-400 text-sm">Resend Code?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image in Center */}
        <View className="items-center mb-8 mt-8">
          <Image
            source={require('../../assets/images/account.png')}
            className="w-56 h-56"
            resizeMode="contain"
          />
          <Text className="text-center text-gray-600 mt-4 px-6 text-lg italic">
            Don't worry, we'll help you reset your password and get back to taking care of your health.
          </Text>
        </View>

        {/* Reset Password Button - Only show after code is sent */}
        {isCodeSent && (
          <View className="items-center">
            <TouchableOpacity 
              className={`w-full py-3 mb-8 rounded-3xl ${isLoading ? 'bg-gray-400' : 'bg-[#0cb6ab]'}`}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-medium">
                {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to Sign In */}
        <View className="items-center mb-4">
          <TouchableOpacity onPress={() => router.push('/health/Account')}>
            <Text className="text-blue-400 text-sm">Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text className="text-gray-400 text-center text-xs mt-4 leading-5">
          By using password reset, you agree to our{' '}
          <Text className="text-blue-400">Terms</Text> and{' '}
          <Text className="text-blue-400">Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
};

export default ForgotPassword;