import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
// icon library from expo
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface InformData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
}

interface InformProps {
  onNext?: (data: InformData) => void;
}

export default function Inform({ onNext }: InformProps) {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateName = (name: string): string => {
    if (!name.trim()) return "Name is required";
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name should contain only letters";
    return "";
  };

  const validateHeight = (height: string): string => {
    if (!height.trim()) return "Height is required";
    const heightNum = parseInt(height);
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) return "Height should be between 100-250 cm";
    if (heightNum === 250) return "Height cannot be exactly 250 cm";
    return "";
  };

  const validateWeight = (weight: string): string => {
    if (!weight.trim()) return "Weight is required";
    const weightNum = parseInt(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 200) return "Weight should be between 1-200 kg";
    if (weightNum > 200) return "Weight cannot be above 200 kg";
    return "";
  };

  const validateAge = (age: string): string => {
    if (!age.trim()) return "Age is required";
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return "Age should be between 1-120 years";
    return "";
  };

  const validateGender = (gender: string): string => {
    if (!gender.trim()) return "Please select your gender";
    return "";
  };

  const handleNext = async () => {
    const nameError = validateName(name);
    const ageError = validateAge(age);
    const genderError = validateGender(gender);
    const heightError = validateHeight(height);
    const weightError = validateWeight(weight);

    const errors = {
      name: nameError,
      age: ageError,
      gender: genderError,
      height: heightError,
      weight: weightError
    };

    setValidationErrors(errors);

    if (nameError || ageError || genderError || heightError || weightError) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    
    const data = { name: name.trim(), age: age.trim(), gender: gender.trim(), height: height.trim(), weight: weight.trim() };
    
    if (onNext) {
      onNext(data);
    } else {
      // Default behavior when used as standalone page
      // Store the name in AsyncStorage for later use
      try {
        await AsyncStorage.setItem('userFullName', name.trim());
        console.log('✅ Stored user name in AsyncStorage:', name.trim());
      } catch (error) {
        console.log('❌ Error storing name in AsyncStorage:', error);
      }
      
      // Navigate to the next step in the form flow with collected data
      console.log('🚀 Navigating to LifestyleForm with data:', data);
      router.push({
        pathname: '/health/forms/LifestyleForm',
        params: data
      });
    }
  };

  return (
    <LinearGradient
      colors={[
        '#11B5CF',
        '#0EA5BF',
        '#0B95AF',
        '#08859F',
        '#05758F',
        '#02657F',
        '#01556F',
        '#00455F',
        '#00354F',
        '#00253F',
      ]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-5">
          {/* White rounded container for the form */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-12" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <Text className="text-xl text-center font-bold text-gray-800 mb-1">
              Let's Get to Know You!
            </Text>
            <Text className="text-xs text-center text-gray-500 mb-5">
              Please fill in your details below to get started.
            </Text>

            {/* Name Input */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="account" size={18} color="#11B5CF" />
                <Text className="ml-2 text-base text-lg font-semibold text-[#11B5CF]">Your Name</Text>
              </View>
              <View
                className={`bg-white border rounded-xl px-4 py-3 ${
                  focusedField === 'name' ? 'border-[#11B5CF] border-2' : validationErrors.name ? 'border-red-500 border-2' : 'border-gray-200'
                }`}
              >
                <TextInput
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (validationErrors.name) {
                      setValidationErrors(prev => ({...prev, name: ""}));
                    }
                  }}
                  className="text-base text-gray-800"
                  maxLength={30}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {validationErrors.name && (
                <Text className="text-xs text-red-500 mt-1">{validationErrors.name}</Text>
              )}
            </View>

            {/* Age Input */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="calendar" size={18} color="#11B5CF" />
                <Text className="ml-2 text-base text-lg font-semibold text-[#11B5CF]">Age</Text>
              </View>
              <View
                className={`bg-white border rounded-xl px-4 py-3 ${
                  focusedField === 'age' ? 'border-[#11B5CF] border-2' : validationErrors.age ? 'border-red-500 border-2' : 'border-gray-200'
                }`}
              >
                <TextInput
                  keyboardType="numeric"
                  placeholder="e.g. 25"
                  value={age}
                  onChangeText={(text) => {
                    setAge(text);
                    if (validationErrors.age) {
                      setValidationErrors(prev => ({...prev, age: ""}));
                    }
                  }}
                  className="text-base text-gray-800"
                  maxLength={3}
                  onFocus={() => setFocusedField('age')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {validationErrors.age && (
                <Text className="text-xs text-red-500 mt-1">{validationErrors.age}</Text>
              )}
            </View>

            {/* Gender Selection */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="gender-male-female" size={18} color="#11B5CF" />
                <Text className="ml-2 text-base text-lg font-semibold text-[#11B5CF]">Gender</Text>
              </View>
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={() => {
                    setGender("Male");
                    if (validationErrors.gender) {
                      setValidationErrors(prev => ({...prev, gender: ""}));
                    }
                  }}
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
                    validationErrors.gender 
                      ? 'border-red-500 border-2 bg-white' 
                      : 'bg-white'
                  }`}
                >
                  <MaterialCommunityIcons 
                    name={gender === "Male" ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                    size={20} 
                    color={gender === "Male" ? "#11B5CF" : validationErrors.gender ? "#ef4444" : "#9ca3af"} 
                  />
                  <Text className={`ml-2 font-medium ${
                    gender === "Male" ? 'text-[#11B5CF]' : validationErrors.gender ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setGender("Female");
                    if (validationErrors.gender) {
                      setValidationErrors(prev => ({...prev, gender: ""}));
                    }
                  }}
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
                    validationErrors.gender 
                      ? 'border-red-500 border-2 bg-white' 
                      : 'bg-white'
                  }`}
                >
                  <MaterialCommunityIcons 
                    name={gender === "Female" ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                    size={20} 
                    color={gender === "Female" ? "#11B5CF" : validationErrors.gender ? "#ef4444" : "#9ca3af"} 
                  />
                  <Text className={`ml-2 font-medium ${
                    gender === "Female" ? 'text-[#11B5CF]' : validationErrors.gender ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
              {validationErrors.gender && (
                <Text className="text-xs text-red-500 mt-1">{validationErrors.gender}</Text>
              )}
            </View>

            {/* Height Input */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="human-male-height" size={18} color="#11B5CF" />
                <Text className="ml-2 text-base text-lg font-semibold text-[#11B5CF]">Height (cm)</Text>
              </View>
              <View
                className={`bg-white border rounded-xl px-4 py-3 ${
                  focusedField === 'height' ? 'border-[#11B5CF] border-2' : validationErrors.height ? 'border-red-500 border-2' : 'border-gray-200'
                }`}
              >
                <TextInput
                  keyboardType="numeric"
                  placeholder="e.g. 170"
                  value={height}
                  onChangeText={(text) => {
                    setHeight(text);
                    if (validationErrors.height) {
                      setValidationErrors(prev => ({...prev, height: ""}));
                    }
                  }}
                  className="text-base text-gray-800"
                  maxLength={3}
                  onFocus={() => setFocusedField('height')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {validationErrors.height && (
                <Text className="text-xs text-red-500 mt-1">{validationErrors.height}</Text>
              )}
            </View>

            {/* Weight Input */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="weight-kilogram" size={18} color="#11B5CF" />
                <Text className="ml-2 text-base text-lg font-semibold text-[#11B5CF]">Weight (kg)</Text>
              </View>
              <View
                className={`bg-white border rounded-xl px-4 py-3 ${
                  focusedField === 'weight' ? 'border-[#11B5CF] border-2' : validationErrors.weight ? 'border-red-500 border-2' : 'border-gray-200'
                }`}
              >
                <TextInput
                  keyboardType="numeric"
                  placeholder="e.g. 65"
                  value={weight}
                  onChangeText={(text) => {
                    setWeight(text);
                    if (validationErrors.weight) {
                      setValidationErrors(prev => ({...prev, weight: ""}));
                    }
                  }}
                  className="text-base text-gray-800"
                  maxLength={3}
                  onFocus={() => setFocusedField('weight')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {validationErrors.weight && (
                <Text className="text-xs text-red-500 mt-1">{validationErrors.weight}</Text>
              )}
            </View>

            {showWarning && (
              <Text className="text-center text-xs text-red-500 mt-2">Please fill in all fields correctly before continuing.</Text>
            )}

            {/* Navigation */}
            <View className="mt-6">
              <TouchableOpacity
                onPress={handleNext}
                className="bg-[#11B5CF] py-3 rounded-full items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">NEXT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
