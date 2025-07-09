import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

interface Step4Props {
  onNext?: (age: number) => void;
  onBack?: () => void;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack }) => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const ages = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
  };

  const handleNext = () => {
    if (selectedAge && onNext) {
      onNext(selectedAge);
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
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mt-8 mb-12">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            What's your Age?
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Your age determines how much you should consume.
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            (Select your age in years)
          </Text>
        </View>

        {/* Age Selection */}
        <View className="space-y-4 mb-8">
          {ages.map((age, idx) => (
            <TouchableOpacity
              key={age}
              onPress={() => handleAgeSelect(age)}
              className={`
                py-4 px-6 rounded-xl border-2
                ${selectedAge === age 
                  ? 'border-[#0cb6ab] bg-teal-50' 
                  : 'border-gray-200 bg-white'}
                ${idx !== ages.length - 1 ? ' mb-4' : ''}
              `}
            >
              <Text
                className={`
                  text-center text-lg font-medium
                  ${selectedAge === age ? 'text-[#0cb6ab]' : 'text-gray-700'}
                `}
              >
                {age}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

     
    </SafeAreaView>
  );
};

export default Step4;