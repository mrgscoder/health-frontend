import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from "../../src/config";
import moment from 'moment';

const EXERCISES = [
  {
    title: 'Jumping Jacks',
    description: 'Stand upright with your legs together and arms at your sides. Jump up, spreading your legs shoulder-width apart while raising your arms overhead. Jump back to the starting position. Repeat for 30 seconds to 1 minute. Great for warming up and cardio.',
    lottie: require('../assets/lottie/Jumping-Jack.json'),
  },
  {
    title: 'Push-Ups',
    description: 'Start in a plank position with your hands slightly wider than shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up. Keep your body straight throughout. Repeat 10-15 times.',
    lottie: require('../assets/lottie/push-ups.json'),
  },
  {
    title: 'Squats',
    description: 'Stand with feet shoulder-width apart. Lower your body as if sitting in a chair, keeping your back straight and knees behind your toes. Rise back up. Repeat 10-15 times.',
    lottie: require('../assets/lottie/squats.json'),
  },
  {
    title: 'Lunges',
    description: 'Stand tall. Step forward with one leg and lower your hips until both knees are bent at about a 90-degree angle. Push back to the starting position and switch legs. Repeat 10 times per leg.',
    lottie: require('../assets/lottie/lunges.json'),
  },
  {
    title: 'Burpees',
    description: 'Start standing, squat down and place your hands on the floor, jump your feet back into a plank, do a push-up, jump your feet forward, and explosively jump up. Repeat for 10-15 reps.',
    lottie: require('../assets/lottie/burpees.json'),
  },
  {
    title: 'Plank (Core Stability)',
    description: 'Lie face down, then lift your body onto your forearms and toes, keeping your body straight. Hold for 20-30 seconds. Strengthens your core and improves posture.',
    lottie: require('../assets/lottie/plank.json'),
  },
  {
    title: 'Seated Abs Circles',
    description: 'Sit on the floor with your legs extended. Lean back slightly and lift your legs off the ground. Move your legs in a circular motion for 30 seconds. Engages your core and improves stability.',
    lottie: require('../assets/lottie/Seated abs circles.json'),
  },
  {
    title: 'Reverse Crunches',
    description: 'Lie on your back with your knees bent and feet flat on the floor. Lift your hips off the ground towards your chest, then lower back down. Repeat for 10-15 reps. Strengthens your lower abs.',
    lottie: require('../assets/lottie/Reverse Crunches.json'),
  },
  {
    title: 'Inchworm',
    description: 'Stand tall, then bend at the waist and walk your hands forward to a plank position. Walk your feet up to your hands and repeat. Great for warming up and improving flexibility.',
    lottie: require('../assets/lottie/Inchworm.json'),
  },
];

export { EXERCISES };

type CardioHistoryItem = {
  id: number;
  user_id: number;
  exercise: string;
  set_number: number;
  completed_at: string;
};

const CardioExercises = ({ router }: { router: ReturnType<typeof useRouter> }) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16 }}>
    <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#0cb6ab' }}>Cardio: Posture & Exercise</Text>
    {EXERCISES.map((item, idx) => (
      <View key={idx} style={styles.exerciseCard}>
        <Text style={styles.exerciseTitle}>{item.title}</Text>
        {item.lottie && (
          <LottieView
            source={item.lottie}
            autoPlay
            loop
            style={{ width: 180, height: 180, alignSelf: 'center', marginBottom: 12 }}
          />
        )}
        <Text style={styles.exerciseDescription}>{item.description}</Text>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/record/ExerciseTimer',
            params: { title: item.title, lottie: idx }
          })}
          style={styles.startButton}
        >
          <Text style={styles.startButtonText}>Start Exercise</Text>
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
);

const CardioHistory = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [history, setHistory] = useState<CardioHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
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
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={styles.modalHeader}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Workout History</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: '#fff', borderRadius: 8 }}>
            <Text style={{ color: '#0cb6ab', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {loading && <ActivityIndicator size="large" color="#0cb6ab" style={{ marginTop: 32 }} />}
          {error ? <Text style={{ color: 'red', marginTop: 16 }}>{error}</Text> : null}
          {history.map((item, idx) => (
            <View key={idx} style={styles.historyCard}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.exercise}</Text>
              <Text style={{ color: '#555', marginTop: 2 }}>Set: {item.set_number}</Text>
              <Text style={styles.itemTime}> {moment(item.completed_at).local().format('DD MMM YYYY, hh:mm A')}</Text>
            </View>
          ))}
          {!loading && history.length === 0 && !error && <Text style={{ color: '#888', marginTop: 32 }}>No workout history yet.</Text>}
        </ScrollView>
      </View>
    </Modal>
  );
};

const Cardio = () => {
  const router = useRouter();
  const [historyVisible, setHistoryVisible] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <CardioExercises router={router} />
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setHistoryVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.historyButtonText}>View Workout History</Text>
        </TouchableOpacity>
      </View>
      <CardioHistory visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#0cb6ab',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0cb6ab',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  historyButton: {
    backgroundColor: '#0cb6ab',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  itemTime: {
    color: '#888',
    marginTop: 2,
    fontSize: 14,
  },
});

export default Cardio;
