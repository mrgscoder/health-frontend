import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
    fetchUserProfile();
  }, []);

  // Initialize calculation result with safe defaults
  const getSafeCalculationResult = () => {
    if (!calculationResult) {
      return {
        bodyFat: 0,
        bmi: 0,
        category: 'Unknown',
        color: '#f3f4f6',
        textColor: '#6b7280'
      };
    }
    
    // Ensure all properties are safe
    return {
      bodyFat: Number(calculationResult.bodyFat) || 0,
      bmi: Number(calculationResult.bmi) || 0,
      category: String(calculationResult.category || 'Unknown'),
      color: String(calculationResult.color || '#f3f4f6'),
      textColor: String(calculationResult.textColor || '#6b7280')
    };
  };

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
    
    // Ensure all values are strings
    return {
      category: String(result.category),
      color: String(result.color),
      textColor: String(result.textColor)
    };
  };

  const handleSubmit = async () => {
    if (!neck || !waist) {
      setSnackbar({ visible: true, message: 'Fill in all required fields.', error: true });
      return;
    }

    if (userGender === 'female' && !hip) {
      setSnackbar({ visible: true, message: 'Hip measurement is required for females.', error: true });
      return;
    }

    // Validate input values
    const neckVal = parseFloat(neck);
    const waistVal = parseFloat(waist);
    const hipVal = userGender === 'female' ? parseFloat(hip) : 0;

    if (isNaN(neckVal) || isNaN(waistVal) || (userGender === 'female' && isNaN(hipVal))) {
      setSnackbar({ visible: true, message: 'Please enter valid numbers.', error: true });
      return;
    }

    if (neckVal <= 0 || waistVal <= 0 || (userGender === 'female' && hipVal <= 0)) {
      setSnackbar({ visible: true, message: 'All values must be greater than 0.', error: true });
      return;
    }

    if (waistVal <= neckVal) {
      setSnackbar({ visible: true, message: 'Waist measurement must be greater than neck measurement.', error: true });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSnackbar({ visible: true, message: 'Authentication required.', error: true });
        setLoading(false);
        return;
      }

      const requestData = {
        neckCm: neckVal,
        waistCm: waistVal,
        ...(userGender === 'female' && { hipCm: hipVal })
      };

      console.log('Sending body fat calculation request:', requestData);
      console.log('API URL:', API_URL);

      const response = await axios.post(
        API_URL,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Response received:', response.data);

      // Check if response has the expected structure
      const bodyFat = response.data.data?.bodyFat || response.data.bodyFat;
      const bmi = response.data.data?.bmi || response.data.bmi;
      
      console.log('Extracted bodyFat:', bodyFat);
      console.log('Extracted bmi:', bmi);

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

      // Auto-hide results after 8 seconds
      setTimeout(() => setShowResults(false), 8000);

      setNeck('');
      setWaist('');
      setHip('');
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

  // Fetch history data
  const fetchHistory = async () => {
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
    <LinearGradient colors={['#e3f2fd', '#fce4ec']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Body Fat Calculator</Text>
          </View>
          
          {/* AI Image Analysis Button */}
          <View style={styles.aiButtonContainer}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => router.push('/record/AIBodyFatAnalysis')}
            >
              <Text style={styles.aiButtonText}>AI Body Fat Analysis</Text>
              <Text style={styles.aiButtonSubtext}>Take full body photo or upload image for AI analysis</Text>
              <View style={styles.cameraIconContainer}>
                <MaterialCommunityIcons name="camera" size={32} color="#000000" />
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
                onChangeText={setNeck}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Waist (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 85"
                value={waist}
                onChangeText={setWaist}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {userGender === 'female' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hip (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 95"
                  value={hip}
                  onChangeText={setHip}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
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
              style={styles.historyButton}
              onPress={fetchHistory}
              disabled={loadingHistory}
            >
              <Text style={styles.historyButtonText}>
                {loadingHistory ? 'Loading...' : 'View History'}
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
    </LinearGradient>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aiButtonContainer: {
    margin: 16,
    marginBottom: 0,
    zIndex: 2,
  },
  aiButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  aiButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  aiButtonSubtext: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  cameraIcon: {
    fontSize: 36,
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
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButtonContainer: {
    margin: 16,
  },
  historyButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#000',
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
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  historyItemHeader: {
    flex: 1,
  },
  historyItemMain: {
    flex: 1,
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
    borderColor: '#000',
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
});