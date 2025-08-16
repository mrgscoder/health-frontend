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
  StyleSheet,
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
      console.log('🔔 Starting alarm scheduling for today...');

      // Get existing notifications
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const existingMedicineNotifications = allNotifications.filter(notification =>
        notification.content.data?.type === 'medicine'
      );

      // Create a set to track scheduled dose keys
      const scheduledDoses = new Map<string, boolean>();
      let scheduledCount = 0;
      let cancelledCount = 0;
      let skippedCount = 0;

      // Cancel all existing medicine notifications to prevent duplicates
      console.log(`🗑️ Cancelling ${existingMedicineNotifications.length} existing notifications...`);
      for (const notification of existingMedicineNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        cancelledCount++;
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Schedule notifications for each dose
      for (const dose of todaySchedule) {
        // Skip if already taken
        if (dose.taken === true) {
          console.log(`⏭️ Skipping ${dose.medicineName} - already taken`);
          skippedCount++;
          continue;
        }

        // Create unique dose key
        const doseKey = `${dose.medicineId}-${dose.time}-${today}`;
        if (scheduledDoses.has(doseKey)) {
          console.log(`⏭️ Skipping duplicate: ${dose.medicineName} at ${dose.time}`);
          skippedCount++;
          continue;
        }

        // Parse time and create schedule date
        const [hour, minute] = dose.time.split(':').map(Number);
        const scheduleDate = new Date();
        scheduleDate.setHours(hour, minute, 0, 0);

        // Ensure the date is today to avoid scheduling for future/past days
        scheduleDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

        const millisecondsUntilAlarm = scheduleDate.getTime() - now.getTime();
        const secondsUntilAlarm = Math.floor(millisecondsUntilAlarm / 1000);

        // Skip if the time has passed or is too soon (within 30 seconds)
        if (secondsUntilAlarm <= 30) {
          console.log(`⏰ ${dose.medicineName} at ${dose.time} is in the past or too soon (${secondsUntilAlarm}s) - skipping`);
          skippedCount++;
          continue;
        }

        // Skip if the time is more than 24 hours away
        if (secondsUntilAlarm > 86400) {
          console.log(`⚠️ Skipping ${dose.medicineName} - too far in future (${secondsUntilAlarm}s)`);
          skippedCount++;
          continue;
        }

        // Schedule the notification
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'MEDICINE TIME!',
            body: `Time to take ${dose.medicineName} - ${dose.dosage}`,
            data: {
              type: 'medicine',
              medicineId: dose.medicineId,
              time: dose.time,
              medicineName: dose.medicineName,
              dosage: dose.dosage,
              doseKey: doseKey,
            },
            sound: 'default',
            priority: 'high',
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((scheduleDate.getTime() - Date.now()) / 1000),
          },
        });

        scheduledDoses.set(doseKey, true);
        scheduledCount++;
        console.log(`✅ Scheduled alarm: ${dose.medicineName} at ${scheduleDate.toLocaleTimeString()} (ID: ${notificationId}, Key: ${doseKey})`);
      }

      console.log(`🎯 Scheduling complete: ${scheduledCount} new alarms, ${cancelledCount} cancelled, ${skippedCount} skipped`);

      // Save last schedule timestamp
      await AsyncStorage.setItem('lastAutoSchedule', now.toISOString());

    } catch (error) {
      console.error('❌ Error scheduling alarms:', error);
      Alert.alert('Error', 'Failed to schedule alarms. Please try again.');
    } finally {
      setIsSchedulingAlarms(false);
    }
  }, [medicineAlarmsEnabled, todaySchedule]);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
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
              'Please enable notifications in your device settings to receive medicine reminders.',
              [
                { text: 'OK' },
                {
                  text: 'Open Settings',
                  onPress: () => Alert.alert('Settings', 'Please manually enable notifications.')
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

  // Auto-schedule alarms when data changes
  useEffect(() => {
    const checkAndScheduleAlarms = async () => {
      if (todaySchedule.length === 0) return;

      try {
        const lastSchedule = await AsyncStorage.getItem('lastAutoSchedule');
        const today = new Date().toISOString().split('T')[0];

        const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const existingMedicineNotifications = existingNotifications.filter(notification =>
          notification.content.data?.type === 'medicine'
        );

        const shouldReschedule = !lastSchedule ||
          !lastSchedule.startsWith(today) ||
          existingMedicineNotifications.length === 0;

        if (!shouldReschedule) {
          console.log('⏭️ Alarms already scheduled today, skipping');
          return;
        }

        console.log('🔄 Scheduling alarms with delay...');
        setTimeout(() => {
          autoScheduleAlarms();
        }, 3000);
      } catch (error) {
        console.error('Error checking last schedule:', error);
      }
    };
    checkAndScheduleAlarms();
  }, [autoScheduleAlarms, todaySchedule]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App became active');
        if (medicineAlarmsEnabled && todaySchedule.length > 0) {
          console.log('📱 Checking alarm status...');
          autoScheduleAlarms();
        }
      }
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, medicineAlarmsEnabled, todaySchedule, autoScheduleAlarms]);

  // Medicine Alarm Handler
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      if (notification.request.content.data?.type !== 'medicine') return;
      if (isSchedulingAlarms) {
        console.log('⚠️ Ignoring notification during scheduling');
        return;
      }

      if (medicineAlarmVibration) {
        Vibration.vibrate([0, 500, 200, 500]);
      }

      Alert.alert(
        '💊 MEDICINE ALARM!',
        `Time to take your ${notification.request.content.data?.medicineName}!`,
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
      Vibration.cancel();
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

  // Load medicines on component mount
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
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
        await loadMedicines();
        await loadTodaySchedule();
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    checkAuthAndLoadData();
  }, []);

  // Load alarm settings
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

        if (lastSchedule) {
          const lastScheduleDate = lastSchedule.split('T')[0];
          const today = new Date().toISOString().split('T')[0];

          if (lastScheduleDate !== today) {
            console.log('📅 New day detected - clearing old alarms');
            const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
            const medicineNotifications = allNotifications.filter(notification =>
              notification.content.data?.type === 'medicine'
            );

            for (const notification of medicineNotifications) {
              await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
            await AsyncStorage.removeItem('lastAutoSchedule');
          }
        }
      } catch (error) {
        console.error('Error loading alarm settings:', error);
      }
    };
    loadAlarmSettings();
  }, []);

  // Save alarm settings
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
    if (!timeSlot.hour || !timeSlot.minute) {
      return '00:00';
    }

    let hour = parseInt(timeSlot.hour);
    if (timeSlot.period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (timeSlot.period === 'AM' && hour === 12) {
      hour = 0;
    }

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
    if (!formData.name) {
      Alert.alert('Error', 'Please enter medicine name');
      return;
    }

    if (formData.dosageType === 'Other' && !formData.customDosage) {
      Alert.alert('Error', 'Please enter custom dosage');
      return;
    }

    const invalidTimes = formData.times.filter(time => !time.hour || !time.minute);
    if (invalidTimes.length > 0) {
      Alert.alert('Error', 'Please enter valid time for all time slots');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const isStartingToday = formData.startDate === today;
    console.log('📅 Medicine start date:', formData.startDate, 'Today:', today, 'Is starting today:', isStartingToday);

    try {
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

      await loadMedicines();
      setTimeout(async () => {
        await loadTodaySchedule();
        console.log('✅ Today\'s schedule reloaded after adding medicine');
      }, 500);

      Alert.alert('Success', isStartingToday
        ? 'Medicine added successfully! It will appear in today\'s schedule. Alarms will be automatically scheduled.'
        : 'Medicine added successfully! It will appear in the schedule starting from the selected date.');
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

    if (field === 'hour') {
      const hourNum = parseInt(value);
      if (value === '' || (hourNum >= 1 && hourNum <= 12)) {
        newValue = value;
      } else {
        return;
      }
    } else if (field === 'minute') {
      const minuteNum = parseInt(value);
      if (value === '' || (minuteNum >= 0 && minuteNum <= 59)) {
        newValue = value;
      } else {
        return;
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

      setTodaySchedule(prev =>
        prev.map(item =>
          item.medicineId === dose.medicineId && item.time === dose.time
            ? { ...item, taken }
            : item
        )
      );

      const today = new Date().toISOString().split('T')[0];
      await markMedicineTakenAPI({
        medicineId: dose.medicineId,
        date: today,
        time: dose.time,
        taken,
      });

      setCompletedDoses(prev => new Set([...prev, medicineKey]));

      if (taken) {
        const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const doseKey = `${dose.medicineId}-${dose.time}-${today}`;
        const specificNotification = allNotifications.find(notification =>
          notification.content.data?.type === 'medicine' &&
          notification.content.data?.doseKey === doseKey
        );

        if (specificNotification) {
          await Notifications.cancelScheduledNotificationAsync(specificNotification.identifier);
          console.log(`🔕 Cancelled alarm for ${dose.medicineName} at ${dose.time}`);
        }
      }
    } catch (error) {
      console.error('Error marking medicine:', error);
      setTodaySchedule(prev =>
        prev.map(item =>
          item.medicineId === dose.medicineId && item.time === dose.time
            ? { ...item, taken: !taken }
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
              const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
              const medicineNotifications = allNotifications.filter(notification =>
                notification.content.data?.type === 'medicine' &&
                notification.content.data?.medicineId === medicineId
              );

              for (const notification of medicineNotifications) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                console.log(`🔕 Cancelled alarm for: ${notification.content.data?.medicineName} at ${notification.content.data?.time}`);
              }

              await deleteMedicineAPI(medicineId);
              setMedicines(medicines.filter(m => m.id !== medicineId));
              setMedicineLogs(logs => logs.filter(l => l.medicineId !== medicineId));
              setTodaySchedule(prev => prev.filter(dose => dose.medicineId !== medicineId));

              await loadTodaySchedule();
              console.log(`✅ Medicine deleted successfully`);
            } catch (error) {
              console.error('Error deleting medicine:', error);
              Alert.alert('Error', 'Failed to delete medicine. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatTimeForDisplay = (timeString: string): string => {
    const timeSlot = stringToTimeSlot(timeString);
    return `${timeSlot.hour}:${timeSlot.minute} ${timeSlot.period}`;
  };

  const renderTodaySchedule = () => {
    if (loadingToday) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#afa0cf" />
          <Text style={styles.loadingText}>
            Loading today's schedule...
          </Text>
        </View>
      );
    }
    if (todaySchedule.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No medicines scheduled for today
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today's Schedule
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadTodaySchedule}
            disabled={loadingToday}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="#afa0cf"
            />
          </TouchableOpacity>
        </View>
        {todaySchedule.map((dose, index) => (
          <View
            key={`${dose.medicineId}-${dose.time}-${index}`}
            style={[
              styles.medicineCard,
              dose.taken === true
                ? styles.takenCard
                : dose.taken === false
                ? styles.skippedCard
                : styles.pendingCard
            ]}
          >
            <View style={styles.medicineCardContent}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>
                  {dose.medicineName}
                </Text>
                <Text style={styles.medicineDetails}>
                  {dose.dosage} at {formatTimeForDisplay(dose.time)}
                </Text>
              </View>
              {!completedDoses.has(`${dose.medicineId}-${dose.time}`) && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      dose.taken === true ? styles.takenButton : styles.defaultButton
                    ]}
                    onPress={() => markMedicineTaken(dose, true)}
                    disabled={updatingMedicine === `${dose.medicineId}-${dose.time}`}
                  >
                    {updatingMedicine === `${dose.medicineId}-${dose.time}` ? (
                      <ActivityIndicator size="small" color={dose.taken === true ? 'white' : '#afa0cf'} />
                    ) : (
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={dose.taken === true ? 'white' : '#afa0cf'}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      dose.taken === false ? styles.skippedButton : styles.defaultButton
                    ]}
                    onPress={() => markMedicineTaken(dose, false)}
                    disabled={updatingMedicine === `${dose.medicineId}-${dose.time}`}
                  >
                    {updatingMedicine === `${dose.medicineId}-${dose.time}` ? (
                      <ActivityIndicator size="small" color={dose.taken === false ? 'white' : '#afa0cf'} />
                    ) : (
                      <Ionicons
                        name="close"
                        size={24}
                        color={dose.taken === false ? 'white' : '#afa0cf'}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              {completedDoses.has(`${dose.medicineId}-${dose.time}`) && (
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#afa0cf" />
          <Text style={styles.loadingText}>
            Loading medicines...
          </Text>
        </View>
      );
    }
    if (medicines.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No medicines added yet
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            My Medicines
          </Text>
        </View>
        {medicines.map(medicine => (
          <View
            key={medicine.id}
            style={styles.medicineCard}
          >
            <View style={styles.medicineCardContent}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>
                  {medicine.name}
                </Text>
                <Text style={styles.medicineDetails}>
                  Dosage: {medicine.dosage}
                </Text>
                <Text style={styles.medicineDetails}>
                  Times: {medicine.times.map(formatTimeForDisplay).join(', ')}
                </Text>
                <Text style={styles.medicineDetails}>
                  From: {medicine.startDate} {medicine.endDate && `to ${medicine.endDate}`}
                </Text>
                {medicine.notes && (
                  <Text style={styles.medicineNotes}>
                    Notes: {medicine.notes}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteMedicine(medicine.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#afa0cf" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTimePicker = (timeSlot: TimeSlot, index: number) => (
    <View key={index} style={styles.timePickerRow}>
      <View style={styles.timePickerContent}>
        <TextInput
          style={styles.timeInput}
          value={timeSlot.hour}
          onChangeText={(text) => {
            if (text === '' || (parseInt(text) >= 1 && parseInt(text) <= 12)) {
              updateTimeSlot(index, 'hour', text);
            }
          }}
          placeholder="9"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.timeSeparator}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={timeSlot.minute}
          onChangeText={(text) => {
            if (text === '' || (parseInt(text) >= 0 && parseInt(text) <= 59)) {
              updateTimeSlot(index, 'minute', text);
            }
          }}
          placeholder="00"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={2}
        />
        <View style={styles.periodContainer}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              timeSlot.period === 'AM' && styles.periodButtonActive
            ]}
            onPress={() => updateTimeSlot(index, 'period', 'AM')}
          >
            <Text style={[
              styles.periodButtonText,
              timeSlot.period === 'AM' && styles.periodButtonTextActive
            ]}>
              AM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              timeSlot.period === 'PM' && styles.periodButtonActive
            ]}
            onPress={() => updateTimeSlot(index, 'period', 'PM')}
          >
            <Text style={[
              styles.periodButtonText,
              timeSlot.period === 'PM' && styles.periodButtonTextActive
            ]}>
              PM
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {formData.times.length > 1 && (
        <TouchableOpacity
          style={styles.removeTimeButton}
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
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Medicine Tracker
        </Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>
          Consistency is the key to recovery
        </Text>
      </View>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTodaySchedule()}
        {renderMedicinesList()}
        <View style={styles.sectionContainer}>
          <View style={styles.alarmSettingsCard}>
            <View style={styles.alarmSettingsTitleContainer}>
              <Ionicons name="notifications" size={20} color="#afa0cf" />
              <Text style={styles.alarmSettingsTitle}>
                Auto Medicine Alarms
              </Text>
            </View>
            <View style={styles.alarmToggleContainer}>
              <Text style={styles.alarmToggleText}>
                {medicineAlarmsEnabled ? 'Auto Alarms On' : 'Auto Alarms Off'}
              </Text>
              <Switch
                value={medicineAlarmsEnabled}
                onValueChange={setMedicineAlarmsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#afa0cf' }}
                thumbColor={medicineAlarmsEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>
            {medicineAlarmsEnabled && (
              <View style={styles.vibrationToggleContainer}>
                <Text style={styles.vibrationToggleText}>Vibration</Text>
                <Switch
                  value={medicineAlarmVibration}
                  onValueChange={setMedicineAlarmVibration}
                  trackColor={{ false: '#E5E7EB', true: '#afa0cf' }}
                  thumbColor={medicineAlarmVibration ? '#ffffff' : '#9CA3AF'}
                />
              </View>
            )}
            {medicineAlarmsEnabled ? (
              <Text style={styles.alarmStatusText}>
                Alarms will trigger automatically at medicine times
              </Text>
            ) : (
              <Text style={styles.alarmStatusText}>
                Medicine alarms are currently disabled
              </Text>
            )}
          </View>
        </View>
        <View style={styles.addMedicineSection}>
          <TouchableOpacity
            style={styles.addMedicineButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={32} color="#afa0cf" />
            <Text style={styles.addMedicineButtonText}>
              Add Medicine
            </Text>
          </TouchableOpacity>
        </View>
        {medicineAlarmsEnabled && (
          <View style={styles.alarmStatusContainer}>
            <View style={styles.alarmStatusCard}>
              <Text style={styles.alarmStatusTitle}>
                ✅ Automatic Alarms Active
              </Text>
              <Text style={styles.alarmStatusSubtitle}>
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
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={100}
          style={styles.modalBlurView}
        >
          <View
            style={styles.modalContent}
            onTouchStart={() => {
              if (showDosageDropdown) {
                setShowDosageDropdown(false);
              }
            }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medicine</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              onTouchStart={() => {
                if (showDosageDropdown) {
                  setShowDosageDropdown(false);
                }
              }}
            >
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Medicine Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter medicine name"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Dosage *</Text>
                <View
                  style={styles.dosageDropdownContainer}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <TouchableOpacity
                    style={styles.dosageDropdownButton}
                    onPress={() => {
                      console.log('Current dosageType:', formData.dosageType);
                      setShowDosageDropdown(!showDosageDropdown);
                    }}
                  >
                    <Text style={styles.dosageDropdownText}>
                      {formData.dosageType}
                    </Text>
                    <Ionicons
                      name={showDosageDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  {showDosageDropdown && (
                    <View style={styles.dosageDropdown}>
                      <ScrollView
                        style={styles.dosageDropdownScroll}
                        showsVerticalScrollIndicator={false}
                      >
                        {dosageOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.dosageOption,
                              formData.dosageType === option && styles.dosageOptionActive
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              console.log('Selecting dosage option:', option);
                              setFormData(prev => ({
                                ...prev,
                                dosageType: option,
                                customDosage: option !== 'Other' ? '' : prev.customDosage
                              }));
                              setShowDosageDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dosageOptionText,
                              formData.dosageType === option && styles.dosageOptionTextActive
                            ]}>
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
                    style={styles.formInput}
                    value={formData.customDosage}
                    onChangeText={(text) => setFormData({...formData, customDosage: text})}
                    placeholder="Enter custom dosage (e.g., 1.5 tablets, 3ml, etc.) *"
                  />
                )}
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Times *</Text>
                {formData.times.map((timeSlot, index) => renderTimePicker(timeSlot, index))}
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={addTimeSlot}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#6B7280" />
                  <Text style={styles.addTimeButtonText}>Add Time</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Start Date *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={[
                    styles.dateButtonText,
                    !formData.startDate && styles.dateButtonPlaceholder
                  ]}>
                    {formData.startDate || 'Select start date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>End Date (Optional)</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={[
                    styles.dateButtonText,
                    !formData.endDate && styles.dateButtonPlaceholder
                  ]}>
                    {formData.endDate || 'Select end date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={styles.formTextArea}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({...formData, notes: text})}
                  placeholder="Additional notes..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled
                ]}
                onPress={addMedicine}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="medical-outline" size={20} color="white" />
                )}
                <Text style={styles.submitButtonText}>
                  {loading ? 'Adding...' : 'Add Medicine'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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

  const debugAlarmStatus = async () => {
    try {
      console.log('🔍 Debugging alarm status...');
      const { status } = await Notifications.getPermissionsAsync();
      console.log('📱 Notification permissions:', status);

      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const medicineNotifications = allNotifications.filter(notification =>
        notification.content.data?.type === 'medicine'
      );

      console.log('📋 Total scheduled notifications:', allNotifications.length);
      console.log('💊 Medicine notifications:', medicineNotifications.length);

      medicineNotifications.forEach((notification, index) => {
        const data = notification.content.data;
        console.log(`💊 Medicine ${index + 1}:`, {
          id: notification.identifier,
          medicineName: data?.medicineName,
          time: data?.time,
          trigger: notification.trigger,
        });
      });

      console.log('📅 Today\'s schedule:', todaySchedule.map(d => ({
        name: d.medicineName,
        time: d.time,
        taken: d.taken,
        status: d.taken === true ? 'Taken' : d.taken === false ? 'Skipped' : 'Pending'
      })));

      const missedDoses = todaySchedule.filter(dose => {
        const [hour, minute] = dose.time.split(':').map(Number);
        const doseTime = new Date();
        doseTime.setHours(hour, minute, 0, 0);
        return doseTime <= new Date() && dose.taken === null;
      });

      if (missedDoses.length > 0) {
        console.log('⏰ Missed doses:', missedDoses.map(d => ({
          name: d.medicineName,
          time: d.time,
        })));
      }

      console.log('🔔 Alarm settings:', {
        enabled: medicineAlarmsEnabled,
        vibration: medicineAlarmVibration,
      });

      return {
        permissions: status,
        totalNotifications: allNotifications.length,
        medicineNotifications: medicineNotifications.length,
        todayScheduleCount: todaySchedule.length,
        alarmsEnabled: medicineAlarmsEnabled,
        missedDoses: missedDoses.length,
      };
    } catch (error) {
      console.error('Error debugging alarm status:', error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderMainContent()}
        {renderAddMedicineModal()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3CCE3',
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subtitleText: {
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
  addButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#afa0cf',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  refreshButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 12,
  },
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  takenCard: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
  },
  skippedCard: {
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  pendingCard: {
    borderColor: '#d1d5db',
    shadowColor: '#d1d5db',
  },
  medicineCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  medicineDetails: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  medicineNotes: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: '#f3f4f6',
  },
  takenButton: {
    backgroundColor: '#10b981',
  },
  skippedButton: {
    backgroundColor: '#ef4444',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  alarmSettingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  alarmSettingsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alarmSettingsTitle: {
    fontSize: 20,
    color: '#afa0cf',
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  alarmToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alarmToggleText: {
    fontSize: 14,
    color: '#afa0cf',
    marginRight: 8,
  },
  vibrationToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  vibrationToggleText: {
    fontSize: 14,
    color: '#afa0cf',
  },
  alarmStatusText: {
    fontSize: 14,
    color: '#afa0cf',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addMedicineSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  addMedicineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#afa0cf',
  },
  addMedicineButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 20,
    marginLeft: 12,
  },
  alarmStatusContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  alarmStatusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
  },
  alarmStatusTitle: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18,
  },
  alarmStatusSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBlurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalContent: {
    backgroundColor: '#D3CCE3',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    flex: 1,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#1f2937',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 80,
  },
  dosageDropdownContainer: {
    position: 'relative',
    zIndex: 9999,
  },
  dosageDropdownButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dosageDropdownText: {
    color: '#1f2937',
    fontSize: 16,
  },
  dosageDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    marginTop: 4,
    zIndex: 9999,
    maxHeight: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dosageDropdownScroll: {
    maxHeight: 300,
  },
  dosageOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    minHeight: 44,
    justifyContent: 'center',
  },
  dosageOptionActive: {
    backgroundColor: '#f3f4f6',
  },
  dosageOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dosageOptionTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  timePickerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  timePickerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  timeSeparator: {
    color: '#374151',
    marginHorizontal: 4,
    fontWeight: '600',
    fontSize: 20,
  },
  periodContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
  },
  periodButtonActive: {
    backgroundColor: '#000000',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  removeTimeButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  addTimeButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    marginTop: 8,
  },
  addTimeButtonText: {
    color: '#6b7280',
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dateButtonText: {
    color: '#374151',
    fontSize: 18,
  },
  dateButtonPlaceholder: {
    color: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default MedicineTracker;