import { Stack } from 'expo-router';

export default function MedicineTrackingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Medicine Tracking',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Medication',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="list"
        options={{
          title: 'All Medications',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: 'Medication Details',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 