import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      // Handle sign up logic here
      console.log('Sign up data:', formData);
    }
  };

  const handleGoogleSignUp = () => {
    // Handle Google sign up
    console.log('Google sign up');
  };

  const handleFacebookSignUp = () => {
    // Handle Facebook sign up
    console.log('Facebook sign up');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mt-8 mb-8">
            <Text className="text-2xl font-bold text-gray-800 text-center">
              Create Account
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Sign up to get started
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            {/* Full Name */}
            <View>
              <TextInput
                className={`w-full h-14 px-4 border-2 rounded-xl bg-gray-50 text-gray-800 ${
                  errors.fullName ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                autoCapitalize="words"
              />
              {errors.fullName && (
                <Text className="text-red-500 text-sm mt-1 ml-2">
                  {errors.fullName}
                </Text>
              )}
            </View>

            {/* Email */}
            <View>
              <TextInput
                className={`w-full h-14 px-4 border-2 rounded-xl bg-gray-50 text-gray-800 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1 ml-2">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Phone Number */}
            <View>
              <View className={`flex-row w-full h-14 border-2 rounded-xl bg-gray-50 ${
                errors.phoneNumber ? 'border-red-400' : 'border-gray-200'
              }`}>
                <View className="flex-row items-center px-3 border-r border-gray-200">
                  <Text className="text-gray-800 font-medium">
                    {formData.countryCode}
                  </Text>
                </View>
                <TextInput
                  className="flex-1 px-3 text-gray-800"
                  placeholder="Phone number"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phoneNumber && (
                <Text className="text-red-500 text-sm mt-1 ml-2">
                  {errors.phoneNumber}
                </Text>
              )}
            </View>

            {/* Password */}
            <View>
              <TextInput
                className={`w-full h-14 px-4 border-2 rounded-xl bg-gray-50 text-gray-800 ${
                  errors.password ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-2">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <TextInput
                className={`w-full h-14 px-4 border-2 rounded-xl bg-gray-50 text-gray-800 ${
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-2">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>
          </View>

          {/* Illustration */}
          <View className="items-center my-8">
            <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center">
              {/* You can replace this with your actual illustration */}
              <View className="w-16 h-16 bg-teal-500 rounded-full items-center justify-center">
                <Text className="text-white text-2xl font-bold">+</Text>
              </View>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className="w-full h-14 bg-teal-500 rounded-xl items-center justify-center mb-4"
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold">
              SIGN UP
            </Text>
          </TouchableOpacity>

          {/* Social Login Buttons */}
          <TouchableOpacity
            className="w-full h-14 bg-white border-2 border-gray-200 rounded-xl items-center justify-center mb-4 flex-row"
            onPress={handleGoogleSignUp}
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-lg font-semibold ml-2">
              SIGN UP WITH GOOGLE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-14 bg-blue-600 rounded-xl items-center justify-center mb-6 flex-row"
            onPress={handleFacebookSignUp}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold ml-2">
              SIGN UP WITH FACEBOOK
            </Text>
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <View className="items-center mb-6">
            <Text className="text-gray-500 text-sm text-center">
              By signing up to HealthSync, you agree to our{' '}
              <Text className="text-teal-500 underline">Terms</Text>
              {' '}and{' '}
              <Text className="text-teal-500 underline">Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign In Link */}
          <View className="items-center mb-8">
            <Text className="text-gray-500 text-base">
              Already have an account?{' '}
              <Text className="text-teal-500 font-semibold">Sign In</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpPage;