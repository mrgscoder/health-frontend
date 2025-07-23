import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { MedicationScheduleClass } from './Medreminder/models/MedicationModels';
import { StorageManager } from './Medreminder/utils/storageManager';
import { NotificationManager } from './Medreminder/utils/notificationManager';
import { MEAL_TIMINGS, FREQUENCIES } from './Medreminder/data/medicationCategories';
import { medicineStyles } from './Medreminder/styles/medicineStyles';

interface ScheduleData {
  times: string[];
  frequency: string;
  mealTiming: string;
  duration: string | null;
}

export default function ScheduleScreen() {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    times: [],
    frequency: 'daily',
    mealTiming: 'anytime',
    duration: null
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  
  const params = useLocalSearchParams();
  const medicationId = params.medicationId as string;
  const medicationName = params.medicationName as string;

  const addTime = (time: string) => {
    setScheduleData(prev => ({
      ...prev,
      times: [...prev.times, time].sort()
    }));
  };

  const removeTime = (index: number) => {
    setScheduleData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (selectedTimeIndex >= 0) {
        // Edit existing time
        setScheduleData(prev => ({
          ...prev,
          times: prev.times.map((time, index) => 
            index === selectedTimeIndex ? timeString : time
          ).sort()
        }));
      } else {
        // Add new time
        addTime(timeString);
      }
    }
  };

  const showTimePickerModal = (index: number = -1) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  const saveSchedule = async () => {
    if (scheduleData.times.length === 0) {
      Alert.alert('No Times Set', 'Please add at least one time for your medication schedule.');
      return;
    }

    try {
      setLoading(true);
      
      const schedule = new MedicationScheduleClass({
        medicationId,
        times: scheduleData.times,
        frequency: scheduleData.frequency,
        duration: scheduleData.duration,
        mealTiming: scheduleData.mealTiming,
        isActive: true
      });

      await StorageManager.addSchedule(schedule);
      
      // Schedule notifications
      const medications = await StorageManager.getMedications();
      const medication = medications.find(med => med.id === medicationId);
      
      if (medication) {
        for (const time of scheduleData.times) {
          await NotificationManager.scheduleMedicationReminder({
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            unit: medication.unit,
            time: time,
            scheduleId: schedule.id
          });
        }
      }

      Alert.alert(
        'Schedule Created',
        `Schedule for ${medicationName} has been created successfully!`,
        [
          {
            text: 'View All Medications',
            onPress: () => router.push('/medicine-tracking/list')
          },
          {
            text: 'Done',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeCard = (time: string, index: number) => (
    <View 
      key={index}
      style={[
        medicineStyles.card, 
        { marginBottom: 8 }
      ]}
    >
      <View style={medicineStyles.timePickerContainer}>
        <Text style={medicineStyles.timeText}>
          {time}
        </Text>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => showTimePickerModal(index)}
        >
          <Ionicons name="create" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => removeTime(index)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={medicineStyles.container}>
      <ScrollView>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 8 }}>
            Schedule for {medicationName}
          </Text>
        </View>

        {/* Times Section */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Reminder Times
          </Text>
          
          {scheduleData.times.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Ionicons name="time-outline" size={64} color="#ccc" />
              <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 16 }}>
                No times set yet
              </Text>
            </View>
          ) : (
            scheduleData.times.map(renderTimeCard)
          )}
          
          <TouchableOpacity
            style={[
              medicineStyles.secondaryButton,
              { marginTop: 16 }
            ]}
            onPress={() => showTimePickerModal()}
          >
            <Ionicons name="add" size={20} color="#007AFF" style={{ marginRight: 8 }} />
            <Text style={medicineStyles.secondaryButtonText}>
              Add Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Frequency Section */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Frequency
          </Text>
          
          {FREQUENCIES.map(frequency => (
            <TouchableOpacity
              key={frequency.id}
              style={[
                medicineStyles.timePickerContainer,
                scheduleData.frequency === frequency.id && {
                  backgroundColor: '#f0f0f0'
                }
              ]}
              onPress={() => setScheduleData(prev => ({ ...prev, frequency: frequency.id }))}
            >
              <View style={{ flex: 1 }}>
                <Text style={medicineStyles.timeText}>
                  {frequency.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {frequency.description}
                </Text>
              </View>
              {scheduleData.frequency === frequency.id && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Timing Section */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Meal Timing
          </Text>
          
          {MEAL_TIMINGS.map(timing => (
            <TouchableOpacity
              key={timing.id}
              style={[
                medicineStyles.timePickerContainer,
                scheduleData.mealTiming === timing.id && {
                  backgroundColor: '#f0f0f0'
                }
              ]}
              onPress={() => setScheduleData(prev => ({ ...prev, mealTiming: timing.id }))}
            >
              <View style={{ flex: 1 }}>
                <Text style={medicineStyles.timeText}>
                  {timing.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {timing.description}
                </Text>
              </View>
              {scheduleData.mealTiming === timing.id && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            medicineStyles.primaryButton,
            { marginTop: 24 },
            loading && { opacity: 0.6 }
          ]}
          onPress={saveSchedule}
          disabled={loading}
        >
          <Text style={medicineStyles.primaryButtonText}>
            {loading ? 'Saving...' : 'Save Schedule'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
} 