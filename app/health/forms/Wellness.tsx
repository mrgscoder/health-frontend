import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface WellnessData {
  goal: string;
  stress: string;
}

interface WellnessProps {
  onNext: (data: WellnessData) => void;
  onBack: () => void;
}

const options = [
  { label: 'Weight Loss', icon: <MaterialCommunityIcons name="weight" size={20} color="#0cb6ab" /> },
  { label: 'Muscle Gain', icon: <MaterialCommunityIcons name="dumbbell" size={20} color="#0cb6ab" /> },
  { label: 'Stress Management', icon: <Feather name="smile" size={20} color="#0cb6ab" /> },
  { label: 'Better Sleep', icon: <Feather name="moon" size={20} color="#0cb6ab" /> },
  { label: 'General Wellness', icon: <FontAwesome5 name="heartbeat" size={20} color="#0cb6ab" /> },
];

const stressLevels = ["Low", "Moderate", "High"];

export default function Wellness({ onNext, onBack }: WellnessProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedStress, setSelectedStress] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleNext = () => {
    if (!selectedGoal || !selectedStress) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    onNext({ goal: selectedGoal, stress: selectedStress });
  };

  return (
    <ScrollView className="flex-1 p-5 bg-white">
      <Text className="text-xl font-semibold text-gray-800 mb-1">What are you looking for?</Text>
      <Text className="text-xs text-gray-500 mb-5">Selecting one or more options would help us tailor your experience.</Text>

      {/* Health Goals */}
      {options.map((item) => {
        const isSelected = selectedGoal === item.label;
        return (
          <TouchableOpacity
            key={item.label}
            onPress={() => setSelectedGoal(item.label)}
            className={`flex-row items-center justify-between border rounded-xl px-4 py-4 mb-3  ${
              isSelected ? "border-[#0cb6ab] bg-teal-50" : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row items-center">
              {item.icon}
              <View style={{ width: 12 }} />
              <Text className="text-base text-gray-800">{item.label}</Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border ${
                isSelected ? "bg-[#0cb6ab] border-[#0cb6ab]" : "border-gray-300"
              } items-center justify-center`}
            >
              {isSelected && <Feather name="check" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Stress Level Title */}
      <Text className="text-lg font-semibold text-gray-800 mt-6 mb-3">Your Stress Level</Text>

      {/* Stress Levels */}
      <View className="flex-row flex-wrap">
        {stressLevels.map((level) => {
          const isSelected = selectedStress === level;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => setSelectedStress(level)}
              className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                isSelected ? "bg-teal-50 border-[#0cb6ab]" : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm ${
                  isSelected ? "text-[#0cb6ab] font-semibold" : "text-gray-700"
                }`}
              >
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showWarning && (
        <Text className="text-center text-xs text-red-500 mt-2">Please select a goal and stress level before continuing.</Text>
      )}

      {/* Navigation Buttons */}
      
      <View className="mt-10">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#0cb6ab] py-3 rounded-lg items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">NEXT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
