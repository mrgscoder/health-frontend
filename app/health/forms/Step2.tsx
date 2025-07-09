import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

// -----------------------------
// Types
// -----------------------------

export type OptionId =
  | 'coach_guidance'
  | 'snap'
  | 'diet_plan'
  | 'weight_loss'
  | 'glp1'
  | 'intermittent_fasting'
  | 'count_calories'
  | 'muscle_gain'
  | 'workout_yoga'
  | 'healthy_foods'
  | 'cgm_healthily_pro';

interface Option {
  id: OptionId;
  label: string;
}

interface Step2Props {
  selectedOptions: OptionId[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<OptionId[]>>;
}

// -----------------------------
// Component
// -----------------------------

const Step2: React.FC<Step2Props> = ({ selectedOptions, setSelectedOptions }) => {
  const options: Option[] = [
    { id: 'coach_guidance', label: 'COACH GUIDANCE' },
    { id: 'snap', label: 'SNAP' },
    { id: 'diet_plan', label: 'DIET PLAN' },
    { id: 'weight_loss', label: 'WEIGHT LOSS' },
    { id: 'glp1', label: 'GLP-1' },
    { id: 'intermittent_fasting', label: 'INTERMITTENT FASTING' },
    { id: 'count_calories', label: 'COUNT CALORIES' },
    { id: 'muscle_gain', label: 'MUSCLE GAIN' },
    { id: 'workout_yoga', label: 'WORKOUT/YOGA' },
    { id: 'healthy_foods', label: 'HEALTHY FOODS' },
   
  ];

  const handleOptionToggle = (optionId: OptionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white p-6"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View className="items-center mb-8">
        <View className=" rounded-full mb-4" />
        <Text className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          What's your search?
        </Text>
        <Text className="text-gray-500 text-xs text-center">
          Selecting one or more options would help us tailor your experience.
        </Text>
      </View>

      {/* Options List */}
      <View className="space-y-9">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleOptionToggle(option.id)}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between p-4 rounded-xl border-2 mb-4 ${
                isSelected
                  ? 'border-[#0cb6ab] bg-teal-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className={`font-medium text-sm ${
                isSelected ? 'text-[#0cb6ab]' : 'text-gray-700'
              }`}>
                {option.label}
              </Text>

              <View className={`w-5 h-5 border-2 rounded-md items-center justify-center ${
                isSelected ? 'border-[#0cb6ab] bg-[#0cb6ab]' : 'border-gray-300 bg-white'
              }`}
              >
                {isSelected && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default Step2;