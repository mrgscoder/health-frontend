import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="HomePage"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="food"
        options={{
          title: 'Food',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="foodList"
        options={{
          title: 'Food List',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="water"
        options={{
          title: 'Water',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default _layout;