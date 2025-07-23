import { Stack } from 'expo-router';

export default function StressAssessmentLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Stress Assessment',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="stress-test"
        options={{
          title: 'Stress Test (PSS-10)',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="anxiety-test"
        options={{
          title: 'Anxiety Test (GAD-7)',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          title: 'Results',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 