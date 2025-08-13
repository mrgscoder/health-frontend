import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, Snackbar, Text, Title } from 'react-native-paper';
import BASE_URL from '../../src/config';

type BodyFatLog = {
  id?: number;
  bodyFat: number;
  weightKg: number;
  date_time: string;
  bmi?: number;
  notes?: string;
};

export default function BodyFatHistory() {
  const [data, setData] = useState<BodyFatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

  const API_URL = `${BASE_URL}/api/bodyfat/history`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setSnackbar({ visible: true, message: 'Authentication required.', error: true });
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(response.data.records || []);
    } catch (error) {
      console.error('Error fetching body fat history:', error);
      setSnackbar({ visible: true, message: 'Error fetching history.', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const getKey = (item: BodyFatLog, index: number) => {
    return item.id?.toString() || index.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <IconButton icon="scale-bathroom" size={28} iconColor="#2563eb" />
        <Title style={styles.title}>Body Fat History</Title>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#2563eb" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={getKey}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  <Text style={styles.bodyFat}>{item.bodyFat}%</Text>
                  <Text style={styles.weight}>Weight: {item.weightKg} kg</Text>
                </View>
                <Divider style={{ marginVertical: 8 }} />
                <Text style={styles.date}>{new Date(item.date_time).toLocaleString()}</Text>
                {item.bmi && <Text style={styles.notes}>BMI: {item.bmi}</Text>}
                {item.notes ? <Text style={styles.notes}>Note: {item.notes}</Text> : null}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No body fat records found.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2500}
        style={snackbar.error ? styles.snackbarError : styles.snackbarSuccess}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f8ff', padding: 12 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginLeft: 6 },
  card: { marginBottom: 14, borderRadius: 14, elevation: 3, backgroundColor: '#ffffff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bodyFat: { fontWeight: 'bold', fontSize: 20, color: '#2563eb' },
  weight: { fontSize: 16, color: '#6b7280' },
  date: { color: '#6b7280', fontSize: 14, marginBottom: 4 },
  notes: { fontSize: 15, color: '#374151' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#9ca3af' },
  snackbarError: { backgroundColor: '#dc2626' },
  snackbarSuccess: { backgroundColor: '#16a34a' },
});
