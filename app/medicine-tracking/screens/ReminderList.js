import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getUserReminders, deleteReminder } from '../../../src/services/medicineReminderService';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ReminderList({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await getUserReminders(user.id);
      setReminders(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load reminders:', err);
      setError('Failed to load reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadReminders();
    }
  }, [isFocused]);

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      loadReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      setError('Failed to delete reminder. Please try again.');
    }
  };

  const renderReminder = ({ item }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <Text style={styles.medicineName}>{item.medicine_name}</Text>
        <Text style={styles.dosage}>{item.dosage}</Text>
      </View>
      
      <View style={styles.timesContainer}>
        {item.reminder_times && item.reminder_times.map((time, index) => (
          <View key={index} style={styles.timeBadge}>
            <Text style={styles.timeText}>{time.time_of_day || time}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.frequencyContainer}>
        <Text style={styles.frequencyText}>
          {item.frequency === 'daily' ? 'Daily' : 
           item.frequency === 'weekly' ? 'Weekly' : 'Custom'}
        </Text>
        {item.specific_days && (
          <Text style={styles.daysText}>({item.specific_days})</Text>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditReminder', { reminder: item })}
        >
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
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

  return (
    <View style={styles.container}>
      {reminders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No reminders yet</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddReminder')}
          >
            <Text style={styles.addButtonText}>Add Your First Reminder</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reminders}
          renderItem={renderReminder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddReminder')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Reminder</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.upcomingButton}
                onPress={() => navigation.navigate('UpcomingReminders')}
              >
                <Ionicons name="calendar" size={16} color="#2196F3" />
                <Text style={styles.upcomingButtonText}>View Upcoming</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  timeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  frequencyText: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  daysText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  upcomingButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  upcomingButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
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
