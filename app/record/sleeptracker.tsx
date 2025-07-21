import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
  source={require('../../assets/images/night-bg.jpg')}
  style={styles.bg}
  resizeMode="cover"
>
  <SafeAreaView style={styles.overlay}>
    <View style={styles.header}>
      <Text style={styles.mainTitle}>🌙 Sleep Tracker</Text>
      <Text style={styles.subTitle}>“Your dreams deserve a gentle start.”</Text>
      <Text style={styles.subTitle}>“Track your nights. Improve your days.”</Text>
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
</ImageBackground>

  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(10,15,40,0.6)',
  },
  header: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 24,
    color: '#C9D6FF',
    fontWeight: '600',
  },
  username: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
  marginTop: 40,
  alignItems: 'center',
  marginBottom: 30,
},
mainTitle: {
  fontSize: 34,
  fontWeight: 'bold',
  color: '#C9D6FF',
  textShadowColor: '#1e3a8a',
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 10,
},
subTitle: {
  fontSize: 16,
  fontStyle: 'italic',
  color: '#a5b4fc',
  marginTop: 6,
  textAlign: 'center',
  maxWidth: '90%',
},
cardContainer : {
  paddingTop : 76,
}

});
