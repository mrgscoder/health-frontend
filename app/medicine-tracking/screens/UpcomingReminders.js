import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getUpcomingReminders } from '../../../src/services/medicineReminderService';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function UpcomingReminders({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await getUpcomingReminders(user.id, 7); // Next 7 days
      setReminders(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load upcoming reminders:', err);
      setError('Failed to load upcoming reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadReminders();
    }
  }, [isFocused]);

  const groupRemindersByDate = () => {
    const grouped = {};
    reminders.forEach(reminder => {
      const date = new Date(reminder.reminder_date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(reminder);
    });
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      data: items
    }));
  };

  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {new Date(`2000-01-01T${item.time_of_day}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.reminderDetails}>
        <Text style={styles.medicineName}>{item.medicine_name}</Text>
        <Text style={styles.dosage}>{item.dosage}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.statusButton,
          item.status === 'taken' ? styles.takenButton : styles.pendingButton
        ]}
        onPress={() => {
          // Implement mark as taken functionality
        }}
      >
        <Text style={styles.statusButtonText}>
          {item.status === 'taken' ? 'Taken' : 'Mark as Taken'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({ section: { date } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {new Date(date).toLocaleDateString(undefined, { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReminders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = groupRemindersByDate();

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View>
            {renderSectionHeader({ section: item })}
            {item.data.map((reminder, index) => (
              <View key={`${reminder.reminder_id}-${reminder.time_id}-${index}`}>
                {renderReminderItem({ item: reminder })}
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No upcoming reminders</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddReminder')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    width: 70,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  reminderDetails: {
    flex: 1,
    marginLeft: 16,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingButton: {
    backgroundColor: '#e3f2fd',
  },
  takenButton: {
    backgroundColor: '#e8f5e9',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
