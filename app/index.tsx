import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RootIndex() {
  useEffect(() => {
    // Redirect to the health index page
    router.replace('/health/index');
  }, []);

  return null; // This component doesn't render anything
} 