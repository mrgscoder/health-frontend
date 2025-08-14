import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text } from 'react-native';

export default function TabsIndex() {
  useEffect(() => {
    console.log('🔍 TabsIndex: Redirecting to HomePage...');
    // Redirect to HomePage as the default tab
    router.replace('/navigation/tabs/HomePage');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 18, color: '#333' }}>Redirecting to HomePage...</Text>
    </View>
  );
}
