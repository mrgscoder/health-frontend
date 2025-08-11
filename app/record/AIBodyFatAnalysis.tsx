import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Camera, Image as ImageIcon, Check, AlertCircle } from 'lucide-react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import BASE_URL from '../../src/config';

interface CalculationResult {
  bodyFat: number;
  bmi: number;
  category: string;
  color: string;
  textColor: string;
} 

export default function AIBodyFatAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false); 
  const [showLottieAnimation, setShowLottieAnimation] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  
  const router = useRouter();

  // Categorize body fat percentage
  const categorizeBodyFat = (bodyFat: number | undefined, gender: 'male' | 'female') => {
    console.log('Categorizing body fat:', { bodyFat, gender });
    
    if (!bodyFat || isNaN(bodyFat) || typeof bodyFat !== 'number') {
      console.log('Invalid body fat value:', bodyFat);
      return { 
        category: String('Invalid'), 
        color: String('#f3f4f6'), 
        textColor: String('#6b7280') 
      };
    }
    
    let result;
    if (gender === 'male') {
      if (bodyFat < 6) {
        result = { category: 'Essential Fat', color: '#bfdbfe', textColor: '#1d4ed8' };
      } else if (bodyFat < 14) {
        result = { category: 'Athletes', color: '#bbf7d0', textColor: '#15803d' };
      } else if (bodyFat < 18) {
        result = { category: 'Fitness', color: '#dcfce7', textColor: '#16a34a' };
      } else if (bodyFat < 25) {
        result = { category: 'Average', color: '#fef3c7', textColor: '#a16207' };
      } else if (bodyFat < 32) {
        result = { category: 'Above Average', color: '#fed7aa', textColor: '#c2410c' };
      } else {
        result = { category: 'Obese', color: '#fecaca', textColor: '#b91c1c' };
      }
    } else {
      if (bodyFat < 14) {
        result = { category: 'Essential Fat', color: '#bfdbfe', textColor: '#1d4ed8' };
      } else if (bodyFat < 21) {
        result = { category: 'Athletes', color: '#bbf7d0', textColor: '#15803d' };
      } else if (bodyFat < 25) {
        result = { category: 'Fitness', color: '#dcfce7', textColor: '#16a34a' };
      } else if (bodyFat < 32) {
        result = { category: 'Average', color: '#fef3c7', textColor: '#a16207' };
      } else if (bodyFat < 38) {
        result = { category: 'Above Average', color: '#fed7aa', textColor: '#c2410c' };
      } else {
        result = { category: 'Obese', color: '#fecaca', textColor: '#b91c1c' };
      }
    }
    
    return {
      category: String(result.category),
      color: String(result.color),
      textColor: String(result.textColor)
    };
  };

  // Image picker functions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select photos.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowResults(false);
        setCalculationResult(null);
        setSnackbar({ visible: true, message: 'Photo captured successfully!', error: false });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setSnackbar({ visible: true, message: 'Failed to take photo. Please try again.', error: true });
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowResults(false);
        setCalculationResult(null);
        setSnackbar({ visible: true, message: 'Image selected successfully!', error: false });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setSnackbar({ visible: true, message: 'Failed to select image. Please try again.', error: true });
    }
  };

  const analyzeImageWithAI = async () => {
    if (!selectedImage) {
      setSnackbar({ visible: true, message: 'No image selected for analysis.', error: true });
      return;
    }

    setShowLottieAnimation(true);
    console.log('Showing Lottie animation');

    setImageLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSnackbar({ visible: true, message: 'Authentication required.', error: true });
        setImageLoading(false);
        return;
      }

      // Convert image to base64
      let imageBase64: string;
      if (selectedImage.startsWith('data:image')) {
        imageBase64 = selectedImage;
      } else {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const reader = new FileReader();
        
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const base64Data = imageBase64.split(',')[1] || imageBase64;

      const requestData = {
        imageBase64: base64Data,
        imageName: `ai_analysis_${Date.now()}.jpg`
      };

      console.log('Sending AI analysis request:', {
        imageLength: base64Data.length,
        imageName: requestData.imageName
      });

      const response = await axios.post(
        `${BASE_URL}/api/ai-bodyfat/analyze`,
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('AI analysis response:', response.data);

      if (response.data.success) {
        const result = response.data.data;
        
        console.log('Raw AI result:', result);
        const categoryResult = categorizeBodyFat(result.bodyFatPercentage, result.gender);
        console.log('Category result:', categoryResult);
        
        const calculationData = {
          bodyFat: Number(result.bodyFatPercentage) || 0,
          bmi: 0,
          category: String(categoryResult.category || 'Unknown'),
          color: String(categoryResult.color || '#f3f4f6'),
          textColor: String(categoryResult.textColor || '#6b7280')
        };
        console.log('Setting calculation result:', calculationData);
        setCalculationResult(calculationData);
        setShowResults(true);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('AI analysis error:', error);
      let errorMessage = 'AI analysis failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.error === 'Image not recognized as human') {
            errorMessage = 'The image does not appear to contain a human. Please upload a clear photo of a person.';
          } else {
            errorMessage = error.response.data?.error || 'Invalid request data.';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.error || 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.error || 'Request failed.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Check your connection.';
      }
      
      setSnackbar({ visible: true, message: errorMessage, error: true });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#e3f2fd', '#fce4ec']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header */}
          <View className="flex-row items-center justify-center mt-6 mb-2 p-4 rounded-lg" style={{ backgroundColor: '#d2ff71' }}>
            <Activity className="w-6 h-6 text-[#00b8f1] mr-8" />
            <Text className="text-2xl font-bold text-gray-800">AI Body Fat Analysis</Text>
          </View>

          {/* Upload Section */}
          <View className="m-2 p-6 rounded-2xl border border-black">
            <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">Upload Your Photo</Text>
            <Text className="text-gray-600 mb-6 text-center">
              Take a full body photo or select from your gallery for AI analysis
            </Text>
            
            <View className="flex-row justify-around items-center">
              <TouchableOpacity 
                className="items-center justify-center p-3 rounded-full border-2 border-black w-24 h-24 mx-2"
                style={{ backgroundColor: '#ffffff' }}
                onPress={takePhoto}
              >
                <Camera className="w-8 h-8 text-black mb-1" />
                <Text className="text-sm font-semibold text-black text-center">Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="items-center justify-center p-3 rounded-full border-2 border-black w-24 h-24 mx-2"
                style={{ backgroundColor: '#ffffff' }}
                onPress={pickImage}
              >
                <ImageIcon className="w-8 h-8 text-black mb-1" />
                <Text className="text-sm font-semibold text-black text-center">Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Image Display */}
          {selectedImage && (
            <View className="m-4 rounded-2xl border border-black overflow-hidden bg-gray-100">
              <Image source={{ uri: selectedImage }} className="w-full h-80" resizeMode="contain" />
              
              {/* Lottie Animation Overlay */}
              {showLottieAnimation && (
                <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-50 z-10">
                  <LottieView
                    ref={lottieRef}
                    source={require('../assets/lottie/body.json')}
                    style={{ width: 384, height: 384 }}
                    autoPlay={true}
                    loop={false}
                    onAnimationFinish={() => setShowLottieAnimation(false)}
                  />
                </View>
              )}
              
              <View className="flex-row justify-around p-3 border-t border-black">
                <TouchableOpacity
                  className="rounded-xl p-3 px-4 items-center"
                  style={{ backgroundColor: '#b0b6fc' }}
                  onPress={analyzeImageWithAI}
                  disabled={imageLoading}
                >
                  <Text className="text-white text-sm font-semibold">
                    {imageLoading ? 'Analyzing...' : 'Analyze with AI'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-xl p-3 px-4 items-center"
                  style={{ backgroundColor: '#b0b6fc' }}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text className="text-white text-sm font-semibold">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* AI Analysis Results Display */}
          {showResults && calculationResult && (
            <View className="m-4 p-6 rounded-2xl border border-black">
              <View className="flex-row items-center mb-3">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <Text className="text-lg font-semibold text-gray-800">Analysis Complete!</Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-600 mb-2 text-center">
                  Your body fat percentage is:
                </Text>
                <Text className="text-4xl font-bold text-gray-800 mb-3">
                  {calculationResult.bodyFat.toFixed(1)}%
                </Text>
                <View 
                  className="rounded-lg p-3 mb-2"
                  style={{ backgroundColor: calculationResult.color }}
                >
                  <Text 
                    className="font-bold text-center text-sm"
                    style={{ color: calculationResult.textColor }}
                  >
                    {calculationResult.category}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 text-center italic">
                  Analysis completed using AI technology
                </Text>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View className="m-4 p-6 rounded-2xl border border-black mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">How to get accurate results:</Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <Text className="text-gray-600 flex-1">Take a full body photo in good lighting</Text>
              </View>
              <View className="flex-row items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <Text className="text-gray-600 flex-1">Wear fitted clothing or swimwear</Text>
              </View>
              <View className="flex-row items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <Text className="text-gray-600 flex-1">Stand straight with arms slightly away from body</Text>
              </View>
              <View className="flex-row items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <Text className="text-gray-600 flex-1">Ensure the entire body is visible in the frame</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Snackbar */}
      {snackbar.visible && (
        <View className={`absolute bottom-5 left-5 right-5 p-4 rounded-lg items-center ${
          snackbar.error ? 'bg-red-600' : 'bg-green-600'
        }`}>
          <Text className="text-white text-sm font-semibold">{snackbar.message}</Text>
        </View>
      )}
    </LinearGradient>
  );
}