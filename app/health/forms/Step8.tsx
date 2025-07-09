import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';

interface Step8Props {
  onNext?: (pace: number, timeframe: string) => void;
  onBack?: () => void;
}

const Step8: React.FC<Step8Props> = ({ onNext, onBack }) => {
  const [selectedPace, setSelectedPace] = useState<number>(1.0);
  const [timeframe, setTimeframe] = useState<string>('2 months');
  const [sliderPosition, setSliderPosition] = useState<number>(0.4); // 0 to 1
  
  const sliderWidth = 300;
  const knobSize = 24;
  const minPace = 0.2;
  const maxPace = 2.0;

  const calculateTimeframe = (pace: number) => {
    // Assuming a total goal of 10kg for calculation
    const totalGoal = 10;
    const weeksToGoal = totalGoal / pace;
    const monthsToGoal = Math.round(weeksToGoal / 4.33);
    
    if (monthsToGoal <= 1) {
      return '1 month';
    } else if (monthsToGoal <= 12) {
      return `${monthsToGoal} months`;
    } else {
      const years = Math.floor(monthsToGoal / 12);
      const remainingMonths = monthsToGoal % 12;
      if (remainingMonths === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
    }
  };

  const updatePace = (position: number) => {
    const newPace = minPace + (maxPace - minPace) * position;
    const roundedPace = Math.round(newPace * 10) / 10;
    setSelectedPace(roundedPace);
    setTimeframe(calculateTimeframe(roundedPace));
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (event, gestureState) => {
      const maxDistance = sliderWidth - knobSize;
      const newPosition = Math.max(0, Math.min(1, (gestureState.dx + sliderPosition * maxDistance) / maxDistance));
      setSliderPosition(newPosition);
      updatePace(newPosition);
    },
    onPanResponderRelease: (event, gestureState) => {
      const maxDistance = sliderWidth - knobSize;
      const newPosition = Math.max(0, Math.min(1, (gestureState.dx + sliderPosition * maxDistance) / maxDistance));
      setSliderPosition(newPosition);
      updatePace(newPosition);
    },
  });

  const knobLeft = sliderPosition * (sliderWidth - knobSize);
  const progressWidth = sliderPosition * sliderWidth;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            How fast do you want to reach your goal?
          </Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            This pace will require extreme commitment.
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1 justify-center items-center">
          {/* Pace Display */}
          <View className="items-center mb-16">
            <Text className="text-7xl font-bold text-gray-800 mb-2">
              {selectedPace.toFixed(1)} kg
            </Text>
            <Text className="text-xl text-gray-600 font-medium">
              per week
            </Text>
          </View>

          {/* Custom Slider */}
          <View className="items-center mb-16" style={{ width: sliderWidth }}>
            <View className="relative w-full h-2 bg-gray-300 rounded-full">
              {/* Progress Track */}
              <View
                className="absolute left-0 top-0 h-2 bg-emerald-500 rounded-full"
                style={{ width: progressWidth }}
              />
              
              {/* Slider Knob */}
              <View
                className="absolute top-0 w-6 h-6 bg-emerald-500 rounded-full shadow-lg"
                style={{
                  left: knobLeft,
                  marginTop: -10,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                {...panResponder.panHandlers}
              />
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="mb-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-center text-gray-600 text-base">
              You will reach your goal in about{' '}
              <Text className="font-semibold text-emerald-600">{timeframe}</Text>.
            </Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center"
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text className="text-gray-600 text-lg font-bold">←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center"
            onPress={() => onNext?.(selectedPace, timeframe)}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Step8;