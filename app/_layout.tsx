import { Stack } from "expo-router";
import './globals.css'
import { useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from './usePushNotifications';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

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
        await fetch('http://localhost:5001/api/save-fcm-token', {
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

  return <Stack>
    <Stack.Screen
      name="health/[id]"
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="health/forms/MultiStepForm"
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="(tabs)"
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
      
  </Stack>;
}
