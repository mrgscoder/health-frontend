// SleepLoggerScreen.js — Sleep logging screen with beautiful UI
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Bed, Loader, Save, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BASE_URL from "../../src/config";

const API_BASE_URL = `${BASE_URL}/api/sleep`; // Updated API URL

export default function sleepLogger() {
  const [date, setDate] = useState(new Date());
  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogSleep = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please log in to record sleep data');
        setLoading(false);
        return;
      }

      // Format dates for API
      const sleep_date = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const sleep_start = bedTime.toTimeString().split(' ')[0]; // HH:MM:SS format
      const sleep_end = wakeTime.toTimeString().split(' ')[0]; // HH:MM:SS format

      const response = await fetch(`${API_BASE_URL}/addsleep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sleep_date: sleep_date,
          sleep_start: sleep_start,
          sleep_end: sleep_end,
          notes: `Sleep logged on ${date.toDateString()}`
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        Alert.alert('Success', 'Sleep log saved successfully!');
        
        // Also save to local storage for offline access
        const log = {
          date: date.toISOString(),
          start: bedTime.toISOString(),
          end: wakeTime.toISOString()
        };
        const logs = await AsyncStorage.getItem('sleepLogs');
        const updated = logs ? JSON.parse(logs).concat(log) : [log];
        await AsyncStorage.setItem('sleepLogs', JSON.stringify(updated));
        
      } else {
        console.error('Please add correct sleep hours:', data.error);
        Alert.alert('Error',  'Please add correct sleep hours');
      }
    } catch (error) {
      console.error('Save sleep log error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e', '#0f3460']}
      style={styles.bg}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headingContainer}>
          <Bed size={28} color="#f1f5f9" />
          <Text style={styles.heading}>Log Your Sleep</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Have A Good Sleep</Text>
          <Button
            title={date.toDateString()}
            onPress={() => setDate(new Date())} // optionally a date picker
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Bed size={20} color="#e2e8f0" />
            <Text style={styles.label}>Bedtime:</Text>
          </View>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowBedPicker(true)}>
            <Text style={styles.timeText}>{bedTime.toLocaleTimeString()}</Text>
          </TouchableOpacity>
          {showBedPicker && (
            <DateTimePicker
              value={bedTime}
              mode="time"
              display="default"
              onChange={(event, selected) => {
                setShowBedPicker(false);
                if (selected) setBedTime(selected);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Sun size={20} color="#e2e8f0" />
            <Text style={styles.label}>Wake Time:</Text>
          </View>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowWakePicker(true)}>
            <Text style={styles.timeText}>{wakeTime.toLocaleTimeString()}</Text>
          </TouchableOpacity>
          {showWakePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              display="default"
              onChange={(event, selected) => {
                setShowWakePicker(false);
                if (selected) setWakeTime(selected);
              }}
            />
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleLogSleep}
          disabled={loading}
        >
          <View style={styles.submitContent}>
            {loading ? (
              <>
                <Loader size={20} color="#0f172a" />
                <Text style={styles.submitText}>Saving...</Text>
              </>
            ) : (
              <>
                <Save size={20} color="#0f172a" />
                <Text style={styles.submitText}>Save Sleep Log</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  heading: {
    fontSize: 24,
    color: '#f1f5f9',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  timeButton: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    color: '#f8fafc',
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#38bdf8',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});