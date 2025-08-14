import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text } from 'react-native';

export default function RootIndex() {
  useEffect(() => {
    // Use a small delay to ensure the layout is properly mounted
    const timer = setTimeout(() => {
      router.replace('/health');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Return a loading component instead of null
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
} 