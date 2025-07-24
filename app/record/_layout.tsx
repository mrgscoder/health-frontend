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
        <Stack.Screen
        name="stepCount"
        options={{
          title: 'Step Count',
          headerShown: false,
        }}/>
      <Stack.Screen
        name="Cardio"
        options={{
          title: 'Cardio',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ExerciseTimer"
        options={{
          title: 'Exercise Timer',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddSugarReading"
        options={{
          title: 'Add Sugar Reading',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SugarHistory"
        options={{
          title: 'Sugar History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BodyFatScreen"
        options={{
          title: 'Body Fat Calculator',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BodyFatHistory"
        options={{
          title: 'Body Fat History',
          headerShown: false,
        }}
      />
    
    </Stack>
   
  );
};

export default _layout;