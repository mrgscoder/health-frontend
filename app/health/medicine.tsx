import React, { useState, useEffect, useCallback } from 'react';
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
  Vibration,
  Switch,
  AppState,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';
import { 
  addMedicine as addMedicineAPI, 
  getAllMedicines as getAllMedicinesAPI, 
  getTodayMedicines as getTodayMedicinesAPI,
  markMedicineTaken as markMedicineTakenAPI,
  deleteMedicine as deleteMedicineAPI,
  Medicine,
  ScheduledDose
} from '../../src/services/medicineService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  const [completedDoses, setCompletedDoses] = useState<Set<string>>(new Set());
  const [medicineAlarmsEnabled, setMedicineAlarmsEnabled] = useState(true);
  const [medicineAlarmVibration, setMedicineAlarmVibration] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isSchedulingAlarms, setIsSchedulingAlarms] = useState(false);

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

  // Auto-schedule alarms when todaySchedule or alarm settings change
  const autoScheduleAlarms = useCallback(async () => {
    if (!medicineAlarmsEnabled || todaySchedule.length === 0) {
      console.log('🚫 Auto-scheduling skipped: alarms disabled or no medicines');
      return;
    }

    try {
      setIsSchedulingAlarms(true);
      console.log('🔔 Auto-scheduling alarms for today...');
      
      // Get existing medicine notifications
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const existingMedicineNotifications = allNotifications.filter(notification => 
        notification.content.data?.type === 'medicine'
      );

      const now = new Date();
      let scheduledCount = 0;
      let cancelledCount = 0;
      let skippedCount = 0;

      // Create a map to track unique medicine-time combinations
      const scheduledDoses = new Map<string, boolean>();

      // First, cancel ALL existing medicine notifications to ensure no duplicates
      console.log(`🗑️ Cancelling ${existingMedicineNotifications.length} existing medicine notifications...`);
      for (const notification of existingMedicineNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        cancelledCount++;
      }

      // Then schedule exactly one alarm per medicine dose
      for (const dose of todaySchedule) {
        // Skip if already taken
        if (dose.taken === true) {
          console.log(`⏭️ Skipping ${dose.medicineName} - already taken`);
          skippedCount++;
          continue;
        }

        // Create unique key for this medicine-time combination
        const doseKey = `${dose.medicineId}-${dose.time}`;
        
        // Skip if we've already scheduled this exact dose
        if (scheduledDoses.has(doseKey)) {
          console.log(`⏭️ Skipping duplicate: ${dose.medicineName} at ${dose.time}`);
          skippedCount++;
          continue;
        }

        // Mark this dose as scheduled
        scheduledDoses.set(doseKey, true);

        // Parse the time and create proper schedule date
        const [hour, minute] = dose.time.split(':').map(Number);
        
        // Create schedule date for today
        const scheduleDate = new Date();
        scheduleDate.setHours(hour, minute, 0, 0);
        
        // Calculate milliseconds until alarm
        const millisecondsUntilAlarm = scheduleDate.getTime() - now.getTime();
        const secondsUntilAlarm = Math.floor(millisecondsUntilAlarm / 1000);

        // If the time has already passed today, DISCARD it (don't schedule for tomorrow)
        if (secondsUntilAlarm <= 0) {
          console.log(`⏰ ${dose.medicineName} time already passed today at ${scheduleDate.toLocaleTimeString()} - DISCARDING (missed dose)`);
          skippedCount++;
          continue; // Skip this dose entirely - it's missed
        }

        // Only schedule for today if the time is still in the future
        console.log(`⏰ ${dose.medicineName} scheduling for today at ${scheduleDate.toLocaleString()}`);
        console.log(`⏰ Will trigger in ${secondsUntilAlarm} seconds (${Math.floor(secondsUntilAlarm/60)} minutes)`);

        // Don't schedule if it's more than 24 hours away (shouldn't happen with our logic)
        if (secondsUntilAlarm > 86400) {
          console.log(`⚠️ Skipping ${dose.medicineName} - too far in future (${secondsUntilAlarm}s)`);
          skippedCount++;
          continue;
        }

        // Don't schedule if it would trigger too soon (within 30 seconds) to prevent immediate ringing
        if (secondsUntilAlarm < 30) {
          console.log(`⚠️ Skipping ${dose.medicineName} - would trigger too soon (${secondsUntilAlarm}s)`);
          skippedCount++;
          continue;
        }

        // Schedule exactly ONE notification for this dose
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💊 MEDICINE TIME!',
            body: `Time to take ${dose.medicineName} - ${dose.dosage}`,
            data: {
              type: 'medicine',
              medicineId: dose.medicineId,
              time: dose.time,
              medicineName: dose.medicineName,
              dosage: dose.dosage,
              doseKey: doseKey, // Add unique identifier
            },
            sound: 'default',
            priority: 'high',
          },
          trigger: {
            seconds: Math.max(1, secondsUntilAlarm),
          } as any,
        });

        scheduledCount++;
        const scheduleTime = scheduleDate.toLocaleTimeString();
        console.log(`✅ Scheduled UNIQUE alarm: ${dose.medicineName} at ${scheduleTime} (ID: ${notificationId}, Key: ${doseKey})`);
        console.log(`⏰ Will trigger in ${secondsUntilAlarm} seconds (${Math.floor(secondsUntilAlarm/60)} minutes)`);
      }

      console.log(`🎯 Auto-scheduling complete: ${scheduledCount} new alarms, ${cancelledCount} cancelled, ${skippedCount} skipped`);
      
      // Save alarm state
      await AsyncStorage.setItem('lastAutoSchedule', now.toISOString());
      
      // Add a small delay before re-enabling the notification listener
      setTimeout(() => {
        setIsSchedulingAlarms(false);
        console.log('✅ Alarm scheduling complete, notification listener re-enabled');
      }, 2000); // 2 second delay
      
    } catch (error) {
      console.error('❌ Error auto-scheduling alarms:', error);
      setIsSchedulingAlarms(false);
    }
  }, [medicineAlarmsEnabled, todaySchedule]);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Check current permission status first
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        
        if (existingStatus !== 'granted') {
          console.log('🔔 Requesting notification permissions...');
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
            android: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
          
          if (status !== 'granted') {
            console.log('❌ Notification permissions denied');
            Alert.alert(
              'Notification Permissions Required',
              'Please enable notifications in your device settings to receive medicine reminders. Go to Settings > Apps > HealthSync > Notifications.',
              [
                { text: 'OK' },
                { 
                  text: 'Open Settings', 
                  onPress: () => {
                    // This would ideally open device settings, but we'll just show an alert
                    Alert.alert('Settings', 'Please manually enable notifications for this app in your device settings.');
                  }
                }
              ]
            );
          } else {
            console.log('✅ Notification permissions granted');
          }
        } else {
          console.log('✅ Notification permissions already granted');
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  // Auto-schedule alarms when data changes - but only once per day
  useEffect(() => {
    const checkAndScheduleAlarms = async () => {
      if (todaySchedule.length === 0) return;
      
      try {
        // Check if we've already scheduled alarms today
        const lastSchedule = await AsyncStorage.getItem('lastAutoSchedule');
        const today = new Date().toISOString().split('T')[0];
        
        // Allow re-scheduling if:
        // 1. We haven't scheduled today, OR
        // 2. The app was just started (check if we have any existing notifications)
        const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const existingMedicineNotifications = existingNotifications.filter(notification => 
          notification.content.data?.type === 'medicine'
        );
        
        const shouldReschedule = !lastSchedule || 
          !lastSchedule.startsWith(today) || 
          existingMedicineNotifications.length === 0;
        
        if (!shouldReschedule) {
          console.log('⏭️ Alarms already scheduled today, skipping auto-schedule');
          return;
        }
        
        // Add a longer delay to prevent immediate scheduling when page opens
        console.log('🔄 Scheduling alarms (first time today or app restart) - delayed by 5 seconds');
        setTimeout(() => {
          autoScheduleAlarms();
        }, 5000); // Increased delay to 5 seconds to give user time to see the interface
      } catch (error) {
        console.error('Error checking last schedule:', error);
      }
    };

    checkAndScheduleAlarms();
  }, [autoScheduleAlarms, todaySchedule]);

  // Handle app state changes for re-scheduling - but only if needed
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App became active');
        // Only re-schedule if alarms are enabled and we have medicines
        // But don't auto-schedule every time to prevent spam
        if (medicineAlarmsEnabled && todaySchedule.length > 0) {
          // Just log that we're active, don't auto-schedule
          console.log('📱 App active with medicines - alarms should be working');
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, medicineAlarmsEnabled, todaySchedule]);

  // Medicine Alarm Handler
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Medicine alarm received:', notification);
      
      // Only handle medicine notifications
      if (notification.request.content.data?.type !== 'medicine') {
        return;
      }
      
      // Don't show alerts if we're currently scheduling alarms
      if (isSchedulingAlarms) {
        console.log('⚠️ Ignoring notification during alarm scheduling');
        return;
      }
      
      // Get the unique dose key to prevent duplicate processing
      const doseKey = notification.request.content.data?.doseKey;
      console.log(`🔔 Processing alarm for dose key: ${doseKey}`);
      
      // Trigger local alarm effects
      if (medicineAlarmVibration) {
        // Vibrate pattern: wait 0ms, vibrate 500ms, wait 200ms, vibrate 500ms
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      }
      
      // Show medicine alarm alert
      Alert.alert(
        '💊 MEDICINE ALARM!',
        `Time to take your ${notification.request.content.data?.medicineName}! Stay healthy! 💊`,
        [
          {
            text: 'Dismiss',
            style: 'cancel',
            onPress: () => Vibration.cancel(),
          },
          {
            text: 'Mark as Taken',
            onPress: () => {
              Vibration.cancel();
              // Find the medicine from notification data and mark as taken
              const medicineData = notification.request.content.data;
              if (medicineData && medicineData.medicineId && medicineData.time) {
                const dose = todaySchedule.find(d => 
                  d.medicineId === medicineData.medicineId && d.time === medicineData.time
                );
                if (dose) {
                  markMedicineTaken(dose, true);
                }
              }
            },
          },
        ],
        { cancelable: false }
      );
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Medicine alarm response:', response);
      Vibration.cancel();
      
      // Handle notification tap
      const data = response.notification.request.content.data;
      if (data?.type === 'medicine' && data?.medicineId && data?.time) {
        const dose = todaySchedule.find(d => 
          d.medicineId === data.medicineId && d.time === data.time
        );
        if (dose && response.actionIdentifier === 'MARK_TAKEN') {
          markMedicineTaken(dose, true);
        }
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
      Vibration.cancel();
    };
  }, [medicineAlarmVibration, todaySchedule, isSchedulingAlarms]);

  // Medicine alarm status logging
  useEffect(() => {
    if (!medicineAlarmsEnabled || todaySchedule.length === 0) return;

    console.log('🎯 Medicine alarms enabled for:', todaySchedule.length, 'medicines');
    console.log('📋 Today\'s schedule:', todaySchedule.map(d => `${d.medicineName} at ${d.time}`));
  }, [todaySchedule, medicineAlarmsEnabled]);

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

  // Load alarm settings from storage and check if we need to reset daily schedule
  useEffect(() => {
    const loadAlarmSettings = async () => {
      try {
        const alarmsEnabled = await AsyncStorage.getItem('medicineAlarmsEnabled');
        const vibrationEnabled = await AsyncStorage.getItem('medicineAlarmVibration');
        const lastSchedule = await AsyncStorage.getItem('lastAutoSchedule');
        
        if (alarmsEnabled !== null) {
          setMedicineAlarmsEnabled(JSON.parse(alarmsEnabled));
        }
        if (vibrationEnabled !== null) {
          setMedicineAlarmVibration(JSON.parse(vibrationEnabled));
        }
        
        // Check if we need to reset the daily schedule (new day)
        if (lastSchedule) {
          const lastScheduleDate = lastSchedule.split('T')[0];
          const today = new Date().toISOString().split('T')[0];
          
          if (lastScheduleDate !== today) {
            console.log('📅 New day detected - clearing last schedule and cancelling old alarms');
            await AsyncStorage.removeItem('lastAutoSchedule');
            
            // Cancel all existing medicine alarms for the new day
            try {
              const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
              const medicineNotifications = allNotifications.filter(notification => 
                notification.content.data?.type === 'medicine'
              );
              
              for (const notification of medicineNotifications) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                console.log(`🔕 Cancelled old alarm: ${notification.content.data?.medicineName} at ${notification.content.data?.time}`);
              }
              
              console.log(`🗑️ Cleared ${medicineNotifications.length} old medicine alarms for new day`);
            } catch (error) {
              console.error('Error clearing old alarms for new day:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading alarm settings:', error);
      }
    };

    loadAlarmSettings();
  }, []);

  // Save alarm settings when they change
  useEffect(() => {
    const saveAlarmSettings = async () => {
      try {
        await AsyncStorage.setItem('medicineAlarmsEnabled', JSON.stringify(medicineAlarmsEnabled));
        await AsyncStorage.setItem('medicineAlarmVibration', JSON.stringify(medicineAlarmVibration));
      } catch (error) {
        console.error('Error saving alarm settings:', error);
      }
    };

    saveAlarmSettings();
  }, [medicineAlarmsEnabled, medicineAlarmVibration]);

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
      console.log('🔄 Loading today\'s schedule...');
      const todayData = await getTodayMedicinesAPI();
      console.log('📅 Today\'s schedule data:', todayData);
      setTodaySchedule(todayData);
      console.log('✅ Today\'s schedule updated with', todayData.length, 'items');
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

    // Check if start date is today
    const today = new Date().toISOString().split('T')[0];
    const isStartingToday = formData.startDate === today;
    console.log('📅 Medicine start date:', formData.startDate, 'Today:', today, 'Is starting today:', isStartingToday);

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

      const result = await addMedicineAPI(medicineData);
      console.log('✅ Medicine added successfully:', result);

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

      // Reload data with a small delay to ensure backend has processed the data
      console.log('🔄 Reloading medicines and today\'s schedule...');
      await loadMedicines();
      
      // Add a small delay before loading today's schedule
      setTimeout(async () => {
        await loadTodaySchedule();
        console.log('✅ Today\'s schedule reloaded after adding medicine');
      }, 500);

      const message = isStartingToday 
        ? 'Medicine added successfully! It will appear in today\'s schedule. Alarms will be automatically scheduled.'
        : 'Medicine added successfully! It will appear in the schedule starting from the selected date. Alarms will be automatically scheduled.';
      
      Alert.alert('Success', message);
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

      // Add to completed doses set to hide the buttons
      setCompletedDoses(prev => new Set([...prev, medicineKey]));

      // If medicine was marked as taken, cancel its specific alarm immediately
      if (taken) {
        try {
          const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
          const doseKey = `${dose.medicineId}-${dose.time}`;
          
          // Find and cancel the specific alarm for this dose
          const specificNotification = allNotifications.find(notification => 
            notification.content.data?.type === 'medicine' &&
            notification.content.data?.doseKey === doseKey
          );
          
          if (specificNotification) {
            await Notifications.cancelScheduledNotificationAsync(specificNotification.identifier);
            console.log(`🔕 Cancelled specific alarm for ${dose.medicineName} at ${dose.time} (Key: ${doseKey})`);
          } else {
            console.log(`⚠️ No specific alarm found to cancel for ${dose.medicineName} at ${dose.time}`);
          }
        } catch (error) {
          console.error('Error cancelling specific alarm:', error);
        }
      }

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
              // First, cancel ALL medicine alarms for this specific medicine
              console.log(`🗑️ Starting deletion process for medicine ID: ${medicineId}`);
              const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
              console.log(`📋 Found ${allNotifications.length} total scheduled notifications`);
              
              // Cancel notifications for this specific medicine
              const medicineNotifications = allNotifications.filter(notification => 
                notification.content.data?.type === 'medicine' &&
                notification.content.data?.medicineId === medicineId
              );
              
              console.log(`💊 Cancelling ${medicineNotifications.length} notifications for medicine ID: ${medicineId}`);
              
              for (const notification of medicineNotifications) {
                const data = notification.content.data;
                console.log(`🔕 Cancelling alarm for: ${data?.medicineName} at ${data?.time} (ID: ${notification.identifier})`);
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
              }
              
              console.log(`✅ Successfully cancelled ${medicineNotifications.length} alarms for medicine ID: ${medicineId}`);

              // Delete the medicine from the database
              await deleteMedicineAPI(medicineId);
              
              // Update local state immediately
              setMedicines(medicines.filter(m => m.id !== medicineId));
              setMedicineLogs(logs => logs.filter(l => l.medicineId !== medicineId));
              
              // Also remove from today's schedule immediately to prevent any issues
              setTodaySchedule(prev => prev.filter(dose => dose.medicineId !== medicineId));
              
              // Verify that alarms for the deleted medicine are gone
              const remainingNotifications = await Notifications.getAllScheduledNotificationsAsync();
              const remainingMedicineNotifications = remainingNotifications.filter(notification => 
                notification.content.data?.type === 'medicine' &&
                notification.content.data?.medicineId === medicineId
              );
              
              if (remainingMedicineNotifications.length === 0) {
                console.log(`✅ Verification: No alarms remain for deleted medicine ID: ${medicineId}`);
              } else {
                console.log(`⚠️ Warning: ${remainingMedicineNotifications.length} alarms still exist for deleted medicine ID: ${medicineId}`);
                // Force cancel any remaining alarms
                for (const notification of remainingMedicineNotifications) {
                  await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                  console.log(`🔕 Force cancelled remaining alarm: ${notification.identifier}`);
                }
              }
              
              // Reload today's schedule to get fresh data, but do not trigger auto-scheduling
              console.log('🔄 Reloading today\'s schedule after deletion...');
              await loadTodaySchedule();
              
              console.log(`✅ Medicine deleted successfully and alarms cancelled`);
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
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-light text-black">
            Today's Schedule
          </Text>
          <TouchableOpacity
            className="bg-gray-200 rounded-full p-2"
            onPress={loadTodaySchedule}
            disabled={loadingToday}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color="black" 
            />
          </TouchableOpacity>
        </View>
        {todaySchedule.map((dose, index) => (
          <View
            key={`${dose.medicineId}-${dose.time}-${index}`}
            className={`p-4 rounded-2xl mb-4 border bg-white ${
              dose.taken === true
                ? 'border-green-300 shadow-sm'
                : dose.taken === false
                ? 'border-red-300 shadow-sm'
                : 'border-gray-200 shadow-sm'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-semibold text-lg text-black">
                  {dose.medicineName}
                </Text>
                <Text className="text-gray-600">
                  {dose.dosage} at {formatTimeForDisplay(dose.time)}
                </Text>
              </View>
              {!completedDoses.has(`${dose.medicineId}-${dose.time}`) && (
                <View className="flex-row">
                  <TouchableOpacity
                    className={`w-12 h-12 rounded-full mr-2 items-center justify-center ${
                      dose.taken === true
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                    onPress={() => markMedicineTaken(dose, true)}
                    disabled={updatingMedicine === `${dose.medicineId}-${dose.time}`}
                  >
                    {updatingMedicine === `${dose.medicineId}-${dose.time}` ? (
                      <ActivityIndicator size="small" color={dose.taken === true ? 'white' : '#000000'} />
                    ) : (
                      <Ionicons 
                        name="checkmark" 
                        size={24} 
                        color={dose.taken === true ? 'white' : '#000000'} 
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      dose.taken === false
                        ? 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                    onPress={() => markMedicineTaken(dose, false)}
                    disabled={updatingMedicine === `${dose.medicineId}-${dose.time}`}
                  >
                    {updatingMedicine === `${dose.medicineId}-${dose.time}` ? (
                      <ActivityIndicator size="small" color={dose.taken === false ? 'white' : '#000000'} />
                    ) : (
                      <Ionicons 
                        name="close" 
                        size={24} 
                        color={dose.taken === false ? 'white' : '#000000'} 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              
              {completedDoses.has(`${dose.medicineId}-${dose.time}`) && (
                <View className="items-center">
                  <Text className="text-gray-600 text-sm font-medium">
                    {dose.taken ? '✓ Taken' : '✗ Skipped'}
                  </Text>
                </View>
              )}
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
        <Text className="text-xl font-light mb-4 text-black">
          My Medicines
        </Text>
        {medicines.map(medicine => (
          <View
            key={medicine.id}
            className="p-4 bg-white rounded-2xl mb-4 border border-gray-200 shadow-sm"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-lg text-black">
                  {medicine.name}
                </Text>
                <Text className="text-gray-600 mt-1">
                  Dosage: {medicine.dosage}
                </Text>
                <Text className="text-gray-600">
                  Times: {medicine.times.map(formatTimeForDisplay).join(', ')}
                </Text>
                <Text className="text-gray-600">
                  From: {medicine.startDate} {medicine.endDate && `to ${medicine.endDate}`}
                </Text>
                {medicine.notes && (
                  <Text className="text-gray-500 text-sm mt-1">
                    Notes: {medicine.notes}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => deleteMedicine(medicine.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#000000" />
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
      <View className="items-center px-4 py-4 bg-transparent mt-8">
        <Text className="text-2xl font-bold text-black">
          Medicine Tracker
        </Text>
      </View>
      
      <View className="px-4 pb-4">
        <Text className="text-white/80 text-center italic text-base">
          Consistency is the key to recovery
        </Text>
      </View>
      
      <View className="items-center px-4 pb-4">
        <TouchableOpacity
          className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 items-center justify-center"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {renderTodaySchedule()}
        {renderMedicinesList()}
        
        {/* Medicine Alarms Settings */}
        <View className="px-5 mt-6">
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <Text className="text-xl text-white font-semibold text-center mb-3">
              🔔 Auto Medicine Alarms
            </Text>
            
            <View className="flex-row items-center justify-center mb-3">
              <Text className="text-sm text-white/80 mr-2">
                {medicineAlarmsEnabled ? 'Auto Alarms On' : 'Auto Alarms Off'}
              </Text>
              <Switch
                value={medicineAlarmsEnabled}
                onValueChange={setMedicineAlarmsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#11B5CF' }}
                thumbColor={medicineAlarmsEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>
            
            {medicineAlarmsEnabled && (
              <View className="flex-row items-center justify-between mb-3 px-4">
                <Text className="text-sm text-white/80">Vibration</Text>
                <Switch
                  value={medicineAlarmVibration}
                  onValueChange={setMedicineAlarmVibration}
                  trackColor={{ false: '#E5E7EB', true: '#11B5CF' }}
                  thumbColor={medicineAlarmVibration ? '#ffffff' : '#9CA3AF'}
                />
              </View>
            )}
            
            {medicineAlarmsEnabled ? (
              <Text className="text-sm text-white/60 text-center italic">
                Alarms will trigger automatically at medicine times
              </Text>
            ) : (
              <Text className="text-base text-white/60 text-center italic">
                Medicine alarms are currently disabled
              </Text>
            )}
          </View>
        </View>

        {/* Add Medicine Section */}
        <View className="px-5 mt-6 mb-8">
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



        {/* Alarm Status Display */}
        {medicineAlarmsEnabled && (
          <View className="px-5 mt-4 mb-8">
            <View className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-green-300/20">
              <Text className="text-white font-semibold text-center mb-2">
                ✅ Automatic Alarms Active
              </Text>
              <Text className="text-white/80 text-center text-sm">
                {todaySchedule.filter(dose => !dose.taken).length} pending alarms for today
              </Text>
            </View>
          </View>
        )}

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
                              formData.dosageType === option ? 'bgWarnings-blue-50' : ''
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

  // Debug function to check alarm status
  const debugAlarmStatus = async () => {
    try {
      console.log('🔍 Debugging alarm status...');
      
      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      console.log('📱 Notification permissions:', status);
      
      // Check scheduled notifications
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const medicineNotifications = allNotifications.filter(notification => 
        notification.content.data?.type === 'medicine'
      );
      
      console.log('📋 Total scheduled notifications:', allNotifications.length);
      console.log('💊 Medicine notifications:', medicineNotifications.length);
      
      // Log details of each medicine notification
      medicineNotifications.forEach((notification, index) => {
        const data = notification.content.data;
        console.log(`💊 Medicine ${index + 1}:`, {
          id: notification.identifier,
          medicineName: data?.medicineName,
          time: data?.time,
          trigger: notification.trigger,
        });
      });
      
      // Check today's schedule
      console.log('📅 Today\'s schedule:', todaySchedule.map(d => ({
        name: d.medicineName,
        time: d.time,
        taken: d.taken,
        status: d.taken === true ? 'Taken' : d.taken === false ? 'Skipped' : 'Pending'
      })));
      
      // Check which doses would be discarded (missed)
      const now = new Date();
      const missedDoses = todaySchedule.filter(dose => {
        const [hour, minute] = dose.time.split(':').map(Number);
        const doseTime = new Date();
        doseTime.setHours(hour, minute, 0, 0);
        return doseTime <= now && dose.taken === null;
      });
      
      if (missedDoses.length > 0) {
        console.log('⏰ Missed doses (will be discarded):', missedDoses.map(d => ({
          name: d.medicineName,
          time: d.time,
        })));
      }
      
      // Check alarm settings
      console.log('🔔 Alarm settings:', {
        enabled: medicineAlarmsEnabled,
        vibration: medicineAlarmVibration,
      });
      
      // Calculate missed doses
      const currentTime = new Date();
      const missedDosesCount = todaySchedule.filter(dose => {
        const [hour, minute] = dose.time.split(':').map(Number);
        const doseTime = new Date();
        doseTime.setHours(hour, minute, 0, 0);
        return doseTime <= currentTime && dose.taken === null;
      }).length;

      return {
        permissions: status,
        totalNotifications: allNotifications.length,
        medicineNotifications: medicineNotifications.length,
        todayScheduleCount: todaySchedule.length,
        alarmsEnabled: medicineAlarmsEnabled,
        missedDoses: missedDosesCount,
      };
    } catch (error) {
      console.error('Error debugging alarm status:', error);
      return null;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#73C8A9' }}>
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
    </View>
  );
};

export default MedicineTracker;