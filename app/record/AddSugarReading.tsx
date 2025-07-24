// import React, { useState } from 'react';
// import { View, StyleSheet, Keyboard } from 'react-native';
// import { Card, TextInput, Button, Snackbar, Title } from 'react-native-paper';
// import axios from 'axios';
// import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import BASE_URL from '../../src/config';

// export default function AddSugarReading() {
//   const [glucose, setGlucose] = useState('');
//   const [notes, setNotes] = useState('');
//   const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; error: boolean }>({
//     visible: false,
//     message: '',
//     error: false,
//   });
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const API_URL = `${BASE_URL}/api/sugar`;

//   const handleSubmit = async () => {
//     if (!glucose || isNaN(Number(glucose))) {
//       setSnackbar({ visible: true, message: 'Please enter a valid glucose level.', error: true });
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         setSnackbar({ visible: true, message: 'Authentication required.', error: true });
//         setLoading(false);
//         return;
//       }

//       await axios.post(
//         API_URL,
//         { glucose_level: parseInt(glucose), notes },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setSnackbar({ visible: true, message: 'Saved successfully!', error: false });
//       setGlucose('');
//       setNotes('');
//       Keyboard.dismiss();
//     } catch (err) {
//       console.error(err);
//       setSnackbar({ visible: true, message: 'Failed to save. Try again.', error: true });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Card style={styles.card}>
//         <Card.Content>
//           <Title style={styles.title}>Add Blood Sugar Reading</Title>
//           <TextInput
//             label="Glucose Level (mg/dL)"
//             value={glucose}
//             onChangeText={setGlucose}
//             keyboardType="numeric"
//             style={styles.input}
//             mode="outlined"
//           />
//           <TextInput
//             label="Notes (optional)"
//             value={notes}
//             onChangeText={setNotes}
//             style={styles.input}
//             mode="outlined"
//             multiline
//           />
//           <Button
//             mode="contained"
//             onPress={handleSubmit}
//             loading={loading}
//             style={styles.button}
//             disabled={loading}
//           >
//             Save
//           </Button>
//           <Button
//             mode="outlined"
//             onPress={() => router.push('/record/SugarHistory')} // Navigate to SugarHistory
//             style={styles.button}
//           >
//             View History
//           </Button>
//         </Card.Content>
//       </Card>
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
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f6fafd' },
//   card: { elevation: 4, borderRadius: 16 },
//   title: { marginBottom: 16, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
//   input: { marginBottom: 16 },
//   button: { marginTop: 8 },
//   snackbarError: { backgroundColor: '#ef4444' },
//   snackbarSuccess: { backgroundColor: '#22c55e' },
// });


import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, ScrollView } from 'react-native';
import { Card, TextInput, Button, Snackbar, Title, useTheme, IconButton, Text } from 'react-native-paper';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../../src/config';

export default function AddSugarReading() {
  const [glucose, setGlucose] = useState('');
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const API_URL = `${BASE_URL}/api/sugar`;

  const handleSubmit = async () => {
    if (!glucose || isNaN(Number(glucose))) {
      setSnackbar({ visible: true, message: 'Please enter a valid glucose level.', error: true });
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
        { glucose_level: parseInt(glucose), notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({ visible: true, message: 'Saved successfully!', error: false });
      setGlucose('');
      setNotes('');
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
          {/* Gradient Header */}
          <LinearGradient colors={['#2563eb', '#3b82f6']} style={styles.headerBar}>
            <IconButton icon="heart-pulse" size={28} color="#fff" />
            <Title style={styles.headerTitle}>Add Blood Sugar Reading</Title>
          </LinearGradient>

          <Card.Content style={{ paddingTop: 16 }}>
            <Text style={styles.subtitle}>
              Keep track of your blood sugar levels for better health.
            </Text>

            <TextInput
              label="Glucose Level (mg/dL)"
              value={glucose}
              onChangeText={setGlucose}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="blood-bag" />}
            />

            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              multiline
              left={<TextInput.Icon icon="note-text-outline" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.saveButton}
              disabled={loading}
              icon="content-save-outline"
            >
              Save Reading
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.push('/record/SugarHistory')}
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
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 18,
    elevation: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden', // important for gradient header
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 6,
  },
  historyButton: {
    marginTop: 8,
    borderColor: '#2563eb',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingVertical: 6,
  },
  snackbarError: {
    backgroundColor: '#dc2626',
  },
  snackbarSuccess: {
    backgroundColor: '#16a34a',
  },
});
