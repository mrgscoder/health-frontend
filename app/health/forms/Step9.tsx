import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

interface Step9Props {
  onNext?: (conditions: string[]) => void;
  onBack?: () => void;
}

const Step9: React.FC<Step9Props> = ({ onNext, onBack }) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const medicalConditions = [
    'None',
    'Diabetes',
    'Pre-Diabetes',
    'Cholesterol',
    'Hypertension',
    'PCOS',
    'Thyroid',
    'Physical injury',
    'Excessive stress/anxiety',
    'Sleep issues',
    'Depression',
    'Anger issues',
    'Loneliness',
    'Relationship stress',
  ];

  const handleConditionSelect = (condition: string) => {
    if (condition === 'None') {
      // If "None" is selected, clear all other selections
      setSelectedConditions(selectedConditions.includes('None') ? [] : ['None']);
    } else {
      // If any other condition is selected, remove "None" if it exists
      let newConditions = selectedConditions.filter(c => c !== 'None');
      
      if (newConditions.includes(condition)) {
        // Remove condition if already selected
        newConditions = newConditions.filter(c => c !== condition);
      } else {
        // Add condition if not selected
        newConditions = [...newConditions, condition];
      }
      
      setSelectedConditions(newConditions);
    }
  };

  const isConditionSelected = (condition: string) => {
    return selectedConditions.includes(condition);
  };

  const handleNext = () => {
    if (onNext) {
      onNext(selectedConditions);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const renderConditionButton = (condition: string) => {
    const isSelected = isConditionSelected(condition);
    const isNone = condition === 'None';
    
    return (
      <TouchableOpacity
        key={condition}
        className={`flex-row items-center mb-4 p-4 rounded-2xl border-2 ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 bg-white'
        }`}
        onPress={() => handleConditionSelect(condition)}
        activeOpacity={0.8}
      >
        {/* Custom Radio Button */}
        <View
          className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
            isSelected
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-gray-300 bg-white'
          }`}
        >
          {isSelected && (
            <View className="w-2 h-2 rounded-full bg-white" />
          )}
        </View>
        
        {/* Condition Text */}
        <Text
          className={`text-lg font-medium ${
            isSelected ? 'text-emerald-600' : 'text-gray-700'
          }`}
        >
          {condition}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
              Any Medical Condition we should be aware of?
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              This info will help us guide you to your fitness goals
              safely and quickly.
            </Text>
          </View>

          {/* Medical Conditions List */}
          <View className="flex-1 mb-8">
            {medicalConditions.map((condition) => renderConditionButton(condition))}
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row justify-between items-center mt-4">
            <TouchableOpacity
              className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center"
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text className="text-gray-600 text-lg font-bold">←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center"
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Step9;