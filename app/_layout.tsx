import { Stack } from "expo-router";
import './globals.css'
import { useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from './usePushNotifications';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import BASE_URL from "../src/config";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Create a client
const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // Play sound for alarm effect
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        // Send token to your backend
        await fetch(`${BASE_URL}/api/save-fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcm_token: token, user_id: 1 }),
        });
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Optionally play a custom sound or show a modal/alarm
      // You can use expo-av to play a custom sound here if needed
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen
            name="health/index"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="navigation/tabs"
            options={{
              headerShown: false,
            }}
          />
            <Stack.Screen
            name="health/Account"
            options={{
              headerShown: false,
            }}
          />
           <Stack.Screen
            name="health/forms"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="health/forgot"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="record"
            options={{
              headerShown: false,
            }}/>
            <Stack.Screen
            name="stress-assessment"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="health/medication"
            options={{
              headerShown: false,
            }}
            />
          <Stack.Screen
           name="medicine-tracking"
           options={{ 
             headerShown: false,
           }}   
           />
          <Stack.Screen
            name="record/Cardio"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="record/ExerciseTimer"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="health/medicine"
            options={{
              headerShown: false,
            }}
            />
          <Stack.Screen
            name="health/profile"
            options={{
              headerShown: false,
            }}
            />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
