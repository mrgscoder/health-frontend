import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

// TypeScript types for form data and errors
interface FormData {
  email: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  password: string;
  verificationCode: string;
}
interface FormErrors {
  email?: string;
  gender?: string;
  password?: string;
  verificationCode?: string;
}

const SignUpPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    gender: '',
    password: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Get name from params or AsyncStorage
  useEffect(() => {
    const getName = async () => {
      try {
        // First try to get name from route params
        const nameFromParams = params.name as string;
        if (nameFromParams) {
          setUserName(nameFromParams);
          return;
        }
        
        // Fallback to AsyncStorage
        const storedName = await AsyncStorage.getItem('userFullName');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.log('Error getting name:', error);
      }
    };
    
    getName();
  }, [params.name]);

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

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required to send OTP' }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await axios.post('http://192.168.1.16:5001/api/auth/send-otp', {
        email: formData.email,
      });
      if (response.data && response.data.message) {
        setOtpSent(true);
        setErrors(prev => ({ ...prev, email: '' }));
      } else if (response.data && response.data.error) {
        setErrors(prev => ({ ...prev, email: response.data.error }));
      } else {
        setErrors(prev => ({ ...prev, email: 'Failed to send OTP' }));
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        email: error?.response?.data?.error || 'Failed to send OTP. Please try again.',
      }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      setErrors(prev => ({ ...prev, verificationCode: 'Verification code is required' }));
      return;
    }
    setIsVerifyingCode(true);
    try {
      // Call backend API to verify OTP
      const response = await axios.post('http://192.168.1.16:5001/api/auth/verify-otp', {
        email: formData.email,
        otp: formData.verificationCode,
      });
      if (response.data && response.data.message) {
        setCodeVerified(true);
        setErrors(prev => ({ ...prev, verificationCode: '' }));
      } else if (response.data && response.data.error) {
        setErrors(prev => ({ ...prev, verificationCode: response.data.error }));
      } else {
        setErrors(prev => ({ ...prev, verificationCode: 'Failed to verify code' }));
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        verificationCode: error?.response?.data?.error || 'Failed to verify code. Please try again.',
      }));
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!userName.trim()) newErrors.email = 'Name is required. Please complete the health assessment first.';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!otpSent) newErrors.email = 'Please send OTP first';
    if (!codeVerified) newErrors.verificationCode = 'Please verify your code first';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Call the register API
      const response = await axios.post('http://192.168.1.16:5001/api/auth/register', {
        name: userName,
        email: formData.email,
        password: formData.password
      });

      if (response.status === 201) {
        // Save user's full name and gender to AsyncStorage
        await AsyncStorage.setItem('userFullName', userName);
        await AsyncStorage.setItem('userGender', formData.gender);
        
        // If the API returns a token, save it
        if (response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
        }
        
        // Navigate to the main app
        router.push('/health/Account');
      } else {
        alert('Registration failed: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         'Registration failed. Please try again.';
      alert('Error: ' + errorMessage);
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

          {/* Display User Name */}
          {userName && (
            <View className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-3">
              <Text className="text-green-800 text-sm font-medium text-center">
                Welcome, {userName}! Your health assessment is complete.
              </Text>
            </View>
          )}

          {/* Email */}
          <View className={`flex-row items-center border-2 rounded-2xl bg-white h-14 px-4 mb-3 ${focusedField === 'email' ? 'border-[#11B5CF]' : 'border-gray-200'}`}>
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

          {/* Send OTP Button */}
          <TouchableOpacity
            className={`h-12 rounded-2xl items-center justify-center mb-3 w-full shadow-lg ${
              otpSent ? 'bg-green-500' : 'bg-[#11B5CF]'
            }`}
            onPress={handleSendOtp}
            disabled={isSendingOtp || otpSent}
          >
            {isSendingOtp ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <MaterialIcons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white text-base font-semibold">
                  {otpSent ? 'OTP Sent ✓' : 'Send OTP'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Verification Code - Only show after OTP is sent */}
          {otpSent && (
            <>
              <View className={`flex-row items-center border-2 rounded-2xl bg-white h-14 px-4 mb-3 ${focusedField === 'verificationCode' ? 'border-[#11B5CF]' : 'border-gray-200'}`}>
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
                {codeVerified && (
                  <Feather name="check-circle" size={22} color="#10b981" style={{ marginLeft: 8 }} />
                )}
              </View>
              {errors.verificationCode ? (
                <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.verificationCode}</Text>
              ) : null}

              {/* Verify Code Button */}
              <TouchableOpacity
                className={`h-12 rounded-2xl items-center justify-center mb-3 w-full shadow-lg ${
                  codeVerified ? 'bg-green-500' : 'bg-[#11B5CF]'
                }`}
                onPress={handleVerifyCode}
                disabled={isVerifyingCode || codeVerified}
              >
                {isVerifyingCode ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center">
                    <MaterialIcons name="verified" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-white text-base font-semibold">
                      {codeVerified ? 'Code Verified ✓' : 'Verify Code'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}

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
                  <View className="h-5 w-5 rounded-full border-2 border-[#11B5CF] items-center justify-center mr-1.5">
                    {formData.gender === option && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#11B5CF]" />
                    )}
                  </View>
                  <Text className="text-gray-700 font-medium">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.gender}</Text> : null}
          </View>

          {/* Password */}
          <View className={`flex-row items-center border-2 rounded-2xl bg-white h-14 px-4 mb-3 ${focusedField === 'password' ? 'border-[#11B5CF]' : 'border-gray-200'}`}>
            <MaterialIcons name="lock" size={20} color="#6b7280" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-gray-700 font-medium"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
              secureTextEntry={true}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {errors.password ? <Text className="text-red-500 text-sm font-medium mb-2 ml-2 self-start">{errors.password}</Text> : null}

          {/* Create Account Button */}
          <TouchableOpacity 
            className="bg-[#11B5CF] h-14 rounded-2xl items-center justify-center mt-4 w-full shadow-lg" 
            onPress={handleSignUp} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Create Account</Text>
            )}
          </TouchableOpacity>

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

          {/* Terms */}
          <Text className="text-xs text-gray-500 text-center mt-4 leading-5">
            By creating an account, you agree to our <Text className="text-[#11B5CF] font-semibold">Terms of Service</Text> and <Text className="text-[#11B5CF] font-semibold">Privacy Policy</Text>.
          </Text>

          {/* Sign In Link */}
          <View className="items-center mt-4">
            <Text className="text-gray-500">
              Already have an account?{' '}
              <Text className="text-[#11B5CF] font-semibold" onPress={() => router.push('/health/Account')}>Sign In</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpPage;