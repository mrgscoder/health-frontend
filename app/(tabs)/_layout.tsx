import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
   <Tabs>
     <Tabs.Screen
      name="index"         
      options={{
        title: 'Home',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-variant" size={size} color={color} />
        ),
      }}/>
     <Tabs.Screen
      name="food"         
      options={{
        title: 'food',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="user-circle" size={size} color={color} />
        ),
      }}/>
      <Tabs.Screen
      name="water"  
      options={{
        title: 'Water',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="water" size={size} color={color} />
        ),
      }}/>
      <Tabs.Screen
      name="tracker"
      options={{
        title: 'Tracker',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="bookmark" size={size} color={color} />
        ),
      }}/>
   </Tabs>
  )
}

export default _layout