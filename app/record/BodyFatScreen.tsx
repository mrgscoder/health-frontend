import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BASE_URL from '../../src/config';

interface BodyFatRecord {
  id: number;
  bodyFat: number;
  date_time: string;
  bmi: number;
  notes?: string;
}

interface CalculationResult {
  bodyFat: number;
  bmi: number;
  category: string;
  color: string;
  textColor: string;
}

export default function BodyFatScreen() {
  // Constants for input validation
  const INPUT_LIMITS = {
    MAX_LENGTH: 4,
    MIN_VALUE: 0.1,
    MAX_VALUE: 999.9,
  } as const;

  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [userGender, setUserGender] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<BodyFatRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  
  // Field-specific error states
  const [neckError, setNeckError] = useState<string>('');
  const [waistError, setWaistError] = useState<string>('');
  const [hipError, setHipError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const snackbarTimeoutRef = useRef<number | null>(null);
  
  const router = useRouter();

  const API_URL = `${BASE_URL}/api/bodyfat/calculate`;

  // Fetch user profile to get gender
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/api/user-form/user-form`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        setUserGender(response.data.data.gender);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

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

  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) {
        clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, []);

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

  // Clear individual field errors when user starts typing
  const clearNeckError = () => setNeckError('');
  const clearWaistError = () => setWaistError('');
  const clearHipError = () => setHipError('');

  // Clear all field errors
  const clearFieldErrors = () => {
    setNeckError('');
    setWaistError('');
    setHipError('');
    setFormError('');
  };

  // Enhanced input validation with field-specific error setting
  const validateInput = (value: string, fieldName: string): { isValid: boolean; error?: string } => {
    if (!value.trim()) {
      return { isValid: false, error: `${fieldName} is required` };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }

    if (numValue < INPUT_LIMITS.MIN_VALUE) {
      return { isValid: false, error: `${fieldName} must be at least ${INPUT_LIMITS.MIN_VALUE} cm` };
    }

    if (numValue > INPUT_LIMITS.MAX_VALUE) {
      return { isValid: false, error: `${fieldName} cannot exceed ${INPUT_LIMITS.MAX_VALUE} cm` };
    }

    return { isValid: true };
  };

  // Validate form and set field-specific errors
  const validateForm = (): boolean => {
    clearFieldErrors();
    
    let isValid = true;
    
    // Validate neck
    const neckValidation = validateInput(neck, 'Neck');
    if (!neckValidation.isValid) {
      setNeckError(neckValidation.error!);
      isValid = false;
    }
    
    // Validate waist
    const waistValidation = validateInput(waist, 'Waist');
    if (!waistValidation.isValid) {
      setWaistError(waistValidation.error!);
      isValid = false;
    }
    
    // Validate hip for females
    if (userGender === 'female') {
      const hipValidation = validateInput(hip, 'Hip');
      if (!hipValidation.isValid) {
        setHipError(hipValidation.error!);
        isValid = false;
      }
    }
    
    // Validate body proportions
    if (isValid && neck && waist) {
      const neckVal = parseFloat(neck);
      const waistVal = parseFloat(waist);
      
      if (waistVal <= neckVal) {
        setWaistError('Waist measurement should typically be larger than neck measurement');
        isValid = false;
      }
      
      if (userGender === 'female' && hip) {
        const hipVal = parseFloat(hip);
        if (hipVal > 0 && hipVal < waistVal) {
          setHipError('Hip measurement should typically be larger than waist measurement for females');
          isValid = false;
        }
      }
    }
    
    return isValid;
  };

  // Enhanced form submission with better validation
  const handleSubmit = async () => {
    // Validate form using new validation function
    if (!validateForm()) {
      return; // Validation errors are already set by validateForm
    }

    const neckVal = parseFloat(neck);
    const waistVal = parseFloat(waist);
    const hipVal = userGender === 'female' ? parseFloat(hip) : 0;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSnackbar({ visible: true, message: 'Authentication required. Please log in again.', error: true });
        return;
      }

      const requestData = {
        neckCm: neckVal,
        waistCm: waistVal,
        ...(userGender === 'female' && { hipCm: hipVal })
      };

      const response = await axios.post(
        API_URL,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Check if response has the expected structure
      const bodyFat = response.data.data?.bodyFat || response.data.bodyFat;
      const bmi = response.data.data?.bmi || response.data.bmi;
      
      if (!bodyFat || !bmi) {
        console.error('Invalid response structure:', response.data);
        setSnackbar({ visible: true, message: 'Invalid response from server.', error: true });
        return;
      }

      // Set calculation result
      const result = categorizeBodyFat(bodyFat, userGender as 'male' | 'female' || 'male');
      setCalculationResult({
        bodyFat: bodyFat,
        bmi: bmi,
        category: result.category,
        color: result.color,
        textColor: result.textColor
      });
      setShowResults(true);

      // Auto-hide results after 60 seconds
      setTimeout(() => setShowResults(false), 60000);

      // Success feedback
      setSnackbar({ visible: true, message: 'Body fat calculation completed and saved successfully!', error: false });

      // Clear form and errors
      setNeck('');
      setWaist('');
      setHip('');
      clearFieldErrors();
      Keyboard.dismiss();
    } catch (err: any) {
      console.error('Body fat calculation error:', err);
      let errorMessage = 'Failed to save. Try again.';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Invalid input data.';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = err.response.data?.error || 'Request failed.';
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Check your connection.';
      }
      
      setSnackbar({ visible: true, message: errorMessage, error: true });
    } finally {
      setLoading(false);
    }
  };

  // Toggle history display
  const toggleHistory = async () => {
    if (showHistory) {
      // If history is already shown, just hide it
      setShowHistory(false);
      return;
    }

    // If history is not shown, fetch and display it
    try {
      setLoadingHistory(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in to view history');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/bodyfat/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch history:', response.status);
        Alert.alert('Error', 'Failed to fetch history. Please try again.');
        return;
      }

      const data = await response.json();
      setHistoryRecords(data.records || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Failed to fetch history. Please check your connection and try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#D3CCE3' }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Body Fat Calculator</Text>
          </View>
          
          {/* AI Image Analysis Button */}
          <View style={styles.aiButtonContainer}>
            <TouchableOpacity
              style={[
                styles.aiButton,
                isHovered && { backgroundColor: '#8B7BB8' }
              ]}
              onPress={() => router.push('/record/AIBodyFatAnalysis')}
              onPressIn={() => setIsHovered(true)}
              onPressOut={() => setIsHovered(false)}
            >
              <Text style={styles.aiButtonText}>AI Body Fat Analysis</Text>
              <Text style={styles.aiButtonSubtext}>Take full body photo or upload image for AI analysis</Text>
              <View style={styles.cameraIconContainer}>
                <MaterialCommunityIcons name="camera" size={32} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Profile Status */}
          {!userGender && (
            <View style={styles.profileWarning}>
              <Text style={styles.profileWarningText}>
                ⚠️ Please complete your profile to use the body fat calculator
              </Text>
            </View>
          )}

          {/* Input Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Neck (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 40"
                value={neck}
                onChangeText={(text) => {
                  setNeck(text);
                  if (neckError) clearNeckError();
                }}
                keyboardType="numeric"
                maxLength={4}
                onFocus={clearNeckError}
              />
              {neckError && <Text style={styles.errorText}>{neckError}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Waist (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 85"
                value={waist}
                onChangeText={(text) => {
                  setWaist(text);
                  if (waistError) clearWaistError();
                }}
                keyboardType="numeric"
                maxLength={4}
                onFocus={clearWaistError}
              />
              {waistError && <Text style={styles.errorText}>{waistError}</Text>}
            </View>

            {userGender === 'female' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hip (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 95"
                  value={hip}
                  onChangeText={(text) => {
                    setHip(text);
                    if (hipError) clearHipError();
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                  onFocus={clearHipError}
                />
                {hipError && <Text style={styles.errorText}>{hipError}</Text>}
              </View>
            )}

            {formError && (
              <View style={styles.formErrorContainer}>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitHovered && { backgroundColor: '#8B7BB8' }
              ]}
              onPress={handleSubmit}
              onPressIn={() => setIsSubmitHovered(true)}
              onPressOut={() => setIsSubmitHovered(false)}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Calculating...' : 'Calculate & Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results Display */}
          {showResults && calculationResult && calculationResult.bodyFat && calculationResult.bmi && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Calculation Complete!</Text>
              </View>
              <View style={styles.resultsContent}>
                <Text style={styles.resultsText}>
                  Your body fat percentage is:
                </Text>
                <Text style={styles.bodyFatValue}>
                  {typeof calculationResult.bodyFat === 'number' ? calculationResult.bodyFat.toFixed(1) : calculationResult.bodyFat}%
                </Text>
                <View style={[styles.categoryContainer, { backgroundColor: calculationResult.color }]}>
                  <Text style={[styles.categoryText, { color: calculationResult.textColor }]}>
                    {calculationResult.category}
                  </Text>
                </View>
                <Text style={styles.bmiText}>
                  BMI: {typeof calculationResult.bmi === 'number' ? calculationResult.bmi.toFixed(1) : calculationResult.bmi}
                </Text>
              </View>
            </View>
          )}

          {/* View History Button */}
          <View style={styles.historyButtonContainer}>
            <TouchableOpacity
              style={[
                styles.historyButton,
                isHistoryHovered && { backgroundColor: '#8B7BB8' }
              ]}
              onPress={toggleHistory}
              onPressIn={() => setIsHistoryHovered(true)}
              onPressOut={() => setIsHistoryHovered(false)}
              disabled={loadingHistory}
            >
              <Text style={styles.historyButtonText}>
                {loadingHistory ? 'Loading...' : showHistory ? 'Hide History' : 'View History'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* History Records */}
          {showHistory && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Complete History</Text>
              {historyRecords.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>No history records found</Text>
                </View>
              ) : (
                historyRecords.map((record) => {
                  const result = categorizeBodyFat(record.bodyFat, userGender as 'male' | 'female' || 'male');
                  return (
                    <View key={record.id} style={styles.historyItem}>
                      <View style={styles.historyItemHeader}>
                        <View style={styles.historyItemMain}>
                          <Text style={styles.historyItemTitle}>
                            {typeof record.bodyFat === 'number' ? record.bodyFat.toFixed(1) : record.bodyFat}% Body Fat
                          </Text>
                          <Text style={styles.historyItemDate}>{formatDate(record.date_time)}</Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: result.color }]}>
                          <Text style={[styles.categoryBadgeText, { color: result.textColor }]}>
                            {result.category}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.historyItemDetails}>
                        <Text style={styles.historyItemDetail}>
                          BMI: {typeof record.bmi === 'number' ? record.bmi.toFixed(1) : record.bmi}
                        </Text>
                        {record.notes && (
                          <Text style={styles.historyItemDetail}>
                            Notes: {record.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aiButtonContainer: {
    margin: 16,
    marginBottom: 0,
    zIndex: 2,
  },
  aiButton: {
  backgroundColor: 'transparent', 
  borderWidth: 4,                  
  borderColor: '#afa0cfff',          
  borderRadius: 50,
  padding: 27,
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
},
  aiButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0b0b0bff',
    marginBottom: 4,
  },
  aiButtonSubtext: {
    fontSize: 14,
    color: '#050505ff',
    textAlign: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -25,
    alignSelf: 'center',
    backgroundColor: '#D3CCE3',
    borderRadius: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#afa0cfff',
  },
  cameraIcon: {
    color: '#ffffffff',
    fontSize: 45,
  },
  profileWarning: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  profileWarningText: {
    color: '#92400e',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    margin: 8,
    padding: 16,
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#6b7280',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  submitButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 12,
    borderColor: '#afa0cfff',
    borderWidth: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#020202ff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  historyButtonContainer: {
    margin: 16,
  },
  historyButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 12,
    borderColor: '#afa0cfff',
    borderWidth: 4,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderColor: 'transparent',
    marginBottom: 32,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyHistoryText: {
    color: '#9ca3af',
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#afa0cfff',
    paddingVertical: 16,
  },
  historyItemHeader: {
    flex: 1,
    color: '#9ca3af',
  },
  historyItemMain: {
    flex: 1,
    color: '#1f2937',
  },
  historyItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyItemDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  historyItemDetails: {
    marginTop: 8,
  },
  historyItemDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
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
  resultsContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 32,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resultsContent: {
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 5,
  },
  bodyFatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  categoryContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bmiText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 10,
  },
  categoryBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formErrorContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  formErrorText: {
    color: '#92400e',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});