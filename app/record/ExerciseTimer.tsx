import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXERCISES } from './Cardio';
import BASE_URL from "../../src/config";

const EXERCISE_DURATION = 30; // seconds
const REST_DURATION = 5; // seconds
const TOTAL_SETS = 3;

const ExerciseTimer = () => {
  const router = useRouter();
  const { title, lottie } = useLocalSearchParams();
  const lottieIdx = lottie !== undefined && lottie !== '' ? parseInt(lottie as string) : null;

  const [set, setSet] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [timer, setTimer] = useState(EXERCISE_DURATION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Save workout history to backend
  const saveHistory = async (exercise: string, setNumber: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/cardio/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exercise,
          setNumber,
          completedAt: new Date().toISOString()
        }),
      });

      if (!res.ok) {
        console.error('❌ Failed to save history:', await res.json());
      } else {
        console.log('✅ History saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save cardio history', err);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (timer === 0 && running) {
      setRunning(false);
      if (!isRest) {
        if (title) saveHistory(title as string, set);
        if (set < TOTAL_SETS) {
          setIsRest(true);
          setTimer(REST_DURATION);
        } else {
          setTimeout(() => router.back(), 1500);
        }
      } else {
        setIsRest(false);
        setSet(prev => prev + 1);
        setTimer(EXERCISE_DURATION);
      }
    }
  }, [timer, running, isRest, set, router, title]);

  const handleStart = () => setRunning(true);

  let lottieSource = null;
  if (lottieIdx !== null && EXERCISES[lottieIdx]?.lottie) {
    lottieSource = EXERCISES[lottieIdx].lottie;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sets}>Set {set} of {TOTAL_SETS}</Text>
      {lottieSource && (
        <LottieView source={lottieSource} autoPlay loop style={{ width: 220, height: 220, alignSelf: 'center', marginBottom: 16 }} />
      )}
      <Text style={styles.timer}>{timer}s</Text>
      <Text style={styles.rest}>{isRest ? 'Rest' : 'Exercise'}</Text>
      {!running && (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>{isRest ? 'Start Rest' : 'Start Exercise'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0cb6ab', marginBottom: 8 },
  sets: { fontSize: 18, color: '#555', marginBottom: 8 },
  timer: { fontSize: 64, fontWeight: 'bold', color: '#0cb6ab', marginBottom: 8 },
  rest: { fontSize: 20, color: '#888', marginBottom: 16 },
  button: { backgroundColor: '#0cb6ab', padding: 16, borderRadius: 12, marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default ExerciseTimer;
