import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { StorageManager } from './Medreminder/utils/storageManager';
import { NotificationManager } from './Medreminder/utils/notificationManager';
import { DoseLogClass } from './Medreminder/models/MedicationModels';
import { medicineStyles } from './Medreminder/styles/medicineStyles';

interface Dose {
  id: string;
  medication: any;
  schedule: any;
  time: string;
  doseTime: Date;
  status: 'taken' | 'skipped' | 'pending';
  logId: string | null;
}

interface Stats {
  total: number;
  taken: number;
  skipped: number;
  pending: number;
}

export default function MedicineHomeScreen() {
  const [medications, setMedications] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [todaysDoses, setTodaysDoses] = useState<Dose[]>([]);
  const [doseLogs, setDoseLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAllData();
      // Request notification permissions
      NotificationManager.requestPermissions();
    }, [])
  );

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [medsData, schedulesData, logsData] = await Promise.all([
        StorageManager.getMedications(),
        StorageManager.getSchedules(),
        StorageManager.getDoseLogs()
      ]);
      
      setMedications(medsData.filter((med: any) => med.isActive));
      setSchedules(schedulesData);
      setDoseLogs(logsData);
      
      generateTodaysDoses(medsData, schedulesData, logsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const generateTodaysDoses = (meds: any[], scheds: any[], logs: any[]) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const doses: Dose[] = [];
    
    meds.forEach(medication => {
      if (!medication.isActive) return;
      
      const medSchedules = scheds.filter((s: any) => 
        s.medicationId === medication.id && s.isActive
      );
      
      medSchedules.forEach((schedule: any) => {
        schedule.times.forEach((time: string) => {
          const [hours, minutes] = time.split(':');
          const doseTime = new Date(today);
          doseTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          // Check if this dose has been logged today
          const existingLog = logs.find((log: any) => 
            log.medicationId === medication.id &&
            new Date(log.scheduledTime).toDateString() === todayStr &&
            new Date(log.scheduledTime).getHours() === parseInt(hours) &&
            new Date(log.scheduledTime).getMinutes() === parseInt(minutes)
          );
          
          doses.push({
            id: `${medication.id}-${schedule.id}-${time}`,
            medication,
            schedule,
            time,
            doseTime,
            status: existingLog ? existingLog.status : 'pending',
            logId: existingLog?.id || null
          });
        });
      });
    });
    
    // Sort by time
    doses.sort((a, b) => a.doseTime.getTime() - b.doseTime.getTime());
    setTodaysDoses(doses);
  };

  const handleDoseAction = async (dose: Dose, action: 'taken' | 'skipped') => {
    try {
      const log = new DoseLogClass({
        medicationId: dose.medication.id,
        scheduledTime: dose.doseTime.toISOString(),
        status: action,
        actualTime: new Date().toISOString(),
        notes: ''
      });

      await StorageManager.addDoseLog(log);
      
      // Update local state
      setDoseLogs(prev => [...prev, log]);
      setTodaysDoses(prev => 
        prev.map(d => 
          d.id === dose.id 
            ? { ...d, status: action, logId: log.id }
            : d
        )
      );

      // Show confirmation
      const actionText = action === 'taken' ? 'taken' : 'skipped';
      await NotificationManager.sendImmediateNotification(
        'Dose Logged',
        `${dose.medication.name} marked as ${actionText}`
      );
      
    } catch (error) {
      console.error('Error logging dose:', error);
      Alert.alert('Error', 'Failed to log dose');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  const getTodaysStats = (): Stats => {
    const total = todaysDoses.length;
    const taken = todaysDoses.filter(d => d.status === 'taken').length;
    const skipped = todaysDoses.filter(d => d.status === 'skipped').length;
    const pending = todaysDoses.filter(d => d.status === 'pending').length;
    
    return { total, taken, skipped, pending };
  };

  const renderDoseCard = (dose: Dose) => {
    const isOverdue = dose.doseTime < new Date() && dose.status === 'pending';
    const statusColor = dose.status === 'taken' ? '#34C759' : 
                       dose.status === 'skipped' ? '#FF9500' : 
                       isOverdue ? '#FF3B30' : '#007AFF';

    return (
      <View 
        key={dose.id} 
        style={[
          medicineStyles.card, 
          { borderLeftWidth: 4, borderLeftColor: dose.medication.color }
        ]}
      >
        <View style={medicineStyles.medicationCard}>
          <View style={[
            medicineStyles.medicationIcon,
            { backgroundColor: dose.medication.color + '20' }
          ]}>
            <Ionicons 
              name="medical" 
              size={24} 
              color={dose.medication.color} 
            />
          </View>
          
          <View style={medicineStyles.medicationInfo}>
            <Text style={medicineStyles.medicationName}>
              {dose.medication.name}
            </Text>
            <Text style={medicineStyles.medicationDetails}>
              {dose.medication.dosage} {dose.medication.unit} • {dose.time}
            </Text>
            {dose.medication.instructions && (
              <Text style={[
                medicineStyles.medicationDetails,
                { fontStyle: 'italic' }
              ]}>
                {dose.medication.instructions}
              </Text>
            )}
          </View>
          
          <View style={{ alignItems: 'center' }}>
            {dose.status === 'pending' ? (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[medicineStyles.primaryButton, { 
                    backgroundColor: '#34C759',
                    marginRight: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8
                  }]}
                  onPress={() => handleDoseAction(dose, 'taken')}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[medicineStyles.secondaryButton, { 
                    borderColor: '#FF9500',
                    paddingHorizontal: 16,
                    paddingVertical: 8
                  }]}
                  onPress={() => handleDoseAction(dose, 'skipped')}
                >
                  <Ionicons name="close" size={20} color="#FF9500" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons 
                  name={dose.status === 'taken' ? 'checkmark-circle' : 'close-circle'} 
                  size={32} 
                  color={statusColor} 
                />
                <Text style={{ 
                  color: statusColor, 
                  fontSize: 12, 
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {dose.status}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const stats = getTodaysStats();
  
  if (loading) {
    return (
      <SafeAreaView style={medicineStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>
            Loading your medications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={medicineStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Stats */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
            Today's Progress
          </Text>
          
          <View style={{ flexDirection: 'row' }}>
            <View style={[medicineStyles.statCard, { backgroundColor: '#34C759' + '20' }]}>
              <Text style={[medicineStyles.statNumber, { color: '#34C759' }]}>
                {stats.taken}
              </Text>
              <Text style={medicineStyles.statLabel}>
                Taken
              </Text>
            </View>
            
            <View style={[medicineStyles.statCard, { backgroundColor: '#FF9500' + '20' }]}>
              <Text style={[medicineStyles.statNumber, { color: '#FF9500' }]}>
                {stats.pending}
              </Text>
              <Text style={medicineStyles.statLabel}>
                Pending
              </Text>
            </View>
            
            <View style={[medicineStyles.statCard, { backgroundColor: '#FF3B30' + '20' }]}>
              <Text style={[medicineStyles.statNumber, { color: '#FF3B30' }]}>
                {stats.skipped}
              </Text>
              <Text style={medicineStyles.statLabel}>
                Skipped
              </Text>
            </View>
          </View>
          
          {stats.total > 0 && (
            <View style={medicineStyles.progressContainer}>
              <View style={medicineStyles.progressBar}>
                <View style={[
                  medicineStyles.progressFill,
                  { width: `${(stats.taken / stats.total) * 100}%` }
                ]} />
              </View>
              <Text style={medicineStyles.progressText}>
                {Math.round((stats.taken / stats.total) * 100)}% Complete
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={{ alignItems: 'center', padding: 12 }}
              onPress={() => router.push('/medicine-tracking/add')}
            >
              <Ionicons name="add-circle" size={32} color="#007AFF" />
              <Text style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Add Medicine
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ alignItems: 'center', padding: 12 }}
              onPress={() => router.push('/medicine-tracking/analytics')}
            >
              <Ionicons name="bar-chart" size={32} color="#34C759" />
              <Text style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Analytics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ alignItems: 'center', padding: 12 }}
              onPress={() => router.push('/medicine-tracking/list')}
            >
              <Ionicons name="list" size={32} color="#FF9500" />
              <Text style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                All Medicines
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Medications */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 16 }}>
          Today's Schedule ({stats.total})
        </Text>

        {todaysDoses.length === 0 ? (
          <View style={medicineStyles.card}>
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Ionicons name="medical-outline" size={64} color="#ccc" />
              <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginTop: 16 }}>
                No medications scheduled for today
              </Text>
              <TouchableOpacity
                style={[medicineStyles.primaryButton, { marginTop: 16 }]}
                onPress={() => router.push('/medicine-tracking/add')}
              >
                <Text style={medicineStyles.primaryButtonText}>
                  Add Your First Medicine
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          todaysDoses.map(renderDoseCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={medicineStyles.fab}
        onPress={() => router.push('/medicine-tracking/add')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
} 