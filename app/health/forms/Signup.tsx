import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// TypeScript types for form data and errors
interface FormData {
  fullName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  verificationCode: string;
}
interface FormErrors {
  fullName?: string;
  email?: string;
  gender?: string;
  verificationCode?: string;
}

const SignUpPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    gender: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'verificationCode') {
      // For demo, assume '123456' is the correct code
      setIsCodeCorrect(value === '123456');
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.verificationCode.trim()) newErrors.verificationCode = 'Verification code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Save user's full name and gender to AsyncStorage
      await AsyncStorage.setItem('userFullName', formData.fullName);
      await AsyncStorage.setItem('userGender', formData.gender);
      router.push('/(tabs)/Index');
    } catch (error) {
      alert('Error: Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1 p-6"
        contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-white rounded-3xl p-6 shadow-lg w-full max-w-sm self-center">
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Account</Text>
          <Text className="text-base text-xs text-gray-500 mb-6 text-center">Join us and start your journey today!</Text>

          {/* Full Name */}
          <View className={`flex-row items-center border-2 rounded-2xl bg-white h-14 px-4 mb-3 ${focusedField === 'fullName' ? 'border-cyan-500' : 'border-gray-200'}`}>
            <MaterialIcons name="person" size={20} color="#6b7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-700 font-medium"
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={text => handleInputChange('fullName', text)}
              autoCapitalize="words"
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {errors.fullName ? <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.fullName}</Text> : null}

          {/* Email */}
          <View className={`flex-row items-center border-2 rounded-2xl bg-white h-14 px-4 mb-3 ${focusedField === 'email' ? 'border-cyan-500' : 'border-gray-200'}`}>
            <MaterialIcons name="email" size={20} color="#6b7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-700 font-medium"
              placeholder="Email Address"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {errors.email ? <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.email}</Text> : null}

          {/* Verification Code */}
          <View className={`flex-row items-center border-2 rounded-2xl bg-white h-14 px-4 mb-3 ${focusedField === 'verificationCode' ? 'border-cyan-500' : 'border-gray-200'}`}>
            <MaterialIcons name="verified-user" size={20} color="#6b7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-700 font-medium"
              placeholder="Verification Code"
              value={formData.verificationCode}
              onChangeText={text => handleInputChange('verificationCode', text)}
              keyboardType="number-pad"
              maxLength={6}
              onFocus={() => setFocusedField('verificationCode')}
              onBlur={() => setFocusedField(null)}
            />
            {isCodeCorrect && (
              <Feather name="check-circle" size={22} color="#10b981" style={{ marginLeft: 8 }} />
            )}
          </View>
          {errors.verificationCode && errors.verificationCode !== 'Invalid verification code' ? (
            <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.verificationCode}</Text>
          ) : null}

          {/* Gender Selection */}
          <View className="mb-3">
            <Text className="font-semibold text-gray-700 mb-2">Gender</Text>
            <View className="flex-row gap-4">
              {['Male', 'Female', 'Other'].map(option => (
                <TouchableOpacity
                  key={option}
                  className="flex-row items-center mr-4"
                  onPress={() => handleInputChange('gender', option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formData.gender === option }}
                >
                  <View className="h-5 w-5 rounded-full border-2 border-cyan-500 items-center justify-center mr-1.5">
                    {formData.gender === option && (
                      <View className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                    )}
                  </View>
                  <Text className="text-gray-700 font-medium">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.gender}</Text> : null}
          </View>

          {/* Check Image */}
          <View className="items-center mb-4">
            <Image source={require('../../../assets/images/heart.jpg')} className="w-48 h-48" />
          </View>

          {/* Motivating Quote */}
          <View className="items-center mb-6">
            <Text className="text-gray-600 text-center text-sm font-medium italic leading-4">
              "Your health journey starts with a single step. Join thousands of users who have transformed their lives with our platform."
            </Text>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity 
            className="bg-cyan-500 h-14 rounded-2xl items-center justify-center mt-4 w-full shadow-lg" 
            onPress={handleSignUp} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Create Account</Text>
            )}
          </TouchableOpacity>


         

          {/* Terms */}
          <Text className="text-xs text-gray-500 text-center mt-4 leading-5">
            By creating an account, you agree to our <Text className="text-cyan-500 font-semibold">Terms of Service</Text> and <Text className="text-cyan-500 font-semibold">Privacy Policy</Text>.
          </Text>

          {/* Sign In Link */}
          <View className="items-center mt-4">
            <Text className="text-gray-500">
              Already have an account?{' '}
              <Text className="text-cyan-500 font-semibold" onPress={() => router.push('/health/Account')}>Sign In</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpPage;