import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
// import { Check } from 'lucide-react-native'; // optional: for tick icon on selected - removed for now

interface Step1LocationProps {
  location: string;
  setLocation: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
}

const languages = [
  { label: 'Hindi (हिन्दी)', value: 'hindi' },
  { label: 'English', value: 'english' },
  { label: 'Tamil (தமிழ்)', value: 'tamil' },
  { label: 'Telugu (తెలుగు)', value: 'telugu' },
  { label: 'Kannada (ಕನ್ನಡ)', value: 'kannada' },
  { label: 'Malayalam (മലയാളം)', value: 'malayalam' },
  { label: 'Gujarati (ગુજરાતી)', value: 'gujarati' },
  { label: 'Bengali (বাংলা)', value: 'bengali' },
  { label: 'Marathi (मराठी)', value: 'marathi' },
  { label: 'Other', value: 'other' },
];

const Step1Location: React.FC<Step1LocationProps> = ({ location, setLocation, language, setLanguage }) => {
  // State to track focus on the location input
  const [isLocationFocused, setIsLocationFocused] = useState(false);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-6">
      
      {/* Location Input */}
      <Text className="text-2xl font-semibold text-center mb-1">Where are you from?</Text>
      <Text className="text-gray-500 text-xs text-center mb-4">This will help us personalize the app for you.</Text>
      
      <TextInput
        className={`border-2 rounded-xl px-4 py-3 text-base mb-6 ${isLocationFocused ? 'border-[#0cb6ab]' : 'border-gray-300'}`}
        placeholder="Rohtak"
        value={location}
        onChangeText={setLocation}
        onFocus={() => setIsLocationFocused(true)}
        onBlur={() => setIsLocationFocused(false)}
      />

      {/* Language Selection */}
      <Text className="text-2xl font-semibold text-center mb-1">Which language do you prefer to speak in?</Text>
      <Text className="text-gray-500 text-xs text-center mb-4">This does not affect your app language</Text>
      
      <View className="flex flex-wrap flex-row justify-center">
        {languages.map((item) => (
          <TouchableOpacity
            key={item.value}
            onPress={() => setLanguage(item.value)}
            className={`px-4 py-2 m-1 border rounded-full ${language === item.value ? 'bg-teal-50 border-[#0cb6ab]' : 'border-gray-300'}`}
          >
            <Text className="text-sm">{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Step1Location;
