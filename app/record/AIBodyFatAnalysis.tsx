import LottieView from 'lottie-react-native';
import { Camera, Check, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
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
  const snackbarTimeoutRef = useRef<number | null>(null);
  
  const router = useRouter();

  // Auto-hide snackbar after 3 seconds with cleanup
  useEffect(() => {
    if (snackbar.visible) {
      snackbarTimeoutRef.current = setTimeout(() => {
        setSnackbar(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
    
    return () => {
      if (snackbarTimeoutRef.current) {
        clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, [snackbar.visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) {
        clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, []);

  // Reset analysis state helper
  const resetAnalysisState = () => {
    setShowResults(false);
    setCalculationResult(null);
    setShowLottieAnimation(false);
    setImageLoading(false);
  };

  // Categorize body fat percentage
  const categorizeBodyFat = (bodyFat: number | undefined, gender: 'male' | 'female') => {
    console.log('Categorizing body fat:', { bodyFat, gender });
    
    if (!bodyFat || isNaN(bodyFat) || typeof bodyFat !== 'number') {
      console.log('Invalid body fat value:', bodyFat);
      return { 
        category: 'Invalid', 
        color: '#f3f4f6', 
        textColor: '#6b7280' 
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
    
    return result;
  };

  // Convert image to base64 using expo-file-system for better React Native support
  const convertToBase64 = async (uri: string): Promise<string> => {
    try {
      // Check if it's already base64
      if (uri.startsWith('data:image')) {
        return uri.split(',')[1] || uri;
      }
      
      // Use FileSystem for React Native
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to convert image to base64');
    }
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
        resetAnalysisState();
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
        resetAnalysisState();
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

    // Reset animation state and start fresh
    setShowLottieAnimation(false);
    setImageLoading(true);
    
    // Small delay to ensure state is reset
    setTimeout(() => {
      setShowLottieAnimation(true);
    }, 100);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSnackbar({ visible: true, message: 'Authentication required.', error: true });
        return;
      }

      // Validate image file exists (for local URIs)
      if (!selectedImage.startsWith('data:image')) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(selectedImage);
          if (!fileInfo.exists) {
            throw new Error('Selected image file no longer exists');
          }
        } catch (fileError) {
          setSnackbar({ visible: true, message: 'Selected image is no longer available. Please select another image.', error: true });
          return;
        }
      }

      // Convert image to base64 using improved method
      const base64Data = await convertToBase64(selectedImage);

      // Validate base64 data
      if (!base64Data) {
        throw new Error('Failed to process image');
      }

      const requestData = {
        imageBase64: base64Data,
        imageName: `ai_analysis_${Date.now()}.jpg`
      };

      console.log('Sending AI analysis request:', {
        imageLength: base64Data.length,
        imageName: requestData.imageName
      });

      // Add timeout to axios request
      const response = await axios.post(
        `${BASE_URL}/api/ai-bodyfat/analyze`,
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('AI analysis response:', response.data);

      if (response.data.success) {
        const result = response.data.data;
        
        console.log('Raw AI result:', result);
        const categoryResult = categorizeBodyFat(result.bodyFatPercentage, result.gender);
        console.log('Category result:', categoryResult);
        
        const calculationData: CalculationResult = {
          bodyFat: Number(result.bodyFatPercentage) || 0,
          bmi: 0,
          category: categoryResult.category || 'Unknown',
          color: categoryResult.color || '#f3f4f6',
          textColor: categoryResult.textColor || '#6b7280'
        };
        
        console.log('Setting calculation result:', calculationData);
        setCalculationResult(calculationData);
        setShowResults(true);
        setSnackbar({ visible: true, message: 'Analysis completed successfully!', error: false });
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('AI analysis error:', error);
      let errorMessage = 'AI analysis failed. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your connection and try again.';
        } else if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          if (status === 400) {
            if (errorData?.error === 'Image not recognized as human') {
              errorMessage = 'The image does not appear to contain a human. Please upload a clear photo of a person.';
            } else {
              errorMessage = errorData?.error || 'Invalid request data.';
            }
          } else if (status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (status === 413) {
            errorMessage = 'Image file is too large. Please select a smaller image.';
          } else if (status === 500) {
            errorMessage = errorData?.error || 'Server error. Please try again later.';
          } else {
            errorMessage = errorData?.error || 'Request failed.';
          }
        } else if (error.request) {
          errorMessage = 'Network error. Please check your connection.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ visible: true, message: errorMessage, error: true });
    } finally {
      setImageLoading(false);
      setShowLottieAnimation(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    resetAnalysisState();
    setSnackbar({ visible: true, message: 'Image removed successfully!', error: false });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Body Fat Analysis</Text>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Upload Your Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Take a full body photo or select from your gallery for AI analysis
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={takePhoto}
                disabled={imageLoading}
              >
                <Camera size={32} color="#0b0b0b" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={pickImage}
                disabled={imageLoading}
              >
                <ImageIcon size={32} color="#0b0b0b" />
                <Text style={styles.uploadButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Image Display */}
          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} resizeMode="contain" />
              
              {/* Lottie Animation Overlay */}
              {showLottieAnimation && (
                <View style={styles.lottieOverlay}>
                  <LottieView
                    ref={lottieRef}
                    source={require('../assets/lottie/body.json')}
                    style={{ width: 384, height: 500 }}
                    autoPlay={true}
                    loop={false}
                    onAnimationFinish={() => setShowLottieAnimation(false)}
                  />
                </View>
              )}
              
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={[styles.actionButton, imageLoading && styles.disabledButton]}
                  onPress={analyzeImageWithAI}
                  disabled={imageLoading}
                >
                  <Text style={[styles.actionButtonText, imageLoading && styles.disabledText]}>
                    {imageLoading ? 'Analyzing...' : 'Analyze with AI'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, imageLoading && styles.disabledButton]}
                  onPress={removeImage}
                  disabled={imageLoading}
                >
                  <Text style={[styles.actionButtonText, imageLoading && styles.disabledText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* AI Analysis Results Display */}
          {showResults && calculationResult && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Check size={20} color="#16a34a" />
                <Text style={styles.resultsTitle}>Analysis Complete!</Text>
              </View>
              <View style={styles.resultsContent}>
                <Text style={styles.resultsText}>
                  Your body fat percentage is:
                </Text>
                <Text style={styles.bodyFatValue}>
                  {calculationResult.bodyFat.toFixed(1)}%
                </Text>
                <View 
                  style={[styles.categoryContainer, { backgroundColor: calculationResult.color }]}
                >
                  <Text 
                    style={[styles.categoryText, { color: calculationResult.textColor }]}
                  >
                    {calculationResult.category}
                  </Text>
                </View>
                <Text style={styles.analysisNote}>
                  Analysis completed using AI technology
                </Text>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to get accurate results:</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Check size={20} color="#16a34a" />
                <Text style={styles.instructionText}>Take a full body photo in good lighting</Text>
              </View>
              <View style={styles.instructionItem}>
                <Check size={20} color="#16a34a" />
                <Text style={styles.instructionText}>Wear fitted clothing or swimwear</Text>
              </View>
              <View style={styles.instructionItem}>
                <Check size={20} color="#16a34a" />
                <Text style={styles.instructionText}>Stand straight with arms slightly away from body</Text>
              </View>
              <View style={styles.instructionItem}>
                <Check size={20} color="#16a34a" />
                <Text style={styles.instructionText}>Ensure the entire body is visible in the frame</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Snackbar */}
      {snackbar.visible && (
        <View style={[
          styles.snackbar,
          snackbar.error ? styles.snackbarError : styles.snackbarSuccess
        ]}>
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3CCE3',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  uploadSection: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#afa0cfff',
    backgroundColor: '#ffffff',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#afa0cfff',
    backgroundColor: 'transparent',
    width: 96,
    height: 96,
  },
  uploadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b0b0b',
    textAlign: 'center',
    marginTop: 4,
  },
  imageContainer: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#afa0cfff',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  selectedImage: {
    width: '100%',
    height: 320,
  },
  lottieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#afa0cfff',
  },
  actionButton: {
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#afa0cfff',
  },
  actionButtonText: {
    color: '#0b0b0b',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#d1d5db',
  },
  disabledText: {
    color: '#9ca3af',
  },
  resultsContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#afa0cfff',
    backgroundColor: '#ffffff',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  resultsContent: {
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  bodyFatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  analysisNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#afa0cfff',
    backgroundColor: '#ffffff',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginLeft: 12,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  snackbarError: {
    backgroundColor: '#dc2626',
  },
  snackbarSuccess: {
    backgroundColor: '#16a34a',
  },
  snackbarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});