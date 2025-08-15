import { Slot } from "expo-router";
import './globals.css'
import { useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from './usePushNotifications';
import * as Notifications from 'expo-notifications';
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
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

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
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
