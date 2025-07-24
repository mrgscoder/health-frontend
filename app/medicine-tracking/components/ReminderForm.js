import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createReminder, updateReminder } from '../../../src/services/medicineReminderService';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function ReminderForm() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const isEdit = route.params?.reminder;
  
  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const { reminder } = route.params;
      setFormData({
        ...reminder,
        start_date: reminder.start_date.split('T')[0],
        end_date: reminder.end_date ? reminder.end_date.split('T')[0] : '',
        times: reminder.reminder_times.map(t => t.time_of_day)
      });
    }
  }, [isEdit, route.params]);

  const handleSubmit = async () => {
    if (!formData.medicine_name || !formData.dosage) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        ...formData,
        user_id: user.id,
        reminder_times: formData.times,
        times_per_day: formData.times.length,
        specific_days: formData.frequency === 'daily' ? 'monday,tuesday,wednesday,thursday,friday,saturday,sunday' : formData.specific_days
      };

      if (isEdit) {
        await updateReminder(route.params.reminder.id, data);
        Alert.alert('Success', 'Reminder updated');
      } else {
        await createReminder(data);
        Alert.alert('Success', 'Reminder created');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Medicine Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.medicine_name}
          onChangeText={(text) => setFormData({...formData, medicine_name: text})}
          placeholder="e.g., Ibuprofen"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Dosage *</Text>
        <TextInput
          style={styles.input}
          value={formData.dosage}
          onChangeText={(text) => setFormData({...formData, dosage: text})}
          placeholder="e.g., 200mg"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Frequency *</Text>
        <Picker
          selectedValue={formData.frequency}
          onValueChange={(value) => setFormData({...formData, frequency: value})}
          style={styles.picker}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
        </Picker>
      </View>

      {formData.frequency === 'weekly' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Days of the week</Text>
          <TextInput
            style={styles.input}
            value={formData.specific_days}
            onChangeText={(text) => setFormData({...formData, specific_days: text})}
            placeholder="e.g., monday,wednesday,friday"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Times per day *</Text>
        {formData.times.map((time, index) => (
          <View key={index} style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              value={time}
              onChangeText={(text) => {
                const newTimes = [...formData.times];
                newTimes[index] = text;
                setFormData({...formData, times: newTimes});
              }}
              placeholder="HH:MM"
            />
            <TouchableOpacity 
              style={styles.removeTimeButton}
              onPress={() => {
                if (formData.times.length > 1) {
                  const newTimes = formData.times.filter((_, i) => i !== index);
                  setFormData({...formData, times: newTimes});
                }
              }}
            >
              <Text style={styles.removeTimeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.addTimeButton}
          onPress={() => setFormData({...formData, times: [...formData.times, '12:00']})}
        >
          <Text style={styles.addTimeButtonText}>+ Add Time</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  addTimeButton: {
    padding: 8,
    alignItems: 'center',
  },
  addTimeButtonText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  removeTimeButton: {
    padding: 8,
  },
  removeTimeButtonText: {
    color: '#F44336',
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
