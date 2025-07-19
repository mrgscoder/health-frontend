import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Heart, Thermometer, Activity, Wind, Droplets, Plus, TrendingUp, Calendar, Clock, User } from 'lucide-react-native';

const VitalSignsApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: [],
    heartRate: [],
    temperature: [],
    respiratoryRate: [],
    bloodOxygen: []
  });

  // Form states
  const [bpForm, setBpForm] = useState({ systolic: '', diastolic: '', notes: '' });
  const [hrForm, setHrForm] = useState({ rate: '', notes: '' });
  const [tempForm, setTempForm] = useState({ temperature: '', unit: 'F', notes: '' });
  const [rrForm, setRrForm] = useState({ rate: '', notes: '' });
  const [o2Form, setO2Form] = useState({ level: '', notes: '' });

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const addVitalSign = (type, data) => {
    const newEntry = {
      id: Date.now(),
      ...data,
      ...getCurrentDateTime()
    };
    
    setVitalSigns(prev => ({
      ...prev,
      [type]: [newEntry, ...prev[type]]
    }));
    
    // Reset form
    switch(type) {
      case 'bloodPressure':
        setBpForm({ systolic: '', diastolic: '', notes: '' });
        break;
      case 'heartRate':
        setHrForm({ rate: '', notes: '' });
        break;
      case 'temperature':
        setTempForm({ temperature: '', unit: 'F', notes: '' });
        break;
      case 'respiratoryRate':
        setRrForm({ rate: '', notes: '' });
        break;
      case 'bloodOxygen':
        setO2Form({ level: '', notes: '' });
        break;
    }
    
    Alert.alert('Success', 'Vital sign recorded successfully!');
  };

  const VitalCard = ({ title, icon: Icon, color, iconColor, value, unit, onPress, trend }) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${color} m-2 flex-1`}
      style={{ minHeight: 120 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Icon size={28} color={iconColor} />
        <View className="bg-gray-100 rounded-full p-1">
          <TrendingUp size={16} color="#10B981" />
        </View>
      </View>
      <Text className="text-gray-600 text-sm font-medium mb-1">{title}</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-1">{value || '--'}</Text>
      <Text className="text-xs text-gray-500">{unit}</Text>
    </TouchableOpacity>
  );

  const FormInput = ({ placeholder, value, onChangeText, keyboardType = 'default' }) => (
    <TextInput
      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-3"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#9CA3AF"
    />
  );

  const SubmitButton = ({ onPress, title }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-blue-600 rounded-xl py-4 items-center shadow-lg"
    >
      <Text className="text-white font-bold text-lg">{title}</Text>
    </TouchableOpacity>
  );

  const RecordItem = ({ item, type }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-800 font-semibold text-lg">
          {type === 'bloodPressure' ? `${item.systolic}/${item.diastolic}` :
           type === 'heartRate' ? `${item.rate} bpm` :
           type === 'temperature' ? `${item.temperature}°${item.unit}` :
           type === 'respiratoryRate' ? `${item.rate} bpm` :
           `${item.level}%`}
        </Text>
        <View className="flex-row items-center">
          <Calendar size={14} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1">{item.date}</Text>
        </View>
      </View>
      <View className="flex-row items-center mb-2">
        <Clock size={14} color="#6B7280" />
        <Text className="text-gray-500 text-sm ml-1">{item.time}</Text>
      </View>
      {item.notes && (
        <Text className="text-gray-600 text-sm italic">{item.notes}</Text>
      )}
    </View>
  );

  const renderDashboard = () => (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-600 to-purple-600 pt-12 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-black text-2xl font-bold">Health Dashboard</Text>
            <Text className="text-gray-700">Track your vital signs</Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <User size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="px-4 -mt-6">
        <View className="flex-row">
          <VitalCard
            title="Blood Pressure"
            icon={Heart}
            color="border-l-red-500"
            iconColor="#EF4444"
            value={vitalSigns.bloodPressure[0] ? `${vitalSigns.bloodPressure[0].systolic}/${vitalSigns.bloodPressure[0].diastolic}` : null}
            unit="mmHg"
            onPress={() => setCurrentPage('bloodPressure')}
          />
          <VitalCard
            title="Heart Rate"
            icon={Activity}
            color="border-l-pink-500"
            iconColor="#EC4899"
            value={vitalSigns.heartRate[0]?.rate}
            unit="bpm"
            onPress={() => setCurrentPage('heartRate')}
          />
        </View>
        
        <View className="flex-row">
          <VitalCard
            title="Temperature"
            icon={Thermometer}
            color="border-l-orange-500"
            iconColor="#F97316"
            value={vitalSigns.temperature[0] ? `${vitalSigns.temperature[0].temperature}°${vitalSigns.temperature[0].unit}` : null}
            unit=""
            onPress={() => setCurrentPage('temperature')}
          />
          <VitalCard
            title="Respiratory Rate"
            icon={Wind}
            color="border-l-green-500"
            iconColor="#10B981"
            value={vitalSigns.respiratoryRate[0]?.rate}
            unit="bpm"
            onPress={() => setCurrentPage('respiratoryRate')}
          />
        </View>
        
        <View className="flex-row mb-6">
          <VitalCard
            title="Blood Oxygen"
            icon={Droplets}
            color="border-l-blue-500"
            iconColor="#3B82F6"
            value={vitalSigns.bloodOxygen[0]?.level}
            unit="SpO2%"
            onPress={() => setCurrentPage('bloodOxygen')}
          />
          <View className="flex-1 m-2" />
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-6 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Recent Activity</Text>
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-gray-600">
            {Object.values(vitalSigns).flat().length > 0 
              ? `${Object.values(vitalSigns).flat().length} total readings recorded`
              : 'No readings recorded yet. Start tracking your vital signs!'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderBloodPressureForm = () => (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => setCurrentPage('dashboard')} className="mr-4">
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Heart size={28} color="#EF4444" />
        <Text className="text-2xl font-bold text-gray-800 ml-3">Blood Pressure</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <FormInput
          placeholder="Systolic (top number)"
          value={bpForm.systolic}
          onChangeText={(text) => setBpForm(prev => ({ ...prev, systolic: text }))}
          keyboardType="numeric"
        />
        <FormInput
          placeholder="Diastolic (bottom number)"
          value={bpForm.diastolic}
          onChangeText={(text) => setBpForm(prev => ({ ...prev, diastolic: text }))}
          keyboardType="numeric"
        />
        <FormInput
          placeholder="Notes (optional)"
          value={bpForm.notes}
          onChangeText={(text) => setBpForm(prev => ({ ...prev, notes: text }))}
        />
        <SubmitButton
          onPress={() => {
            if (bpForm.systolic && bpForm.diastolic) {
              addVitalSign('bloodPressure', bpForm);
            } else {
              Alert.alert('Error', 'Please enter both systolic and diastolic values');
            }
          }}
          title="Record Blood Pressure"
        />
      </View>

      {/* Previous Records */}
      <Text className="text-lg font-bold text-gray-800 mb-3">Previous Records</Text>
      {vitalSigns.bloodPressure.map((item) => (
        <RecordItem key={item.id} item={item} type="bloodPressure" />
      ))}
    </ScrollView>
  );

  const renderHeartRateForm = () => (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => setCurrentPage('dashboard')} className="mr-4">
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Activity size={28} color="#EC4899" />
        <Text className="text-2xl font-bold text-gray-800 ml-3">Heart Rate</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <FormInput
          placeholder="Heart rate (bpm)"
          value={hrForm.rate}
          onChangeText={(text) => setHrForm(prev => ({ ...prev, rate: text }))}
          keyboardType="numeric"
        />
        <FormInput
          placeholder="Notes (optional)"
          value={hrForm.notes}
          onChangeText={(text) => setHrForm(prev => ({ ...prev, notes: text }))}
        />
        <SubmitButton
          onPress={() => {
            if (hrForm.rate) {
              addVitalSign('heartRate', hrForm);
            } else {
              Alert.alert('Error', 'Please enter heart rate');
            }
          }}
          title="Record Heart Rate"
        />
      </View>

      <Text className="text-lg font-bold text-gray-800 mb-3">Previous Records</Text>
      {vitalSigns.heartRate.map((item) => (
        <RecordItem key={item.id} item={item} type="heartRate" />
      ))}
    </ScrollView>
  );

  const renderTemperatureForm = () => (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => setCurrentPage('dashboard')} className="mr-4">
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Thermometer size={28} color="#F97316" />
        <Text className="text-2xl font-bold text-gray-800 ml-3">Temperature</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <FormInput
          placeholder="Temperature"
          value={tempForm.temperature}
          onChangeText={(text) => setTempForm(prev => ({ ...prev, temperature: text }))}
          keyboardType="numeric"
        />
        <View className="flex-row mb-3">
          <TouchableOpacity
            onPress={() => setTempForm(prev => ({ ...prev, unit: 'F' }))}
            className={`flex-1 mr-2 py-3 rounded-xl items-center ${
              tempForm.unit === 'F' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text className={`font-semibold ${tempForm.unit === 'F' ? 'text-white' : 'text-gray-600'}`}>
              Fahrenheit (°F)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTempForm(prev => ({ ...prev, unit: 'C' }))}
            className={`flex-1 ml-2 py-3 rounded-xl items-center ${
              tempForm.unit === 'C' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text className={`font-semibold ${tempForm.unit === 'C' ? 'text-white' : 'text-gray-600'}`}>
              Celsius (°C)
            </Text>
          </TouchableOpacity>
        </View>
        <FormInput
          placeholder="Notes (optional)"
          value={tempForm.notes}
          onChangeText={(text) => setTempForm(prev => ({ ...prev, notes: text }))}
        />
        <SubmitButton
          onPress={() => {
            if (tempForm.temperature) {
              addVitalSign('temperature', tempForm);
            } else {
              Alert.alert('Error', 'Please enter temperature');
            }
          }}
          title="Record Temperature"
        />
      </View>

      <Text className="text-lg font-bold text-gray-800 mb-3">Previous Records</Text>
      {vitalSigns.temperature.map((item) => (
        <RecordItem key={item.id} item={item} type="temperature" />
      ))}
    </ScrollView>
  );

  const renderRespiratoryRateForm = () => (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => setCurrentPage('dashboard')} className="mr-4">
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Wind size={28} color="#10B981" />
        <Text className="text-2xl font-bold text-gray-800 ml-3">Respiratory Rate</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <FormInput
          placeholder="Respiratory rate (breaths per minute)"
          value={rrForm.rate}
          onChangeText={(text) => setRrForm(prev => ({ ...prev, rate: text }))}
          keyboardType="numeric"
        />
        <FormInput
          placeholder="Notes (optional)"
          value={rrForm.notes}
          onChangeText={(text) => setRrForm(prev => ({ ...prev, notes: text }))}
        />
        <SubmitButton
          onPress={() => {
            if (rrForm.rate) {
              addVitalSign('respiratoryRate', rrForm);
            } else {
              Alert.alert('Error', 'Please enter respiratory rate');
            }
          }}
          title="Record Respiratory Rate"
        />
      </View>

      <Text className="text-lg font-bold text-gray-800 mb-3">Previous Records</Text>
      {vitalSigns.respiratoryRate.map((item) => (
        <RecordItem key={item.id} item={item} type="respiratoryRate" />
      ))}
    </ScrollView>
  );

  const renderBloodOxygenForm = () => (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => setCurrentPage('dashboard')} className="mr-4">
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Droplets size={28} color="#3B82F6" />
        <Text className="text-2xl font-bold text-gray-800 ml-3">Blood Oxygen</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <FormInput
          placeholder="Blood oxygen level (%)"
          value={o2Form.level}
          onChangeText={(text) => setO2Form(prev => ({ ...prev, level: text }))}
          keyboardType="numeric"
        />
        <FormInput
          placeholder="Notes (optional)"
          value={o2Form.notes}
          onChangeText={(text) => setO2Form(prev => ({ ...prev, notes: text }))}
        />
        <SubmitButton
          onPress={() => {
            if (o2Form.level) {
              addVitalSign('bloodOxygen', o2Form);
            } else {
              Alert.alert('Error', 'Please enter blood oxygen level');
            }
          }}
          title="Record Blood Oxygen"
        />
      </View>

      <Text className="text-lg font-bold text-gray-800 mb-3">Previous Records</Text>
      {vitalSigns.bloodOxygen.map((item) => (
        <RecordItem key={item.id} item={item} type="bloodOxygen" />
      ))}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {currentPage === 'dashboard' && renderDashboard()}
      {currentPage === 'bloodPressure' && renderBloodPressureForm()}
      {currentPage === 'heartRate' && renderHeartRateForm()}
      {currentPage === 'temperature' && renderTemperatureForm()}
      {currentPage === 'respiratoryRate' && renderRespiratoryRateForm()}
      {currentPage === 'bloodOxygen' && renderBloodOxygenForm()}
    </View>
  );
};

export default VitalSignsApp;