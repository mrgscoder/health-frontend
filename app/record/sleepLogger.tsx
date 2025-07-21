// SleepLoggerScreen.js — Sleep logging screen with beautiful UI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Button,
  ScrollView,
  ImageBackground,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.16:5001/api/sleep'; // Updated API URL

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
        Alert.alert('Success', '🛏️ Sleep log saved successfully!');
        
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
        console.error('Failed to save sleep log:', data.error);
        Alert.alert('Error', data.error || 'Failed to save sleep log');
      }
    } catch (error) {
      console.error('Save sleep log error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/night-bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>🛏️ Log Your Sleep</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Have A Good Sleep</Text>
          <Button
            title={date.toDateString()}
            onPress={() => setDate(new Date())} // optionally a date picker
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🌙 Bedtime:</Text>
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
          <Text style={styles.label}>☀️ Wake Time:</Text>
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
          <Text style={styles.submitText}>
            {loading ? '⏳ Saving...' : '💾 Save Sleep Log'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    color: '#f1f5f9',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 6,
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
  submitText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});