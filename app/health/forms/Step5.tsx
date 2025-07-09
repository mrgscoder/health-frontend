import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

interface Step5Props {
  onNext?: (height: string) => void;
  onBack?: () => void;
}

const Step5: React.FC<Step5Props> = ({ onNext, onBack }) => {
  const [unit, setUnit] = useState<'ft' | 'cm'>('ft');
  const [selectedIndex, setSelectedIndex] = useState<number>(2); // default to 5' 7"

  // Base heights stored as ft/in for easy conversion
  const baseHeights = [
    { ft: 3, inches: 5 },
    { ft: 4, inches: 6 },
    { ft: 5, inches: 7 },
    { ft: 6, inches: 8 },
    { ft: 7, inches: 9 },
  ];

  // Helper to format height based on the selected unit
  const formatHeight = (
    h: { ft: number; inches: number },
    currentUnit: 'ft' | 'cm',
  ) => {
    if (currentUnit === 'ft') {
      return `${h.ft}' ${h.inches}"`;
    }
    const cm = Math.round((h.ft * 12 + h.inches) * 2.54);
    return `${cm} cm`;
  };

  // Height options rendered to the user
  const heightOptions = baseHeights.map((h) => formatHeight(h, unit));

  const handleHeightSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleUnitToggle = (selectedUnit: 'ft' | 'cm') => {
    setUnit(selectedUnit);
  };

  const handleNext = () => {
    if (onNext) {
      onNext(heightOptions[selectedIndex]);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-2xl font-bold text-gray-800 mb-3">
              How tall are you?
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Your height will help us calculate important body stats
              to help you reach your goals faster.
            </Text>
          </View>

          {/* Height Selection */}
          <View className="flex-1 justify-center">
            <View>
              {heightOptions.map((height, index) => (
                <TouchableOpacity
                  key={index}
                  className={`py-4 px-6 my-3 rounded-2xl border-2 ${
                    selectedIndex === index
                      ? 'border-[#0cb6ab] bg-teal-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => handleHeightSelect(index)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center text-2xl font-semibold ${
                      selectedIndex === index
                        ? 'text-[#0cb6ab]'
                        : 'text-gray-700'
                    }`}
                  >
                    {height}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Unit Toggle */}
          <View className="mt-8 mb-6">
            <View className="flex-row bg-gray-200 rounded-full p-1">
              <TouchableOpacity
                className={`flex-1 py-3 px-6 rounded-full ${
                  unit === 'ft' ? 'bg-[#0cb6ab]' : 'bg-transparent'
                }`}
                onPress={() => handleUnitToggle('ft')}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-center font-semibold ${
                    unit === 'ft' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  Ft/In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-6 rounded-full ${
                  unit === 'cm' ? 'bg-[#0cb6ab]' : 'bg-transparent'
                }`}
                onPress={() => handleUnitToggle('cm')}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-center font-semibold ${
                    unit === 'cm' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  Cm
                </Text>
              </TouchableOpacity>
            </View>
          </View>

      
         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Step5;