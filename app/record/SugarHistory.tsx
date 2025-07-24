// import React, { useEffect, useState, useCallback } from 'react';
// import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
// import { Card, Text, Snackbar, Title } from 'react-native-paper';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import BASE_URL from '../../src/config';

// type SugarLog = {
//   id: number;
//   glucose_level: number;
//   notes?: string;
//   date_logged: string;
// };

// export default function SugarHistory() {
//   const [data, setData] = useState<SugarLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; error: boolean }>({
//     visible: false,
//     message: '',
//     error: false,
//   });

//   const API_URL = `${BASE_URL}/api/sugar/history`;

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         setSnackbar({ visible: true, message: 'Authentication required.', error: true });
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(API_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setData(response.data || []);
//     } catch (error) {
//       console.error('Error fetching sugar history:', error);
//       setSnackbar({ visible: true, message: 'Error fetching history.', error: true });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//     }, [])
//   );

//   const getStatusColor = (value: number) => {
//     if (value < 70) return '#ef4444'; // Low
//     if (value > 180) return '#f59e0b'; // High
//     return '#22c55e'; // Normal
//   };

//   return (
//     <View style={styles.container}>
//       <Title style={styles.title}>Sugar Reading History</Title>
//       {loading ? (
//         <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#0cb6ab" />
//       ) : (
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <Card style={styles.card}>
//               <Card.Content>
//                 <View style={styles.row}>
//                   <Text style={[styles.glucose, { color: getStatusColor(item.glucose_level) }]}>
//                     {item.glucose_level} mg/dL
//                   </Text>
//                 </View>
//                 <Text style={styles.date}>
//                   {new Date(item.date_logged).toLocaleString()}
//                 </Text>
//                 {item.notes ? <Text style={styles.notes}>Note: {item.notes}</Text> : null}
//               </Card.Content>
//             </Card>
//           )}
//           ListEmptyComponent={
//             <Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>
//               No readings found.
//             </Text>
//           }
//           contentContainerStyle={{ paddingBottom: 20 }}
//         />
//       )}
//       <Snackbar
//         visible={snackbar.visible}
//         onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
//         duration={2000}
//         style={snackbar.error ? styles.snackbarError : styles.snackbarSuccess}
//       >
//         {snackbar.message}
//       </Snackbar>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f6fafd', padding: 10 },
//   title: { marginTop: 20, marginBottom: 10, textAlign: 'center', fontSize: 22, fontWeight: 'bold' },
//   card: { marginBottom: 12, borderRadius: 12, elevation: 2 },
//   row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   glucose: { fontWeight: 'bold', fontSize: 18, flex: 1 },
//   date: { color: '#888', marginTop: 4, fontSize: 14 },
//   notes: { marginTop: 4, fontSize: 14 },
//   snackbarError: { backgroundColor: '#ef4444' },
//   snackbarSuccess: { backgroundColor: '#22c55e' },
// });

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Text, Snackbar, Title, IconButton, Divider } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from '../../src/config';

type SugarLog = {
  id: number;
  glucose_level: number;
  notes?: string;
  date_logged: string;
};

export default function SugarHistory() {
  const [data, setData] = useState<SugarLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

  const API_URL = `${BASE_URL}/api/sugar/history`;

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

      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching sugar history:', error);
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

  const getStatusColor = (value: number) => {
    if (value < 70) return '#ef4444'; // Low
    if (value > 180) return '#f59e0b'; // High
    return '#22c55e'; // Normal
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <IconButton icon="chart-line" size={28} color="#2563eb" />
        <Title style={styles.title}>Sugar Reading History</Title>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#2563eb" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  <Text style={[styles.glucose, { color: getStatusColor(item.glucose_level) }]}>
                    {item.glucose_level} mg/dL
                  </Text>
                  <IconButton
                    icon="information-outline"
                    size={22}
                    onPress={() => setSnackbar({ visible: true, message: `Status: ${item.glucose_level < 70 ? 'Low' : item.glucose_level > 180 ? 'High' : 'Normal'}`, error: false })}
                  />
                </View>
                <Divider style={{ marginVertical: 8 }} />
                <Text style={styles.date}>
                  {new Date(item.date_logged).toLocaleString()}
                </Text>
                {item.notes ? (
                  <Text style={styles.notes}>
                    <Text style={{ fontWeight: 'bold' }}>Note:</Text> {item.notes}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No readings found.</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f3f8ff',
    padding: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 6,
  },
  card: {
    marginBottom: 14,
    borderRadius: 14,
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glucose: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  date: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 4,
  },
  notes: {
    fontSize: 15,
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#9ca3af',
  },
  snackbarError: {
    backgroundColor: '#dc2626',
  },
  snackbarSuccess: {
    backgroundColor: '#16a34a',
  },
});

