import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';

interface Step6Props {
  onNext?: (weight: number, unit: 'kg' | 'lb') => void;
  onBack?: () => void;
}

const Step6: React.FC<Step6Props> = ({ onNext, onBack }) => {
  const [selectedWeight, setSelectedWeight] = useState<number>(80);
  const [selectedDecimal, setSelectedDecimal] = useState<number>(0);
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const scrollViewRef = useRef<ScrollView>(null);

  const screenHeight = Dimensions.get('window').height;
  const itemHeight = 60;
  const containerHeight = itemHeight * 5;
  const centerOffset = (containerHeight - itemHeight) / 2;

  // Generate weight options based on unit
  const generateWeights = () => {
    const weights = [];
    if (unit === 'kg') {
      for (let i = 30; i <= 200; i++) {
        weights.push(i);
      }
    } else {
      for (let i = 66; i <= 440; i++) {
        weights.push(i);
      }
    }
    return weights;
  };

  const generateDecimals = () => {
    const decimals = [];
    for (let i = 0; i <= 9; i++) {
      decimals.push(i);
    }
    return decimals;
  };

  const weights = generateWeights();
  const decimals = generateDecimals();

  const handleWeightScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    const weight = weights[index];
    if (weight !== undefined) {
      setSelectedWeight(weight);
    }
  };

  const handleDecimalScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    const decimal = decimals[index];
    if (decimal !== undefined) {
      setSelectedDecimal(decimal);
    }
  };

  // Convert weight and decimal when unit changes
  const handleUnitToggle = (selectedUnit: 'kg' | 'lb') => {
    if (selectedUnit === unit) return;
    let total = selectedWeight + selectedDecimal / 10;
    let newWeight = selectedWeight;
    let newDecimal = selectedDecimal;
    if (selectedUnit === 'lb') {
      // Convert kg to lb
      total = total * 2.20462;
    } else {
      // Convert lb to kg
      total = total / 2.20462;
    }
    newWeight = Math.floor(total);
    newDecimal = Math.round((total - newWeight) * 10);
    setSelectedWeight(newWeight);
    setSelectedDecimal(newDecimal);
    setUnit(selectedUnit);
  };

  

  const renderPickerItem = (
    value: number,
    isSelected: boolean,
    index: number,
    totalItems: number
  ) => {
    const isFirst = index === 0;
    const isLast = index === totalItems - 1;
    const opacity = isSelected ? 1 : 0.3;
    const fontSize = isSelected ? 48 : 36;
    
    return (
      <View
        key={value}
        className="justify-center items-center"
        style={{ height: itemHeight }}
      >
        <Text
          className={`font-bold text-gray-700 ${isSelected ? 'text-5xl' : 'text-4xl'}`}
          style={{ 
            opacity,
            fontSize: isSelected ? 48 : 36,
          }}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-1">
          <Text className="text-xl font-bold text-gray-800 mb-3">
            What's your current weight?
          </Text>
          <Text className="text-base text-gray-600 text-center text-sm leading-6">
            This will help us determine your goal, and monitor your
            progress over time.
          </Text>
        </View>

        {/* Weight Picker */}
        <View className="flex-1 justify-center">
          <View className="flex-row justify-center items-center">
            {/* Main Weight Picker */}
            <View className="relative">
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onMomentumScrollEnd={handleWeightScroll}
                contentContainerStyle={{
                  paddingTop: centerOffset,
                  paddingBottom: centerOffset,
                }}
                style={{ height: containerHeight }}
              >
                {weights.map((weight, index) => 
                  renderPickerItem(weight, weight === selectedWeight, index, weights.length)
                )}
              </ScrollView>
              
              {/* Selection Indicator */}
              <View 
                className="absolute left-0 right-0 border-t-2 border-b-2 border-gray-300 pointer-events-none"
                style={{
                  top: centerOffset,
                  height: itemHeight,
                }}
              />
            </View>

            {/* Decimal Point */}
            <View className="mx-4">
              <Text className="text-5xl font-bold text-gray-700">.</Text>
            </View>

            {/* Decimal Picker */}
            <View className="relative">
              <ScrollView
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onMomentumScrollEnd={handleDecimalScroll}
                contentContainerStyle={{
                  paddingTop: centerOffset,
                  paddingBottom: centerOffset,
                }}
                style={{ height: containerHeight }}
              >
                {decimals.map((decimal, index) => 
                  renderPickerItem(decimal, decimal === selectedDecimal, index, decimals.length)
                )}
              </ScrollView>
              
              {/* Selection Indicator */}
              <View 
                className="absolute left-0 right-0 border-t-2 border-b-2 border-gray-300 pointer-events-none"
                style={{
                  top: centerOffset,
                  height: itemHeight,
                }}
              />
            </View>
          </View>
        </View>

        {/* Unit Toggle */}
        <View className="mt-8 mb-6">
          <View className="flex-row bg-gray-200 rounded-full p-1">
            <TouchableOpacity
              className={`flex-1 py-3 px-6 rounded-full ${
                unit === 'kg' ? 'bg-[#0cb6ab]' : 'bg-transparent'
              }`}
              onPress={() => handleUnitToggle('kg')}
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-semibold ${
                  unit === 'kg' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 px-6 rounded-full ${
                unit === 'lb' ? 'bg-[#0cb6ab]' : 'bg-transparent'
              }`}
              onPress={() => handleUnitToggle('lb')}
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-semibold ${
                  unit === 'lb' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Lb
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        
      </View>
    </SafeAreaView>
  );
};

export default Step6;