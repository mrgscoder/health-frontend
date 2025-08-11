import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

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

const CardioExercises = ({ router }: { router: ReturnType<typeof useRouter> }) => (
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
    <Text className="text-lg font-bold text-gray-800 mb-4">Cardio: Posture & Exercise</Text>
    {EXERCISES.map((item, idx) => (
      <View key={idx} style={styles.exerciseCard}>
        <Text style={styles.exerciseTitle}>{item.title}</Text>
        {item.lottie && (
          <LottieView
            source={item.lottie}
            autoPlay
            loop
            style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: 10 }}
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



const Cardio = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#e0f7fa', '#c8e6c9']}
        style={{ flex: 1 }}
      >
        <CardioExercises router={router} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Cardio;
