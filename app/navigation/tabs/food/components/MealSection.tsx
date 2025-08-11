import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MealFood, FoodItem } from '../types/foodTypes';
import { getMealIcon } from '../utils/foodUtils';

interface MealSectionProps {
  meal: string;
  mealFoods: MealFood[];
  onAddFood: (mealType: string) => void;
  onRemoveFood: (mealType: string, foodIndex: number) => void;
  onUpdateQuantity: (mealType: string, foodIndex: number, newQuantity: number) => void;
  loading: boolean;
  selectedMeal: string;
}

const MealSection: React.FC<MealSectionProps> = ({
  meal,
  mealFoods,
  onAddFood,
  onRemoveFood,
  onUpdateQuantity,
  loading,
  selectedMeal
}) => {
  const renderMealFoodItem = (mealFood: MealFood, index: number) => (
    <View key={index} className="bg-green-50 rounded-xl p-3 mb-2 shadow-sm border border-[#d6f3a0]">
      <View className="flex-row justify-between items-start">
        {/* Food Image */}
        {mealFood.food.imageUrl ? (
          <Image
            source={{ uri: mealFood.food.imageUrl }}
            style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View 
            style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 8, 
              marginRight: 12,
              backgroundColor: '#f3f4f6',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 20 }}>{mealFood.food.icon}</Text>
          </View>
        )}
        
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">{mealFood.food.name}</Text>
        </View>
        
        <View className="items-end">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => onUpdateQuantity(meal, index, Math.max(1, mealFood.quantity - 1))}
              className="bg-[#d6f3a0] w-8 h-8 rounded-full justify-center items-center mr-2 active:bg-lime-700"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-black font-bold text-lg" style={{ textAlign: 'center', lineHeight: 20 }}>-</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 mx-2">{mealFood.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(meal, index, mealFood.quantity + 1)}
              className="bg-[#d6f3a0] w-8 h-8 rounded-full justify-center items-center ml-2 active:bg-lime-700"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-black font-bold text-lg" style={{ textAlign: 'center', lineHeight: 20 }}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRemoveFood(meal, index)}
              className="bg-black w-6 h-6 rounded-full justify-center items-center ml-3"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-xs" style={{ textAlign: 'center', lineHeight: 16 }}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View className="items-end">
            <Text className="text-sm text-gray-700 mb-1">{mealFood.food.calories * mealFood.quantity} cal</Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-xs text-gray-700"><Text className="font-bold">C:</Text> {mealFood.food.carbs * mealFood.quantity}g</Text>
              <Text className="text-xs text-gray-700"><Text className="font-bold">F:</Text> {mealFood.food.fat * mealFood.quantity}g</Text>
              <Text className="text-xs text-gray-700"><Text className="font-bold">P:</Text> {mealFood.food.protein * mealFood.quantity}g</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="mb-6 p-4 bg-green-50 rounded-2xl shadow-md border border-green-200">
      <View className="flex-row items-center mb-3">
        <MaterialCommunityIcons name={getMealIcon(meal) as any} size={24} color="#65A30D" />
        <Text className="text-xl font-semibold text-gray-800 ml-2">{meal}</Text>
      </View>

      {mealFoods.length > 0 ? (
        <View className="mb-3">
          {mealFoods.map((mealFood: MealFood, index: number) => 
            renderMealFoodItem(mealFood, index)
          )}
        </View>
      ) : (
        <Text className="text-gray-600 text-sm mb-3">No foods added yet</Text>
      )}

      <TouchableOpacity 
        className="border-2 border-lime-500 px-4 py-2 rounded-xl"
        onPress={() => onAddFood(meal)}
        disabled={loading}
      >
        <Text className="text-lime-600 text-center font-semibold">
          {loading && selectedMeal === meal ? 'Loading...' : 'Add Food'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MealSection; 