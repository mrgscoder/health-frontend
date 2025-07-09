import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image } from 'react-native';

const Account = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-8">
        <TouchableOpacity>
          
        </TouchableOpacity>
        <Text className="text-black text-2xl font-medium text-center mt-9">Enter your details</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-4">
        {/* Phone Input */}
        <View className="mb-4">
          <View className="flex-row items-center bg-white rounded-lg border border-black overflow-hidden">
            <View className="px-4 py-3 border-r border-black">
              <Text className="text-gray-300">+91</Text>
            </View>
            <TextInput
              className="flex-1 px-4 py-3 text-white"
              placeholder="Phone nu..."
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity className="px-4 py-3 bg-teal-50 rounded-full">
              <Text className="text-gray-300 text-xs font-medium">GET CODE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification Code Input */}
        <View className="mb-6">
          <TextInput
            className="w-full px-4 py-3 bg-white text-white rounded-lg border border-black"
            placeholder="Verification code"
            placeholderTextColor="#9ca3af"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
        </View>

        {/* Image between Sign In and Social Buttons */}
        <View className="items-center mb-8 mt-8">
          <Image
            source={require('../../assets/images/account.png')}
            className="w-40 h-40"
            resizeMode="contain"
          />
        </View>

        {/* Sign In Button */}
        <View className="items-center">
          <TouchableOpacity className="w-full py-3 mb-8 bg-[#0cb6ab] rounded-3xl">
            <Text className="text-white text-center font-medium">SIGN IN</Text>
          </TouchableOpacity>
        </View>

        {/* Social Sign In Buttons */}
        <View>
          <TouchableOpacity className="w-full py-3 bg-white rounded-3xl border border-gray-600 flex-row items-center justify-center mb-6">
            <View className="w-7 h-7 mr-3 items-center justify-center">
              <Image
                source={require('../../assets/images/google.png')}
                className="w-7 h-7"
                resizeMode="contain"
              />
            </View>
            <Text className="text-black font-medium">SIGN IN WITH GOOGLE</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-full py-3 bg-blue-600 rounded-3xl flex-row items-center justify-center mb-6">
            <View className="w-5 h-5 mr-3 bg-white rounded items-center justify-center">
              <Text className="text-blue-600 text-xs font-bold">f</Text>
            </View>
            <Text className="text-white font-medium">SIGN IN WITH FACEBOOK</Text>
          </TouchableOpacity>

       
        </View>

        {/* Terms */}
        <Text className="text-gray-400 text-center text-xs mt-8 leading-5">
          By signing in to HealthSync, you agree to our{' '}
          <Text className="text-blue-400">Terms</Text> and{' '}
          <Text className="text-blue-400">Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
};

export default Account;