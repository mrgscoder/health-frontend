import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, History, Zap, Target, TrendingUp } from 'lucide-react-native';
import BASE_URL from "../../src/config";
import moment from 'moment';

type CardioHistoryItem = {
  id: number;
  user_id: number;
  exercise: string;
  set_number: number;
  completed_at: string;
};

const WorkoutHome = () => {
  const router = useRouter();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [history, setHistory] = useState<CardioHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Motivational quotes
  const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Strength does not come from the physical capacity. It comes from an indomitable will.",
    "The difference between try and triumph is just a little umph!",
    "Make yourself proud. Make yourself strong. Make yourself unstoppable.",
    "Every rep counts. Every set matters. Every workout builds your future self."
  ];

  const [currentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const handleStartWorkout = () => {
    router.push('/record/Cardio');
  };

  const handleViewHistory = () => {
    setHistoryVisible(true);
  };

  useEffect(() => {
    if (!historyVisible) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const res = await fetch(`${BASE_URL}/api/cardio/history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        if (res.ok && data.history) {
          setHistory(data.history);
        } else {
          setError(data.error || 'No history found');
        }
      } catch (e) {
        setError('Failed to fetch history');
      }
      setLoading(false);
    };

    fetchHistory();
  }, [historyVisible]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#e0f7fa', '#c8e6c9']}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}>
          {/* Main Content */}
          <View style={styles.container}>
            {/* Cardio Heading */}
            <Text style={styles.cardioHeading}>Cardio</Text>
            {/* Motivational Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>"{currentQuote}"</Text>
              <View style={styles.quoteIcon}>
                <Zap size={20} color="#00BCD4" />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.workoutButton}
                onPress={handleStartWorkout}
                activeOpacity={0.85}
              >
                <Activity size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.workoutButtonText}>Start Workout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleViewHistory}
                activeOpacity={0.85}
              >
                <History size={24} color="#00BCD4" style={{ marginRight: 8 }} />
                <Text style={styles.historyButtonText}>View History</Text>
              </TouchableOpacity>
            </View>

            {/* Motivational Tips */}
            <View style={styles.tipsContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <Activity size={20} color="#00BCD4" style={{marginRight: 8}} />
                <Text style={styles.tipsTitle}>Today's Tips</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>• Start with a 5-minute warm-up</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>• Stay hydrated throughout your workout</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipText}>• Listen to your body and rest when needed</Text>
              </View>
            </View>
          </View>

          {/* History Modal */}
          <Modal visible={historyVisible} animationType="slide" onRequestClose={() => setHistoryVisible(false)}>
            <LinearGradient
              colors={['#e0f7fa', '#c8e6c9']}
              style={{ flex: 1 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Workout History</Text>
                <TouchableOpacity onPress={() => setHistoryVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {loading && <ActivityIndicator size="large" color="#00BCD4" style={{ marginTop: 32 }} />}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {history.map((item, idx) => (
                  <View key={idx} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Activity size={20} color="#00BCD4" />
                      <Text style={styles.historyExercise}>{item.exercise}</Text>
                    </View>
                    <Text style={styles.historySet}>Set: {item.set_number}</Text>
                    <Text style={styles.itemTime}>{moment(item.completed_at).local().format('DD MMM YYYY, hh:mm A')}</Text>
                  </View>
                ))}
                {!loading && history.length === 0 && !error && (
                  <View style={styles.emptyState}>
                    <History size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No workout history yet.</Text>
                    <Text style={styles.emptySubtext}>Start your fitness journey today!</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </Modal>
                  </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  cardioHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00BCD4',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
    letterSpacing: 1,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 26,
  },
  quoteIcon: {
    alignSelf: 'center',
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  workoutButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00BCD4',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  historyButtonText: {
    color: '#00BCD4',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyExercise: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 8,
  },
  historySet: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemTime: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
});

export default WorkoutHome; 