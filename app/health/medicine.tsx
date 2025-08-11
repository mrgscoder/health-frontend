import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { 
  addMedicine as addMedicineAPI, 
  getAllMedicines as getAllMedicinesAPI, 
  getTodayMedicines as getTodayMedicinesAPI,
  markMedicineTaken as markMedicineTakenAPI,
  deleteMedicine as deleteMedicineAPI,
  Medicine,
  ScheduledDose
} from '../../src/services/medicineService';

// Types
interface MedicineLog {
  id: string;
  medicineId: string;
  date: string;
  time: string;
  taken: boolean;
  timestamp: string;
}

interface TimeSlot {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
}

const MedicineTracker: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineLogs, setMedicineLogs] = useState<MedicineLog[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduledDose[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [updatingMedicine, setUpdatingMedicine] = useState<string | null>(null);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Dosage dropdown state
  const [showDosageDropdown, setShowDosageDropdown] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    dosageType: '1 tablet' as string,
    customDosage: '',
    times: [{ hour: '', minute: '', period: 'AM' as const }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  // Dosage options
  const dosageOptions = [
    '1 tablet',
    '2 tablets',
    '3 tablets',
    '1/2 tablet',
    '1/4 tablet',
    '1 capsule',
    '2 capsules',
    '1 ml',
    '2 ml',
    '5 ml',
    '10 ml',
    '1 drop',
    '2 drops',
    '1 spray',
    '2 sprays',
    'Other'
  ];

  // Load medicines on component mount
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check if user is authenticated
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert(
            'Authentication Required',
            'Please log in to use the Medicine Tracker.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.push('/health/Account')
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
          return;
        }

        // Load data if authenticated
        await loadMedicines();
        await loadTodaySchedule();
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthAndLoadData();
  }, []);

  // Load all medicines
  const loadMedicines = async () => {
    try {
      setLoadingMedicines(true);
      const medicinesData = await getAllMedicinesAPI();
      setMedicines(medicinesData);
    } catch (error) {
      console.error('Error loading medicines:', error);
      Alert.alert('Error', 'Failed to load medicines. Please try again.');
    } finally {
      setLoadingMedicines(false);
    }
  };

  // Load today's schedule
  const loadTodaySchedule = async () => {
    try {
      setLoadingToday(true);
      const todayData = await getTodayMedicinesAPI();
      setTodaySchedule(todayData);
    } catch (error) {
      console.error('Error loading today\'s schedule:', error);
      Alert.alert('Error', 'Failed to load today\'s schedule. Please try again.');
    } finally {
      setLoadingToday(false);
    }
  };

  // Convert time slot to 24-hour format for storage
  const timeSlotToString = (timeSlot: TimeSlot): string => {
    // Handle empty values
    if (!timeSlot.hour || !timeSlot.minute) {
      return '00:00'; // Default fallback
    }
    
    let hour = parseInt(timeSlot.hour);
    if (timeSlot.period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (timeSlot.period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    // Pad minute with leading zero if needed for storage
    const minute = timeSlot.minute.padStart(2, '0');
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  };

  // Convert 24-hour format back to time slot
  const stringToTimeSlot = (timeString: string): TimeSlot => {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour);
    let period: 'AM' | 'PM' = 'AM';
    let displayHour = hourNum;
    
    if (hourNum >= 12) {
      period = 'PM';
      if (hourNum > 12) {
        displayHour = hourNum - 12;
      }
    } else if (hourNum === 0) {
      displayHour = 12;
    }
    
    return {
      hour: displayHour.toString().padStart(2, '0'),
      minute,
      period,
    };
  };

  const addMedicine = async () => {
    // Check if all required fields are filled
    if (!formData.name) {
      Alert.alert('Error', 'Please enter medicine name');
      return;
    }
    
    if (formData.dosageType === 'Other' && !formData.customDosage) {
      Alert.alert('Error', 'Please enter custom dosage');
      return;
    }
    
    // Check if all time slots have valid hour and minute values
    const invalidTimes = formData.times.filter(time => !time.hour || !time.minute);
    if (invalidTimes.length > 0) {
      Alert.alert('Error', 'Please enter valid time for all time slots (hour and minute are required)');
      return;
    }

    try {
      // Check authentication before adding medicine
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to add medicines.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.push('/health/Account')
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      setLoading(true);
      const finalDosage = formData.dosageType === 'Other' ? formData.customDosage : formData.dosageType;

      const medicineData = {
        name: formData.name,
        dosage: finalDosage,
        times: formData.times.map(timeSlotToString),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        notes: formData.notes,
      };

      await addMedicineAPI(medicineData);

      // Reset form
      setFormData({
        name: '',
        dosage: '',
        dosageType: '1 tablet',
        customDosage: '',
        times: [{ hour: '', minute: '', period: 'AM' as const }],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
      });
      setShowAddModal(false);

      // Reload data
      await loadMedicines();
      await loadTodaySchedule();

      Alert.alert('Success', 'Medicine added successfully!');
    } catch (error) {
      console.error('Error adding medicine:', error);
      Alert.alert('Error', 'Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, { hour: '', minute: '', period: 'AM' as const }],
    });
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const newTimes = [...formData.times];
    let newValue = value;
    
    // Validate input based on field
    if (field === 'hour') {
      const hourNum = parseInt(value);
      if (value === '' || (hourNum >= 1 && hourNum <= 12)) {
        newValue = value;
      } else {
        return; // Invalid input, don't update
      }
    } else if (field === 'minute') {
      const minuteNum = parseInt(value);
      if (value === '' || (minuteNum >= 0 && minuteNum <= 59)) {
        // Don't auto-pad, let user enter their own value
        newValue = value;
      } else {
        return; // Invalid input, don't update
      }
    } else {
      newValue = value;
    }
    
    newTimes[index] = { ...newTimes[index], [field]: newValue };
    setFormData({
      ...formData,
      times: newTimes,
    });
  };

  const removeTimeSlot = (index: number) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        times: newTimes,
      });
    }
  };

  const markMedicineTaken = async (dose: ScheduledDose, taken: boolean) => {
    const medicineKey = `${dose.medicineId}-${dose.time}`;
    
    try {
      setUpdatingMedicine(medicineKey);
      
      // Update local state immediately for instant visual feedback
      setTodaySchedule(prev => 
        prev.map(item => 
          item.medicineId === dose.medicineId && item.time === dose.time
            ? { ...item, taken }
            : item
        )
      );

      const today = new Date().toISOString().split('T')[0];
      
      // Update database
      await markMedicineTakenAPI({
        medicineId: dose.medicineId,
        date: today,
        time: dose.time,
        taken,
      });

      // Show success feedback (optional - you can remove this if you prefer)
      console.log(`Medicine ${taken ? 'marked as taken' : 'marked as not taken'} successfully`);

    } catch (error) {
      console.error('Error marking medicine:', error);
      
      // Revert the local state if API call fails
      setTodaySchedule(prev => 
        prev.map(item => 
          item.medicineId === dose.medicineId && item.time === dose.time
            ? { ...item, taken: !taken } // Revert to previous state
            : item
        )
      );
      
      Alert.alert('Error', 'Failed to update medicine status. Please try again.');
    } finally {
      setUpdatingMedicine(null);
    }
  };

  const deleteMedicine = (medicineId: string) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicineAPI(medicineId);
              setMedicines(medicines.filter(m => m.id !== medicineId));
              setMedicineLogs(logs => logs.filter(l => l.medicineId !== medicineId));
              await loadTodaySchedule();
            } catch (error) {
              console.error('Error deleting medicine:', error);
              Alert.alert('Error', 'Failed to delete medicine. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Format time for display (convert 24-hour to 12-hour with AM/PM)
  const formatTimeForDisplay = (timeString: string): string => {
    const timeSlot = stringToTimeSlot(timeString);
    return `${timeSlot.hour}:${timeSlot.minute} ${timeSlot.period}`;
  };

  const renderTodaySchedule = () => {
    if (loadingToday) {
      return (
        <View className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl mx-4 mt-4 border border-white/20">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white/80 text-center mt-2">
            Loading today's schedule...
          </Text>
        </View>
      );
    }

    if (todaySchedule.length === 0) {
      return (
        <View className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl mx-4 mt-4 border border-white/20">
          <Text className="text-white/80 text-center">
            No medicines scheduled for today
          </Text>
        </View>
      );
    }

    return (
      <View className="px-5 mt-4">
        <Text className="text-xl font-light mb-4 text-white">
          Today's Schedule
        </Text>
        {todaySchedule.map((dose, index) => (
          <View
            key={`${dose.medicineId}-${dose.time}-${index}`}
            className={`p-4 rounded-2xl mb-4 border ${
              dose.taken === true
                ? 'bg-green-50/20 backdrop-blur-sm border-green-200/30'
                : dose.taken === false
                ? 'bg-red-50/20 backdrop-blur-sm border-red-200/30'
                : 'bg-white/10 backdrop-blur-sm border-white/20'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-semibold text-lg text-white">
                  {dose.medicineName}
                </Text>
                <Text className="text-white/80">
                  {dose.dosage} at {formatTimeForDisplay(dose.time)}
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className={`w-12 h-12 rounded-full mr-2 items-center justify-center ${
                    dose.taken === true
                      ? 'bg-green-500'
                      : 'bg-white/20 backdrop-blur-sm'
                  }`}
                  onPress={() => markMedicineTaken(dose, true)}
                  disabled={updatingMedicine === `${dose.medicineId}-${dose.time}`}
                >
                  {updatingMedicine === `${dose.medicineId}-${dose.time}` ? (
                    <ActivityIndicator size="small" color={dose.taken === true ? 'white' : '#ffffff'} />
                  ) : (
                    <Ionicons 
                      name="checkmark" 
                      size={24} 
                      color={dose.taken === true ? 'white' : '#ffffff'} 
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    dose.taken === false
                      ? 'bg-red-500'
                      : 'bg-white/20 backdrop-blur-sm'
                  }`}
                  onPress={() => markMedicineTaken(dose, false)}
                  disabled={updatingMedicine === `${dose.medicineId}-${dose.time}`}
                >
                  {updatingMedicine === `${dose.medicineId}-${dose.time}` ? (
                    <ActivityIndicator size="small" color={dose.taken === false ? 'white' : '#ffffff'} />
                  ) : (
                    <Ionicons 
                      name="close" 
                      size={24} 
                      color={dose.taken === false ? 'white' : '#ffffff'} 
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMedicinesList = () => {
    if (loadingMedicines) {
      return (
        <View className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl mx-4 mt-4 border border-white/20">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white/80 text-center mt-2">
            Loading medicines...
          </Text>
        </View>
      );
    }

    if (medicines.length === 0) {
      return (
        <View className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl mx-4 mt-4 border border-white/20">
          <Text className="text-white/80 text-center">
            No medicines added yet
          </Text>
        </View>
      );
    }

    return (
      <View className="px-5 mt-6">
        <Text className="text-xl font-light mb-4 text-white">
          My Medicines
        </Text>
        {medicines.map(medicine => (
          <View
            key={medicine.id}
            className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-lg text-white">
                  {medicine.name}
                </Text>
                <Text className="text-white/80 mt-1">
                  Dosage: {medicine.dosage}
                </Text>
                <Text className="text-white/80">
                  Times: {medicine.times.map(formatTimeForDisplay).join(', ')}
                </Text>
                <Text className="text-white/80">
                  From: {medicine.startDate} {medicine.endDate && `to ${medicine.endDate}`}
                </Text>
                {medicine.notes && (
                  <Text className="text-white/60 text-sm mt-1">
                    Notes: {medicine.notes}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => deleteMedicine(medicine.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTimePicker = (timeSlot: TimeSlot, index: number) => (
    <View key={index} className="flex-row mb-2 items-center">
      <View className="flex-1 flex-row items-center">
        {/* Hour */}
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl p-2 mr-2 text-center text-base bg-white text-gray-800"
          value={timeSlot.hour}
          onChangeText={(text) => {
            // Allow empty string or valid hours (1-12)
            if (text === '' || (parseInt(text) >= 1 && parseInt(text) <= 12)) {
              updateTimeSlot(index, 'hour', text);
            }
          }}
          placeholder="9"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text className="text-gray-700 mx-1 font-semibold text-lg">:</Text>
        
        {/* Minute */}
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl p-2 mr-2 text-center text-base bg-white text-gray-800"
          value={timeSlot.minute}
          onChangeText={(text) => {
            // Allow empty string or valid minutes (0-59)
            if (text === '' || (parseInt(text) >= 0 && parseInt(text) <= 59)) {
              updateTimeSlot(index, 'minute', text);
            }
          }}
          placeholder="00"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={2}
        />
        
        {/* AM/PM */}
        <View className="flex-row border border-gray-300 rounded-xl overflow-hidden bg-white">
          <TouchableOpacity
            className={`px-3 py-2 ${timeSlot.period === 'AM' ? 'bg-blue-500' : 'bg-gray-100'}`}
            onPress={() => updateTimeSlot(index, 'period', 'AM')}
          >
            <Text className={`text-sm font-semibold ${timeSlot.period === 'AM' ? 'text-white' : 'text-gray-700'}`}>
              AM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-2 ${timeSlot.period === 'PM' ? 'bg-blue-500' : 'bg-gray-100'}`}
            onPress={() => updateTimeSlot(index, 'period', 'PM')}
          >
            <Text className={`text-sm font-semibold ${timeSlot.period === 'PM' ? 'text-white' : 'text-gray-700'}`}>
              PM
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Delete button - always show if more than 1 time slot */}
      {formData.times.length > 1 && (
        <TouchableOpacity
          className="ml-2 p-2 bg-red-100 rounded-full"
          onPress={() => removeTimeSlot(index)}
        >
          <Ionicons name="close-circle" size={18} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData({...formData, startDate: dateString});
      
      // If end date is before start date, clear it
      if (formData.endDate && formData.endDate < dateString) {
        setFormData(prev => ({...prev, endDate: ''}));
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData({...formData, endDate: dateString});
    }
  };

  const renderMainContent = () => (
    <View className="flex-1" style={{ paddingHorizontal: 0 }}>
      <View className="flex-row justify-between items-center px-4 py-4 bg-transparent mt-4">
        <Text className="text-2xl font-bold text-white">
          Medicine Tracker
        </Text>
        <TouchableOpacity
          className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 items-center justify-center"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {renderTodaySchedule()}
        {renderMedicinesList()}
        
        {/* Add Medicine Section in the middle */}
        <View className="px-5 mt-8 mb-8">
          <TouchableOpacity
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 items-center flex-row justify-center border border-white/30"
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={32} color="white" />
            <Text className="text-white font-semibold text-xl ml-3">
              Add Medicine
            </Text>
          </TouchableOpacity>
        </View>

        {/* Capsule.json Lottie Animation */}
        <View className="px-5 mt-8 mb-8">
          <View className="bg-transparent rounded-2xl p-6 items-center">
            <LottieView
              source={require('../assets/lottie/capsule.json')}
              autoPlay
              loop={false}
              duration={5000}
              style={{ width: 350, height: 350 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderAddMedicineModal = () => (
    <Modal
      visible={showAddModal}
      animationType="fade"
      transparent={true}
    >
      <View className="flex-1 bg-black/50">
        {/* Blurred Background */}
        <BlurView 
          intensity={10} 
          style={{ flex: 1 }}
          className="justify-center items-center px-4 py-4"
        >
          <View className="bg-white rounded-3xl w-full max-w-sm flex-1 max-h-[90%] shadow-2xl">
            <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-800">Add Medicine</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              className="flex-1 px-5 py-4" 
              showsVerticalScrollIndicator={false}
              onTouchStart={() => {
                if (showDosageDropdown) {
                  setShowDosageDropdown(false);
                }
              }}
            >
              <View className="mb-4">
                <Text className="text-gray-700 mb-2 text-base font-medium">Medicine Name *</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 text-base bg-white"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter medicine name"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 text-base font-medium">Dosage *</Text>
                <View className="relative">
                  <TouchableOpacity
                    className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center bg-white"
                    onPress={() => setShowDosageDropdown(!showDosageDropdown)}
                  >
                    <Text className="text-gray-800 text-base">
                      {formData.dosageType}
                    </Text>
                    <Ionicons 
                      name={showDosageDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                  
                  {showDosageDropdown && (
                    <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl mt-1 z-50 max-h-48">
                      <ScrollView className="max-h-48">
                        {dosageOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            className={`p-3 border-b border-gray-100 ${
                              formData.dosageType === option ? 'bg-blue-50' : ''
                            }`}
                            onPress={() => {
                              setFormData({...formData, dosageType: option});
                              if (option !== 'Other') {
                                setFormData(prev => ({...prev, customDosage: ''}));
                              }
                              setShowDosageDropdown(false);
                            }}
                          >
                            <Text className={`text-base ${
                              formData.dosageType === option ? 'text-blue-600 font-semibold' : 'text-gray-800'
                            }`}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                
                {formData.dosageType === 'Other' && (
                  <TextInput
                    className="border border-gray-300 rounded-xl p-3 mt-2 text-base bg-white"
                    value={formData.customDosage}
                    onChangeText={(text) => setFormData({...formData, customDosage: text})}
                    placeholder="Enter custom dosage (e.g., 1.5 tablets, 3ml, etc.) *"
                  />
                )}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 text-base font-medium">Times *</Text>
                {formData.times.map((timeSlot, index) => renderTimePicker(timeSlot, index))}
                <TouchableOpacity
                  className="border border-dashed border-gray-400 rounded-xl p-3 items-center flex-row justify-center bg-gray-50 mt-2"
                  onPress={addTimeSlot}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#6B7280" />
                  <Text className="text-gray-600 ml-2 text-base font-medium">Add Time</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 text-base font-medium">Start Date *</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center bg-white"
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text className={formData.startDate ? 'text-gray-800' : 'text-gray-500'} style={{fontSize: 16}}>
                    {formData.startDate || 'Select start date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 text-base font-medium">End Date (Optional)</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center bg-white"
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text className={formData.endDate ? 'text-gray-800' : 'text-gray-500'} style={{fontSize: 16}}>
                    {formData.endDate || 'Select end date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 mb-2 text-base font-medium">Notes</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl p-3 text-base bg-white"
                  value={formData.notes}
                  onChangeText={(text) => setFormData({...formData, notes: text})}
                  placeholder="Additional notes..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className={`rounded-xl p-4 items-center flex-row justify-center mb-8 ${
                  loading ? 'bg-gray-400' : 'bg-black'
                }`}
                onPress={addMedicine}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="medical-outline" size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-base ml-2">
                  {loading ? 'Adding...' : 'Add Medicine'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Date Pickers */}
            {showStartDatePicker && (
              <DateTimePicker
                value={new Date(formData.startDate)}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={formData.endDate ? new Date(formData.endDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                minimumDate={new Date(formData.startDate)}
              />
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );

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
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView className="flex-1" style={{ paddingHorizontal: 0 }}>
        {/* Main Content - this will be blurred when modal is open */}
        {showAddModal && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <BlurView intensity={20} style={{ flex: 1 }}>
              {renderMainContent()}
            </BlurView>
          </View>
        )}
        
        {/* Normal content when modal is closed */}
        {!showAddModal && renderMainContent()}

        {/* Modal */}
        {renderAddMedicineModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MedicineTracker;
