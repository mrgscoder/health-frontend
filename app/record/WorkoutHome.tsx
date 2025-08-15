import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Activity, History } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BASE_URL from "../../src/config";

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
        colors={['#c8e6c9', '#c8e6c9']}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}>
          {/* Main Content */}
          <View style={styles.container}>
            {/* Cardio Heading */}
            <Text style={styles.cardioHeading}>Exercise</Text>
            
            {/* Personalized Health Box */}
            <View style={styles.personalizedContainer}>
              <Text style={styles.personalizedText}>
                Based on your health profile, fitness level, and goals, 
                we've customized your cardio workouts to match your body's needs and capabilities.
              </Text>
            </View>

            {/* Motivational Quote */}

            {/* Inspiring Image */}
            <View>
              <View style={styles.imagePlaceholder}>
                <Activity size={0} color="#00BCD4" />
                <Image
                  source={require('../../assets/images/work.png')}
                  style={{ width: 350, height: 250 }}
                  />
                <Text style={styles.imageText}></Text>
                <Text style={styles.imageText}>Every step counts towards your goal</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.workoutButton}
                onPress={handleStartWorkout}
                activeOpacity={0.85}
              >
                <Activity size={24} color="#6b8d6cff" style={{ marginRight: 8 }} />
                <Text style={styles.workoutButtonText}>Start Workout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.historyButton}
                onPress={handleViewHistory}
                activeOpacity={0.85}
              >
                <History size={24} color="#6b8d6cff" style={{ marginRight: 8 }} />
                <Text style={styles.historyButtonText}>Track Your Exercise Record</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* History Modal */}
          <Modal visible={historyVisible} animationType="slide" onRequestClose={() => setHistoryVisible(false)}>
            <LinearGradient
              colors={['#c8e6c9', '#c8e6c9']}
              style={{ flex: 1 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Exercise Records</Text>
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
                    <Text style={styles.emptyText}>No exercise records yet.</Text>
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
    color: '#6b8d6cff',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
    letterSpacing: 1,
  },
  
  // Personalized Health Box
  personalizedContainer: {
    backgroundColor: 'transparent',
    padding: 16,
    marginBottom: 24,
  },
  personalizedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  personalizedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  personalizedText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  personalizedStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statBadgeText: {
    fontSize: 12,
    color: '#00BCD4',
    marginLeft: 4,
    fontWeight: '500',
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

  // Inspiring Image
  imagePlaceholder: {
    backgroundColor: 'transparent',
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  imageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
  },
  imageSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  workoutButton: {
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderColor: '#6b8d6cff',
    borderWidth: 4,
    paddingVertical: 18,
    flexDirection: 'row',
    width: 350,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutButtonText: {
    color: '#6b8d6cff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  historyButton: {
   backgroundColor: 'transparent',
    borderRadius: 50,
    borderColor: '#6b8d6cff',
    borderWidth: 4,
    paddingVertical: 18,
    flexDirection: 'row',
    width: 350,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    color: '#6b8d6cff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
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