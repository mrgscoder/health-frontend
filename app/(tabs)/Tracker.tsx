import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface HealthData {
  id: string;
  type: 'sugar' | 'bloodPressure' | 'weight' | 'medicines' | 'doctors';
  value: any;
  date: string;
  time: string;
}

interface SugarData {
  level: string;
  unit: 'mg/dL' | 'mmol/L';
  mealTime: 'before' | 'after' | 'fasting';
}

interface BloodPressureData {
  systolic: string;
  diastolic: string;
  pulse: string;
}

interface WeightData {
  weight: string;
  unit: 'kg' | 'lbs';
  bmi?: string;
}

interface MedicineData {
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
}

interface DoctorData {
  name: string;
  specialty: string;
  date: string;
  notes: string;
}

const featureList = [
  {
    key: 'stepCount',
    label: 'Step Count',
    icon: <MaterialCommunityIcons name="walk" size={24} color="#0cb6ab" />,
  },
  {
    key: 'sugar',
    label: 'Log Sugar',
    icon: <MaterialCommunityIcons name="water" size={24} color="#0cb6ab" />,
  },
  {
    key: 'weight',
    label: 'Track Weight',
    icon: <FontAwesome5 name="weight" size={22} color="#0cb6ab" />,
  },
  {
    key: 'bloodPressure',
    label: 'Blood Pressure',
    icon: <MaterialCommunityIcons name="heart-pulse" size={24} color="#0cb6ab" />,
  },
  {
    key: 'medicines',
    label: 'Track Medicine',
    icon: <MaterialCommunityIcons name="pill" size={24} color="#0cb6ab" />,
  },
  {
    key: 'doctors',
    label: 'Doctor',
    icon: <MaterialCommunityIcons name="doctor" size={24} color="#0cb6ab" />,
  },
  {
    key: 'heartRate',
    label: 'Heart Rate',
    icon: <MaterialCommunityIcons name="heart" size={24} color="#0cb6ab" />,
  },
];

const Tracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sugar' | 'bloodPressure' | 'weight' | 'medicines' | 'doctors'>('weight');
  const [modalVisible, setModalVisible] = useState(false);
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  
  // Form states
  const [sugarForm, setSugarForm] = useState<SugarData>({
    level: '',
    unit: 'mg/dL',
    mealTime: 'before'
  });
  
  const [bpForm, setBpForm] = useState<BloodPressureData>({
    systolic: '',
    diastolic: '',
    pulse: ''
  });
  
  const [weightForm, setWeightForm] = useState<WeightData>({
    weight: '',
    unit: 'kg',
    bmi: ''
  });
  
  const [medicineForm, setMedicineForm] = useState<MedicineData>({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });
  
  const [doctorForm, setDoctorForm] = useState<DoctorData>({
    name: '',
    specialty: '',
    date: '',
    notes: ''
  });

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const tabConfig = [
    { key: 'sugar', title: 'Sugar', icon: 'water' },
    { key: 'bloodPressure', title: 'Blood Pressure', icon: 'heart' },
    { key: 'weight', title: 'Weight', icon: 'scale' },
    { key: 'medicines', title: 'Medicines', icon: 'medical' },
    { key: 'doctors', title: 'Doctors', icon: 'person' },
  ];

  const handleAddNew = () => {
    setModalVisible(true);
  };

  const handleSave = () => {
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString();
    const timeString = currentDate.toLocaleTimeString();
    
    let newData: HealthData = {
      id: Date.now().toString(),
      type: activeTab,
      value: {},
      date: dateString,
      time: timeString,
    };

    switch (activeTab) {
      case 'sugar':
        if (!sugarForm.level) {
          Alert.alert('Error', 'Please enter sugar level');
          return;
        }
        newData.value = sugarForm;
        break;
      case 'bloodPressure':
        if (!bpForm.systolic || !bpForm.diastolic) {
          Alert.alert('Error', 'Please enter both systolic and diastolic values');
          return;
        }
        newData.value = bpForm;
        break;
      case 'weight':
        if (!weightForm.weight) {
          Alert.alert('Error', 'Please enter weight');
          return;
        }
        newData.value = weightForm;
        break;
      case 'medicines':
        if (!medicineForm.name || !medicineForm.dosage) {
          Alert.alert('Error', 'Please enter medicine name and dosage');
          return;
        }
        newData.value = medicineForm;
        break;
      case 'doctors':
        if (!doctorForm.name || !doctorForm.specialty) {
          Alert.alert('Error', 'Please enter doctor name and specialty');
          return;
        }
        newData.value = doctorForm;
        break;
    }

    setHealthData([...healthData, newData]);
    setModalVisible(false);
    resetForms();
    Alert.alert('Success', 'Data saved successfully!');
  };

  const resetForms = () => {
    setSugarForm({ level: '', unit: 'mg/dL', mealTime: 'before' });
    setBpForm({ systolic: '', diastolic: '', pulse: '' });
    setWeightForm({ weight: '', unit: 'kg', bmi: '' });
    setMedicineForm({ name: '', dosage: '', frequency: '', notes: '' });
    setDoctorForm({ name: '', specialty: '', date: '', notes: '' });
  };

  const renderTabContent = () => {
    const currentData = healthData.filter(item => item.type === activeTab);
    
    if (currentData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-400 text-center text-base mb-4">
            Track your {activeTab === 'bloodPressure' ? 'blood pressure' : activeTab} here
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Click Add New to enter your {activeTab === 'bloodPressure' ? 'blood pressure' : activeTab}. 
            Also view the graphical trends/history to know how you are scoring
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-4 mt-4">
        {currentData.map((item) => (
          <View key={item.id} className="bg-gray-800 rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-semibold">
                {item.date} - {item.time}
              </Text>
            </View>
            {renderDataContent(item)}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDataContent = (item: HealthData) => {
    switch (item.type) {
      case 'sugar':
        return (
          <View>
            <Text className="text-teal-400 text-lg font-bold">
              {item.value.level} {item.value.unit}
            </Text>
            <Text className="text-gray-400 text-sm capitalize">
              {item.value.mealTime} meal
            </Text>
          </View>
        );
      case 'bloodPressure':
        return (
          <View>
            <Text className="text-teal-400 text-lg font-bold">
              {item.value.systolic}/{item.value.diastolic} mmHg
            </Text>
            {item.value.pulse && (
              <Text className="text-gray-400 text-sm">
                Pulse: {item.value.pulse} bpm
              </Text>
            )}
          </View>
        );
      case 'weight':
        return (
          <View>
            <Text className="text-teal-400 text-lg font-bold">
              {item.value.weight} {item.value.unit}
            </Text>
            {item.value.bmi && (
              <Text className="text-gray-400 text-sm">
                BMI: {item.value.bmi}
              </Text>
            )}
          </View>
        );
      case 'medicines':
        return (
          <View>
            <Text className="text-teal-400 text-lg font-bold">
              {item.value.name}
            </Text>
            <Text className="text-gray-400 text-sm">
              {item.value.dosage} - {item.value.frequency}
            </Text>
            {item.value.notes && (
              <Text className="text-gray-500 text-sm mt-1">
                {item.value.notes}
              </Text>
            )}
          </View>
        );
      case 'doctors':
        return (
          <View>
            <Text className="text-teal-400 text-lg font-bold">
              Dr. {item.value.name}
            </Text>
            <Text className="text-gray-400 text-sm">
              {item.value.specialty}
            </Text>
            {item.value.notes && (
              <Text className="text-gray-500 text-sm mt-1">
                {item.value.notes}
              </Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const renderModalContent = () => {
    switch (activeTab) {
      case 'sugar':
        return (
          <View className="space-y-4">
            <Text className="text-white text-xl font-bold mb-4">Add Sugar Level</Text>
            
            <View>
              <Text className="text-gray-300 mb-2">Sugar Level</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter sugar level"
                placeholderTextColor="#9CA3AF"
                value={sugarForm.level}
                onChangeText={(text) => setSugarForm({...sugarForm, level: text})}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Unit</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg ${sugarForm.unit === 'mg/dL' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  onPress={() => setSugarForm({...sugarForm, unit: 'mg/dL'})}
                >
                  <Text className="text-white text-center">mg/dL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg ${sugarForm.unit === 'mmol/L' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  onPress={() => setSugarForm({...sugarForm, unit: 'mmol/L'})}
                >
                  <Text className="text-white text-center">mmol/L</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Meal Time</Text>
              <View className="flex-row space-x-2">
                {['before', 'after', 'fasting'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    className={`flex-1 p-3 rounded-lg ${sugarForm.mealTime === time ? 'bg-teal-600' : 'bg-gray-700'}`}
                    onPress={() => setSugarForm({...sugarForm, mealTime: time as any})}
                  >
                    <Text className="text-white text-center capitalize">{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'bloodPressure':
        return (
          <View className="space-y-4">
            <Text className="text-white text-xl font-bold mb-4">Add Blood Pressure</Text>
            
            <View>
              <Text className="text-gray-300 mb-2">Systolic (mmHg)</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter systolic pressure"
                placeholderTextColor="#9CA3AF"
                value={bpForm.systolic}
                onChangeText={(text) => setBpForm({...bpForm, systolic: text})}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Diastolic (mmHg)</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter diastolic pressure"
                placeholderTextColor="#9CA3AF"
                value={bpForm.diastolic}
                onChangeText={(text) => setBpForm({...bpForm, diastolic: text})}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Pulse (bpm) - Optional</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter pulse rate"
                placeholderTextColor="#9CA3AF"
                value={bpForm.pulse}
                onChangeText={(text) => setBpForm({...bpForm, pulse: text})}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'weight':
        return (
          <View className="space-y-4">
            <Text className="text-white text-xl font-bold mb-4">Add Weight</Text>
            
            <View>
              <Text className="text-gray-300 mb-2">Weight</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter weight"
                placeholderTextColor="#9CA3AF"
                value={weightForm.weight}
                onChangeText={(text) => setWeightForm({...weightForm, weight: text})}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Unit</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg ${weightForm.unit === 'kg' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  onPress={() => setWeightForm({...weightForm, unit: 'kg'})}
                >
                  <Text className="text-white text-center">kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg ${weightForm.unit === 'lbs' ? 'bg-teal-600' : 'bg-gray-700'}`}
                  onPress={() => setWeightForm({...weightForm, unit: 'lbs'})}
                >
                  <Text className="text-white text-center">lbs</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-gray-300 mb-2">BMI - Optional</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter BMI"
                placeholderTextColor="#9CA3AF"
                value={weightForm.bmi}
                onChangeText={(text) => setWeightForm({...weightForm, bmi: text})}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'medicines':
        return (
          <View className="space-y-4">
            <Text className="text-white text-xl font-bold mb-4">Add Medicine</Text>
            
            <View>
              <Text className="text-gray-300 mb-2">Medicine Name</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter medicine name"
                placeholderTextColor="#9CA3AF"
                value={medicineForm.name}
                onChangeText={(text) => setMedicineForm({...medicineForm, name: text})}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Dosage</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="e.g., 500mg"
                placeholderTextColor="#9CA3AF"
                value={medicineForm.dosage}
                onChangeText={(text) => setMedicineForm({...medicineForm, dosage: text})}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Frequency</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="e.g., Twice daily"
                placeholderTextColor="#9CA3AF"
                value={medicineForm.frequency}
                onChangeText={(text) => setMedicineForm({...medicineForm, frequency: text})}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Notes - Optional</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Additional notes"
                placeholderTextColor="#9CA3AF"
                value={medicineForm.notes}
                onChangeText={(text) => setMedicineForm({...medicineForm, notes: text})}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        );

      case 'doctors':
        return (
          <View className="space-y-4">
            <Text className="text-white text-xl font-bold mb-4">Add Doctor Visit</Text>
            
            <View>
              <Text className="text-gray-300 mb-2">Doctor Name</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter doctor name"
                placeholderTextColor="#9CA3AF"
                value={doctorForm.name}
                onChangeText={(text) => setDoctorForm({...doctorForm, name: text})}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Specialty</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="e.g., Cardiologist"
                placeholderTextColor="#9CA3AF"
                value={doctorForm.specialty}
                onChangeText={(text) => setDoctorForm({...doctorForm, specialty: text})}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Visit Date</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="e.g., 2024-01-15"
                placeholderTextColor="#9CA3AF"
                value={doctorForm.date}
                onChangeText={(text) => setDoctorForm({...doctorForm, date: text})}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Notes - Optional</Text>
              <TextInput
                className="bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Visit notes or recommendations"
                placeholderTextColor="#9CA3AF"
                value={doctorForm.notes}
                onChangeText={(text) => setDoctorForm({...doctorForm, notes: text})}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // Only show tracker UI for supported features
  const trackerTabs = ['sugar', 'bloodPressure', 'weight', 'medicines', 'doctors'];

  // Render landing section and feature list
  const renderLanding = () => (
    <ScrollView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="items-center mt-8 mb-4 px-4">
        <Image
          source={require('../../assets/images/doctor.jpg')}
          style={{ width: 180, height: 170, marginBottom: 16 }}
          resizeMode="contain"
        />
       
    
      </View>
      <View className="px-4 mb-2">
        <Text className="text-[#0cb6ab] font-serif text-xl text-center mb-6 font-semibold mb-2">Health Trackers</Text>
        <View className="bg-white rounded-lg divide-y divide-gray-700">
          {featureList.map((feature) => (
            <TouchableOpacity
              key={feature.key}
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => {
                if (trackerTabs.includes(feature.key)) {
                  setActiveTab(feature.key as any);
                  setSelectedFeature(feature.key);
                } else {
                  Alert.alert('Coming Soon', `${feature.label} tracker coming soon!`);
                }
              }}
            >
              <View className="flex-row items-center space-x-3">
                {feature.icon}
                <Text className="text-black text-base ml-6">{feature.label}</Text>
              </View>
              <Ionicons name="add" size={22} color="#0cb6ab" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="" />
      {selectedFeature && trackerTabs.includes(selectedFeature) ? (
        <>
          {/* Back Button */}
          <View className="flex-row items-center px-4 py-3 bg-gray-900 border-b border-gray-800">
            <TouchableOpacity onPress={() => setSelectedFeature(null)} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#0cb6ab" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold capitalize">
              {featureList.find(f => f.key === selectedFeature)?.label || 'Tracker'}
            </Text>
          </View>
          {/* Tracker UI */}
          <View className="flex-1">
            {renderTabContent()}
          </View>
          {/* Bottom Navigation and Modal (unchanged) */}
          <View className="flex-row bg-gray-800 border-t border-gray-700">
            <TouchableOpacity className="flex-1 py-3 items-center">
              <Ionicons name="bar-chart" size={20} color="#6B7280" />
              <Text className="text-gray-400 text-xs mt-1">Graph</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 items-center">
              <Ionicons name="time" size={20} color="#6B7280" />
              <Text className="text-gray-400 text-xs mt-1">History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 py-3 items-center"
              onPress={handleAddNew}
            >
              <Ionicons name="add-circle" size={20} color="#0cb6ab" />
              <Text className="text-teal-400 text-xs mt-1">Add New</Text>
            </TouchableOpacity>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-gray-900 rounded-t-xl p-6 max-h-4/5">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {renderModalContent()}
                  <View className="flex-row space-x-3 mt-6">
                    <TouchableOpacity
                      className="flex-1 bg-gray-700 py-3 rounded-lg"
                      onPress={() => setModalVisible(false)}
                    >
                      <Text className="text-white text-center font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-teal-600 py-3 rounded-lg"
                      onPress={handleSave}
                    >
                      <Text className="text-white text-center font-medium">Save</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        renderLanding()
      )}
    </SafeAreaView>
  );
};

export default Tracker;