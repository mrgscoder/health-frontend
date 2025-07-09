import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const handleCustomizeApp = () => {
    // Navigate to customization screen
    console.log("Customize app pressed");
  };

  const handleQuickAction = (action) => {
    console.log(`${action} pressed`);
  };

  return (
    <View className="flex-1 bg-[#1a6093]">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header Section */}
      <View className="bg-[#1a6093] px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-white">Good Morning</Text>
            <Text className="text-gray-300">How are you feeling today?</Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="notifications-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {/* Customize App Button */}
        <TouchableOpacity
          onPress={handleCustomizeApp}
          className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={20} color="#3B82F6" />
          <Text className="text-blue-600 font-medium ml-2">Customize your app according to you</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Health Overview Card */}
        <View className="mx-6 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-2">Today's Health Overview</Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-blue-100 text-sm">Overall Status</Text>
              <Text className="text-white text-lg font-semibold">Good</Text>
            </View>
            <View className="bg-white bg-opacity-20 rounded-full p-3">
              <Ionicons name="heart" size={32} color="white" />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              { name: 'Book Appointment', icon: 'calendar-outline', color: 'bg-green-500' },
              { name: 'Symptoms Check', icon: 'medical-outline', color: 'bg-red-500' },
              { name: 'Medications', icon: 'pill-outline', color: 'bg-orange-500' },
              { name: 'Health Records', icon: 'document-text-outline', color: 'bg-blue-500' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickAction(action.name)}
                className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm"
                activeOpacity={0.8}
              >
                <View className={`${action.color} rounded-xl w-12 h-12 items-center justify-center mb-3`}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text className="text-gray-800 font-medium">{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Stats */}
        <View className="mx-6 mt-2">
          <Text className="text-xl font-bold text-gray-800 mb-4">Health Stats</Text>
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1">
                <Text className="text-gray-600 text-sm">Heart Rate</Text>
                <Text className="text-2xl font-bold text-red-500">72 BPM</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-gray-600 text-sm">Blood Pressure</Text>
                <Text className="text-2xl font-bold text-blue-500">120/80</Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gray-600 text-sm">Weight</Text>
                <Text className="text-2xl font-bold text-green-500">68 kg</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-center">
              <View className="flex-1 bg-gray-200 rounded-full h-2">
                <View className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
              </View>
              <Text className="text-gray-600 text-sm ml-3">75% Health Score</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="mx-6 mt-6 mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center">
              <View className="bg-blue-100 rounded-full p-3 mr-4">
                <Ionicons name="person-outline" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold">Dr. Sarah Johnson</Text>
                <Text className="text-gray-600">General Checkup</Text>
                <Text className="text-gray-500 text-sm">Tomorrow, 10:00 AM</Text>
              </View>
              <TouchableOpacity className="bg-blue-500 rounded-full px-4 py-2">
                <Text className="text-white text-sm font-medium">View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Health Tips */}
        <View className="mx-6 mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Daily Health Tip</Text>
          <View className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6">
            <View className="flex-row items-start">
              <View className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                <Ionicons name="bulb-outline" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold mb-2">Stay Hydrated</Text>
                <Text className="text-white text-sm opacity-90">
                  Drink at least 8 glasses of water daily to keep your body hydrated and maintain optimal health.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}