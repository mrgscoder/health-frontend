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
      <Stack.Screen
        name="bloodpressuretracker"
        options={{
          title: 'Blood Pressure Tracker',
          headerShown: false,
        }}
        />
        <Stack.Screen
      name="heartratetracker"
      options={{
        headerShown: false,
      }}/>
    
    </Stack>
  );
};

export default _layout;