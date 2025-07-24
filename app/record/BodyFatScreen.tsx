import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, ScrollView } from 'react-native';
import { Card, TextInput, Button, Snackbar, Title, IconButton, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import BASE_URL from '../../src/config';

export default function BodyFatScreen() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = `${BASE_URL}/api/bodyfat/calculate`;

  const handleSubmit = async () => {
    if (!weight || !height || !age || !neck || !waist) {
      setSnackbar({ visible: true, message: 'Fill in all fields.', error: true });
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSnackbar({ visible: true, message: 'Authentication required.', error: true });
        setLoading(false);
        return;
      }

      await axios.post(
        API_URL,
        {
          weightKg: parseFloat(weight),
          heightCm: parseFloat(height),
          neckCm: parseFloat(neck),
          waistCm: parseFloat(waist),
          age: parseInt(age),
          gender,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({ visible: true, message: 'Body fat calculated & saved!', error: false });
      setWeight('');
      setHeight('');
      setAge('');
      setNeck('');
      setWaist('');
      Keyboard.dismiss();
    } catch (err) {
      console.error(err);
      setSnackbar({ visible: true, message: 'Failed to save. Try again.', error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#e0f2fe', '#f9fafb']} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Card style={styles.card}>
          <LinearGradient colors={['#2563eb', '#3b82f6']} style={styles.headerBar}>
            <IconButton icon="human-male-height" size={28} color="#fff" />
            <Title style={styles.headerTitle}>Body Fat Calculator</Title>
          </LinearGradient>

          <Card.Content style={{ paddingTop: 16 }}>
            <TextInput
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="weight" />}
            />

            <TextInput
              label="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="human-male-height" />}
            />

            <TextInput
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="calendar" />}
            />

            <TextInput
              label="Neck (cm)"
              value={neck}
              onChangeText={setNeck}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="ruler" />}
            />

            <TextInput
              label="Waist (cm)"
              value={waist}
              onChangeText={setWaist}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="ruler-square" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.saveButton}
              disabled={loading}
              icon="content-save-outline"
            >
              Calculate & Save
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.push('/record/BodyFatHistory')}
              style={styles.historyButton}
              icon="history"
            >
              View History
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2500}
        style={snackbar.error ? styles.snackbarError : styles.snackbarSuccess}
      >
        {snackbar.message}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 18, elevation: 8, backgroundColor: '#fff', overflow: 'hidden' },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginLeft: 8 },
  input: { marginBottom: 16, backgroundColor: '#f9fafb', borderRadius: 10 },
  saveButton: { marginTop: 10, backgroundColor: '#2563eb', borderRadius: 12 },
  historyButton: { marginTop: 8, borderColor: '#2563eb', borderWidth: 1.2, borderRadius: 12 },
  snackbarError: { backgroundColor: '#dc2626' },
  snackbarSuccess: { backgroundColor: '#16a34a' },
});