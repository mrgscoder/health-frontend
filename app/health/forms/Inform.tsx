import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
// icon library from expo
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface InformData {
  name: string;
  height: string;
  weight: string;
}

interface InformProps {
  onNext: (data: InformData) => void;
}

export default function Inform({ onNext }: InformProps) {
  const [name, setName] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleNext = () => {
    if (!name.trim() || !height.trim() || !weight.trim()) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    onNext({ name: name.trim(), height: height.trim(), weight: weight.trim() });
  };

  return (
    <ScrollView className="flex-1 p-5 bg-white">
      <Text className="text-xl text-center  font-bold text-gray-800 mb-1">
        Let's Get to Know You!
      </Text>
      <Text className="text-xs text-center  text-gray-500 mb-5">
        Please fill in your details below to get started.
      </Text>

      {/* Name Input */}
      <View className="mb-5">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="account" size={18} color="#0cb6ab" />
          <Text className="ml-2 text-base text-lg font-semibold text-[#0cb6ab]">Your Name</Text>
        </View>
        <View
          className={`bg-white border rounded-xl px-4 py-3 ${
            focusedField === 'name' ? 'border-[#0cb6ab] border-2' : 'border-gray-200'
          }`}
        >
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            className="text-base text-gray-800"
            maxLength={30}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
      </View>

      {/* Height Input */}
      <View className="mb-5">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="human-male-height" size={18} color="#0cb6ab" />
          <Text className="ml-2 text-base text-lg font-semibold text-[#0cb6ab]">Height (cm)</Text>
        </View>
        <View
          className={`bg-white border rounded-xl px-4 py-3 ${
            focusedField === 'height' ? 'border-[#0cb6ab] border-2' : 'border-gray-200'
          }`}
        >
          <TextInput
            keyboardType="numeric"
            placeholder="e.g. 170"
            value={height}
            onChangeText={setHeight}
            className="text-base text-gray-800"
            maxLength={3}
            onFocus={() => setFocusedField('height')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        <Text className="text-xs text-gray-400 mt-1">Range: 100–250 cm</Text>
      </View>

      {/* Weight Input */}
      <View className="mb-5">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="weight-kilogram" size={18} color="#0cb6ab" />
          <Text className="ml-2 text-base text-lg font-semibold text-[#0cb6ab]">Weight (kg)</Text>
        </View>
        <View
          className={`bg-white border rounded-xl px-4 py-3 ${
            focusedField === 'weight' ? 'border-[#0cb6ab] border-2' : 'border-gray-200'
          }`}
        >
          <TextInput
            keyboardType="numeric"
            placeholder="e.g. 65"
            value={weight}
            onChangeText={setWeight}
            className="text-base text-gray-800"
            maxLength={3}
            onFocus={() => setFocusedField('weight')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        <Text className="text-xs text-gray-400 mt-1">Range: 30–200 kg</Text>
      </View>

      {showWarning && (
        <Text className="text-center text-xs text-red-500 mt-2">Please fill in all fields before continuing.</Text>
      )}

      {/* Navigation */}
      <View className="mt-6">
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
