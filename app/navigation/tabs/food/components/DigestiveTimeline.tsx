import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DigestiveTimelineItem } from '../types/foodTypes';

interface DigestiveTimelineProps {
  digestiveTimeline: DigestiveTimelineItem[];
}

const DigestiveTimeline: React.FC<DigestiveTimelineProps> = ({ digestiveTimeline }) => {
  return (
    <View className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 shadow-sm">
      <View className="flex-row items-center mb-2">
        <MaterialCommunityIcons name="clock-outline" size={24} color="#65A30D" />
        <Text className="text-xl font-semibold text-gray-800 ml-2">Digestive Load Timeline</Text>
      </View>
      <Text className="text-sm text-gray-600 mb-4">
        How long different parts of your meals will stay in your system
      </Text>
      
      {digestiveTimeline.map((meal, index) => (
        <View key={meal.id} className="mb-4 pb-3 border-b border-gray-200">
          <Text className="text-base font-semibold text-gray-800 mb-2 capitalize">{meal.name} ({meal.category})</Text>
          
          <View className="mb-2">
            <View className="mb-1">
              <View 
                className="p-2 rounded-md mb-1" 
                style={{ 
                  backgroundColor: '#e8e4f5', 
                  width: `${Math.min((meal.digestion.carbs.duration / 6) * 100, 90)}%`,
                  minWidth: 120
                }}
              >
                <Text className="text-gray-800 text-xs font-semibold text-center">
                  Carbs: {meal.digestion.carbs.duration}h
                </Text>
              </View>
            </View>
            
            <View className="mb-1">
              <View 
                className="p-2 rounded-md mb-1" 
                style={{ 
                  backgroundColor: '#d1d5db', 
                  width: `${Math.min((meal.digestion.protein.duration / 6) * 100, 90)}%`,
                  minWidth: 120
                }}
              >
                <Text className="text-gray-800 text-xs font-semibold text-center">
                  Protein: {meal.digestion.protein.duration}h
                </Text>
              </View>
            </View>
            
            <View className="mb-1">
              <View 
                className="p-2 rounded-md mb-1" 
                style={{ 
                  backgroundColor: '#d1f5a8', 
                  width: `${Math.min((meal.digestion.fat.duration / 6) * 100, 90)}%`,
                  minWidth: 120
                }}
              >
                <Text className="text-gray-800 text-xs font-semibold text-center">
                  Fat: {meal.digestion.fat.duration}h
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default DigestiveTimeline; 