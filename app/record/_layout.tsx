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
      <Stack.Screen
        name="bloodoxygentracker"
        options={{
          title: 'Blood Oxygen Tracker',
          headerShown: false,
        }}/>
        <Stack.Screen
        name="sleeptracker"
        options={{  
          title: 'Sleep Tracker',
          headerShown: false,
        }}/>
      <Stack.Screen
        name="sleepLogger"
        options={{
          title: 'Sleep Logger',
          headerShown: false,
        }}/>  
      <Stack.Screen
        name="createhistory"
        options={{
          title: 'Create History',
          headerShown: false,
        }}/> 
         <Stack.Screen
        name="respiratoryRate"
        options={{
          title: 'Respiratory Rate',
          headerShown: false,
        }}/> 
        <Stack.Screen
        name="bodytemperaturetracker"
        options={{
          title: 'Body Temperature Tracker',
          headerShown: false,
        }}/>
    
    </Stack>
   
  );
};

export default _layout;