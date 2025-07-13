import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

const _layout = () => {
  return (
   <Tabs>
     <Tabs.Screen
      name="Index"         
      options={{
        title: 'Home',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-variant" size={size} color={color} />
        ),
      }}/>
     <Tabs.Screen
      name="Food"         
      options={{
        title: 'food',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <FontAwesome5 name="user-circle" size={size} color={color} />
        ),
      }}/>
      <Tabs.Screen
      name="Water"  
      options={{
        title: 'Water',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="water" size={size} color={color} />
        ),
      }}/>
      <Tabs.Screen
      name="Tracker"
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

const styles = StyleSheet.create({})