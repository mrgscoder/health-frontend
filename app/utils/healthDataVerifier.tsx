import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { getUserHealthData, HealthData } from './authUtils';

interface HealthDataVerifierProps {
  onDataReceived?: (data: HealthData) => void;
}

const HealthDataVerifier: React.FC<HealthDataVerifierProps> = ({ onDataReceived }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealthData = async () => {
    setLoading(true);
    try {
      const data = await getUserHealthData();
      setHealthData(data);
      if (data && onDataReceived) {
        onDataReceived(data);
      }
    } catch (error) {
      console.log('Error checking health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealthData();
  }, []);

  if (loading) {
    return (
      <View className="p-4">
        <Text className="text-gray-600">Loading health data...</Text>
      </View>
    );
  }

  if (!healthData) {
    return (
      <View className="p-4">
        <Text className="text-gray-600">No health data found</Text>
        <TouchableOpacity 
          className="bg-blue-500 p-2 rounded mt-2"
          onPress={checkHealthData}
        >
          <Text className="text-white text-center">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-bold mb-4">Health Data Verification</Text>
      
      <View className="bg-green-50 p-4 rounded-lg mb-4">
        <Text className="font-semibold text-green-800">User Info</Text>
        <Text className="text-green-700">Name: {healthData.name || 'N/A'}</Text>
        <Text className="text-green-700">Height: {healthData.height || 'N/A'} cm</Text>
        <Text className="text-green-700">Weight: {healthData.weight || 'N/A'} kg</Text>
      </View>

      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        <Text className="font-semibold text-blue-800">Health Metrics</Text>
        <Text className="text-blue-700">BMI: {healthData.bmi || 'N/A'} ({healthData.bmiCategory || 'N/A'})</Text>
        <Text className="text-blue-700">Health Score: {healthData.healthScore || 'N/A'}%</Text>
      </View>

      <View className="bg-yellow-50 p-4 rounded-lg mb-4">
        <Text className="font-semibold text-yellow-800">Lifestyle</Text>
        <Text className="text-yellow-700">Activity Level: {healthData.activityLevel || 'N/A'}</Text>
        <Text className="text-yellow-700">Sleep Hours: {healthData.sleepHours || 'N/A'}</Text>
        <Text className="text-yellow-700">Diet Preference: {healthData.dietPreference || 'N/A'}</Text>
        <Text className="text-yellow-700">Stress Level: {healthData.stressLevel || 'N/A'}</Text>
        <Text className="text-yellow-700">Health Goal: {healthData.healthGoal || 'N/A'}</Text>
      </View>

      <TouchableOpacity 
        className="bg-blue-500 p-3 rounded-lg"
        onPress={checkHealthData}
      >
        <Text className="text-white text-center font-semibold">Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HealthDataVerifier; 