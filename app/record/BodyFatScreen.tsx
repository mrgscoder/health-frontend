import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import BASE_URL from '../../src/config';

interface BodyFatRecord {
  id: number;
  bodyFat: number;
  weightKg: number;
  date_time: string;
  bmi: number;
  notes?: string;
}

export default function BodyFatScreen() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<BodyFatRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const router = useRouter();

  const API_URL = `${BASE_URL}/api/bodyfat/calculate`;

  const handleSubmit = async () => {
    if (!weight || !height || !age || !neck || !waist) {
      setSnackbar({ visible: true, message: 'Fill in all fields.', error: true });
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

      const response = await axios.post(
        API_URL,
        {
          weightKg: parseFloat(weight),
          heightCm: parseFloat(height),
          neckCm: parseFloat(neck),
          waistCm: parseFloat(waist),
          age: parseInt(age),
          gender,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({ visible: true, message: 'Body fat calculated & saved!', error: false });
      setWeight('');
      setHeight('');
      setAge('');
      setNeck('');
      setWaist('');
      Keyboard.dismiss();
    } catch (err) {
      console.error(err);
      setSnackbar({ visible: true, message: 'Failed to save. Try again.', error: true });
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
    <LinearGradient colors={['#dbe6f6', '#f5f7fa']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Body Fat Calculator</Text>
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 70"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 175"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

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

            <View style={styles.genderContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonActive
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextActive
                  ]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextActive
                  ]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

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
                historyRecords.map((record) => (
                  <View key={record.id} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemMain}>
                        <Text style={styles.historyItemTitle}>
                          {record.bodyFat.toFixed(1)}% Body Fat
                        </Text>
                        <Text style={styles.historyItemDate}>{formatDate(record.date_time)}</Text>
                      </View>
                      <View style={styles.historyItemDetails}>
                        <Text style={styles.historyItemDetail}>
                          Weight: {record.weightKg}kg | BMI: {record.bmi}
                        </Text>
                        {record.notes && (
                          <Text style={styles.historyItemDetail}>
                            Notes: {record.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
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
  formContainer: {
    margin: 8,
    padding: 24,
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#6b7280',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    backgroundColor: 'transparent',
  },
  genderContainer: {
    marginBottom: 24,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#000',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButtonContainer: {
    margin: 16,
  },
  historyButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 18,
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
});