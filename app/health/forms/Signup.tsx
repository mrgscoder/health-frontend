import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import BASE_URL from "../../../src/config";
import { saveUserHealthData, HealthData } from "../../utils/authUtils";

// TypeScript types for form data and errors
interface FormData {
  email: string;
  password: string;
  verificationCode: string;
}
interface FormErrors {
  email?: string;
  password?: string;
  verificationCode?: string;
}



const SignUpPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState<FormData>({
    email: '',
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
  const [healthData, setHealthData] = useState<HealthData>(() => {
    // Initialize health data directly from params
    const extractedHealthData = {
      name: params.name as string,
      age: params.age as string,
      gender: params.gender as string,
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

    // Set user name from health data
    if (extractedHealthData.name) {
      setUserName(extractedHealthData.name);
    } else {
      // Try to get from AsyncStorage asynchronously
      AsyncStorage.getItem('userFullName').then(storedName => {
        if (storedName) {
          setUserName(storedName);
        }
      });
    }



    console.log('✅ Signup.tsx - Initialized health data:', extractedHealthData);
    console.log('📊 All params received:', params);
    console.log('👤 User name set to:', extractedHealthData.name);

    
    return extractedHealthData;
  });

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
      const response = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
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
      const response = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
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
      // Step 1: Call the register API with health data
      const registerData = {
        name: userName,
        email: formData.email,
        password: formData.password
      };

      // Add health data if available
      console.log('🔍 Health data available:', healthData);
      console.log('🔍 Health data keys:', Object.keys(healthData));
      console.log('🔍 Health data name:', healthData.name);
      
      if (Object.keys(healthData).length > 0 && healthData.name) {
        console.log('✅ Adding health data to registration request');
        Object.assign(registerData, {
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
        });
      } else {
        console.log('❌ Health data not available or incomplete');
      }
      
      console.log('📤 Final registration data:', registerData);

      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);

      if (registerResponse.status === 201) {
        const user = registerResponse.data.user;
        const userId = user.user_id;

        // Save user's full name to AsyncStorage
        await AsyncStorage.setItem('userFullName', userName);
        
        // Save all health data to AsyncStorage
        if (Object.keys(healthData).length > 0) {
          await saveUserHealthData(healthData);
        }
        
        // If the API returns a token, save it
        if (registerResponse.data.token) {
          await AsyncStorage.setItem('userToken', registerResponse.data.token);
          await AsyncStorage.setItem('token', registerResponse.data.token);
        }
        
        // Health data is now saved during registration process
        console.log('Health data included in registration request');
        
        // Navigate directly to main app without showing success alert
        router.push('/navigation/tabs/HomePage');
      } else {
        alert('Registration failed: ' + (registerResponse.data?.message || 'Unknown error'));
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
        <ScrollView
          className="flex-1 p-6"
          contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white rounded-3xl p-6 shadow-lg w-full max-w-sm self-center" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}>
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Account</Text>
          <Text className="text-base text-xs text-gray-500 mb-6 text-center">Join us and start your journey today!</Text>



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
              otpSent ? 'bg-[#daf66e]' : 'bg-[#11B5CF]'
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
                  codeVerified ? 'bg-[#daf66e]' : 'bg-[#11B5CF]'
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
            className="bg-[#11B5CF] h-14 rounded-2xl items-center justify-center mt-4 mb-4 w-full shadow-lg" 
            onPress={handleSignUp} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>



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
    </LinearGradient>
  );
};

export default SignUpPage;