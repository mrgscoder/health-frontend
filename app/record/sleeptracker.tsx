import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155', '#475569']}
      style={styles.container}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Sleep Tracker</Text>
          <Text style={styles.subTitle}>"Your dreams deserve a gentle start."</Text>
          <Text style={styles.subTitle}>"Track your nights. Improve your days."</Text>
        </View>

        {/* Cards container with padding from header */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Start Sleep Logging</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('./sleepLogger')}
            >
              <Ionicons name="moon" size={24} color="#fff" />
              <Text style={styles.buttonText}>Go to Sleep Logger</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>View Sleep History</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('./createhistory')}
            >
              <Ionicons name="time" size={24} color="#fff" />
              <Text style={styles.buttonText}>Check History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  username: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subTitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    textAlign: 'center',
    maxWidth: '90%',
  },
  cardContainer: {
    paddingTop: 76,
  }
});
