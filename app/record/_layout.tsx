import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="vitalSigns"
        options={{
          title: 'vitalSigns',
          headerShown: false,
        }}
      />
    
    </Stack>
  );
};

export default _layout;