import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ActivityLevel = 'mostly_sitting' | 'often_standing' | 'regularly_walking' | 'physically_intense';

const activityOptions = [
  {
    key: 'mostly_sitting' as ActivityLevel,
    title: 'Mostly Sitting',
    description: 'Seated work, low movement.',
    icon: 'chair-rolling', // changed from 'desk'
  },
  {
    key: 'often_standing' as ActivityLevel,
    title: 'Often Standing',
    description: 'Standing work, occasional walking.',
    icon: 'walk',
  },
  {
    key: 'regularly_walking' as ActivityLevel,
    title: 'Regularly Walking',
    description: 'Frequent walking, steady activity.',
    icon: 'shoe-print',
  },
  {
    key: 'physically_intense' as ActivityLevel,
    title: 'Physically Intense Work',
    description: 'Heavy labor, high exertion.',
    icon: 'arm-flex', // changed from 'hard-hat'
  },
];

interface Step3FormProps {
  selected: ActivityLevel | null;
  setSelected: React.Dispatch<React.SetStateAction<ActivityLevel | null>>;
}

const Step3Form: React.FC<Step3FormProps> = ({ selected, setSelected }) => {
  return (
    <View className="flex-1 bg-white px-5 pt-12">
      <Text className="text-2xl font-semibold text-center text-gray-900 mb-2">
        How active are you?
      </Text>
      <Text className="text-xs text-center text-gray-500 mb-6">
        Based on your lifestyle, we can assess your daily calorie requirements.
      </Text>

      <ScrollView className="">
        {activityOptions.map((option, idx) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setSelected(option.key)}
            className={`border rounded-xl px-4 py-4 flex-row items-center justify-start space-x-3 ${
              selected === option.key ? 'border-2 border-[#0cb6ab] bg-teal-50' : 'border-gray-300'
            }${idx !== activityOptions.length - 1 ? ' mb-4' : ''}`}
          >
            <MaterialCommunityIcons name={option.icon as any} size={24} color={selected === option.key ? '#0cb6ab' : 'gray'} />
            <View>
              <Text className="text-base font-medium text-gray-800 ml-4">{option.title}</Text>
              <Text className="text-sm text-gray-500 ml-4">{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Step3Form;
