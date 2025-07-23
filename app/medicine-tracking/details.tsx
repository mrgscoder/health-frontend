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
import { router, useLocalSearchParams } from 'expo-router';

import { StorageManager } from './Medreminder/utils/storageManager';
import ApiService from './Medreminder/utils/apiService';
import { medicineStyles } from './Medreminder/styles/medicineStyles';
import { MEDICATION_CATEGORIES } from './Medreminder/data/medicationCategories';

interface Medication {
  id: string;
  name: string;
  category: string;
  dosage: string;
  unit: string;
  instructions: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MedicationSchedule {
  id: string;
  medicationId: string;
  times: string[];
  frequency: string;
  duration: string | null;
  mealTiming: string;
  isActive: boolean;
  createdAt: string;
}

interface DoseLog {
  id: string;
  medicationId: string;
  scheduledTime: string;
  status: 'taken' | 'skipped' | 'missed';
  actualTime: string;
  notes: string;
  loggedAt: string;
}

export default function MedicationDetailsScreen() {
  const [medication, setMedication] = useState<Medication | null>(null);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [recentLogs, setRecentLogs] = useState<DoseLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const params = useLocalSearchParams();
  const medicationId = params.id as string;

  console.log('🔍 Loading medication details for ID:', medicationId);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMedicationDetails();
    }, [medicationId])
  );

  const loadMedicationDetails = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching medication details from API...');
      
      // Get all medications from API
      const medications = await ApiService.getMedications();
      console.log(`📋 Retrieved ${medications.length} medications from API`);
      
      // Find the specific medication
      const med = medications.find(m => m.id === medicationId);
      console.log('🔍 Looking for medication with ID:', medicationId);
      console.log('📝 Available medication IDs:', medications.map(m => m.id));
      
      if (!med) {
        console.log('❌ Medication not found in API response');
        Alert.alert('Error', 'Medication not found');
        router.back();
        return;
      }
      
      console.log('✅ Found medication:', med.name);
      setMedication(med);
      
      // Get schedules and logs for this medication
      const [schedulesData, logsData] = await Promise.all([
        ApiService.getSchedules(),
        ApiService.getDoseLogs()
      ]);
      
      const medicationSchedules = schedulesData.filter(s => s.medicationId === medicationId);
      const medicationLogs = logsData.filter(log => log.medicationId === medicationId);
      
      console.log(`📅 Found ${medicationSchedules.length} schedules for medication`);
      console.log(`📊 Found ${medicationLogs.length} dose logs for medication`);
      
      setSchedules(medicationSchedules);
      setRecentLogs(medicationLogs.slice(0, 10));
      
    } catch (error) {
      console.error('❌ Error loading medication details:', error);
      Alert.alert('Error', 'Failed to load medication details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedicationDetails();
    setRefreshing(false);
  }, [medicationId]);

  const handleEditMedication = () => {
    if (medication) {
      router.push('/medicine-tracking/add', {
        medication: JSON.stringify(medication)
      });
    }
  };

  const handleDeleteMedication = async () => {
    if (!medication) return;

    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medication.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting medication:', medication.id);
              await StorageManager.deleteMedication(medication.id);
              Alert.alert('Success', `${medication.name} has been deleted.`);
              router.back();
            } catch (error) {
              console.error('❌ Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async () => {
    if (!medication) return;

    try {
      console.log('🔄 Toggling medication active status:', medication.id);
      const updatedMedication = {
        ...medication,
        isActive: !medication.isActive,
        updatedAt: new Date().toISOString()
      };
      await StorageManager.updateMedication(updatedMedication);
      setMedication(updatedMedication);
      console.log('✅ Medication status updated successfully');
    } catch (error) {
      console.error('❌ Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return MEDICATION_CATEGORIES.find(cat => cat.id === categoryId) || {
      name: 'Unknown',
      color: '#999',
      icon: 'help'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#34C759';
      case 'skipped': return '#FF9500';
      case 'missed': return '#FF3B30';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return 'checkmark-circle';
      case 'skipped': return 'close-circle';
      case 'missed': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={medicineStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>
            Loading medication details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!medication) {
    return (
      <SafeAreaView style={medicineStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>
            Medication not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryInfo = getCategoryInfo(medication.category);

  return (
    <SafeAreaView style={medicineStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Medication Details
          </Text>
        </View>

        {/* Medication Card */}
        <View style={[
          medicineStyles.card,
          { borderLeftWidth: 4, borderLeftColor: medication.color }
        ]}>
          <View style={medicineStyles.medicationCard}>
            <View style={[
              medicineStyles.medicationIcon,
              { backgroundColor: medication.color + '20' }
            ]}>
              <Ionicons 
                name="medical" 
                size={24} 
                color={medication.color} 
              />
            </View>
            
            <View style={medicineStyles.medicationInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={medicineStyles.medicationName}>
                  {medication.name}
                </Text>
                {!medication.isActive && (
                  <View style={{
                    backgroundColor: '#FF3B30',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginLeft: 8
                  }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                      INACTIVE
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={medicineStyles.medicationDetails}>
                {medication.dosage} {medication.unit} • {categoryInfo.name}
              </Text>
              
              {medication.instructions && (
                <Text style={[
                  medicineStyles.medicationDetails,
                  { fontStyle: 'italic', marginTop: 4 }
                ]}>
                  {medication.instructions}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <TouchableOpacity
            style={[medicineStyles.button, medicineStyles.secondaryButton, { flex: 1, marginRight: 8 }]}
            onPress={handleToggleActive}
          >
            <Ionicons 
              name={medication.isActive ? 'eye-off' : 'eye'} 
              size={20} 
              color="#666" 
            />
            <Text style={medicineStyles.secondaryButtonText}>
              {medication.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[medicineStyles.button, medicineStyles.primaryButton, { flex: 1, marginLeft: 8 }]}
            onPress={handleEditMedication}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={medicineStyles.primaryButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Schedules Section */}
        <View style={medicineStyles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="time" size={20} color="#007AFF" />
            <Text style={medicineStyles.sectionTitle}>Schedules</Text>
            <TouchableOpacity
              style={{ marginLeft: 'auto' }}
              onPress={() => router.push('/medicine-tracking/schedule', {
                medicationId: medication.id,
                medicationName: medication.name
              })}
            >
              <Ionicons name="add-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          {schedules.length === 0 ? (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>
              No schedules set. Tap the + button to add a schedule.
            </Text>
          ) : (
            schedules.map((schedule) => (
              <View key={schedule.id} style={medicineStyles.card}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {schedule.times.join(', ')}
                </Text>
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {schedule.frequency} • {schedule.mealTiming}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Recent Logs Section */}
        <View style={medicineStyles.section}>
          <Text style={medicineStyles.sectionTitle}>Recent Dose Logs</Text>
          
          {recentLogs.length === 0 ? (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>
              No dose logs yet.
            </Text>
          ) : (
            recentLogs.map((log) => (
              <View key={log.id} style={medicineStyles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons 
                    name={getStatusIcon(log.status)} 
                    size={16} 
                    color={getStatusColor(log.status)} 
                  />
                  <Text style={{ 
                    marginLeft: 8, 
                    fontWeight: 'bold',
                    color: getStatusColor(log.status)
                  }}>
                    {log.status.toUpperCase()}
                  </Text>
                  <Text style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>
                    {new Date(log.actualTime).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Scheduled: {new Date(log.scheduledTime).toLocaleTimeString()}
                </Text>
                {log.notes && (
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {log.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[medicineStyles.button, { backgroundColor: '#FF3B30', marginTop: 24 }]}
          onPress={handleDeleteMedication}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>
            Delete Medication
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 