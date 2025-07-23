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

export default function MedicationListScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [])
  );

  const loadMedications = async () => {
    try {
      setLoading(true);
      const medsData = await StorageManager.getMedications();
      setMedications(medsData);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  }, []);

  const handleEditMedication = (medication: Medication) => {
    router.push('/medicine-tracking/add', {
      medication: JSON.stringify(medication)
    });
  };

  const handleViewDetails = (medication: Medication) => {
    router.push('/medicine-tracking/details', {
      id: medication.id
    });
  };

  const handleDeleteMedication = async (medication: Medication) => {
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
              await StorageManager.deleteMedication(medication.id);
              await loadMedications();
              Alert.alert('Success', `${medication.name} has been deleted.`);
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async (medication: Medication) => {
    try {
      const updatedMedication = {
        ...medication,
        isActive: !medication.isActive,
        updatedAt: new Date().toISOString()
      };
      await StorageManager.updateMedication(updatedMedication);
      await loadMedications();
    } catch (error) {
      console.error('Error updating medication:', error);
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

  const renderMedicationCard = (medication: Medication) => {
    const categoryInfo = getCategoryInfo(medication.category);
    
    return (
      <TouchableOpacity
        key={medication.id} 
        style={[
          medicineStyles.card, 
          { borderLeftWidth: 4, borderLeftColor: medication.color }
        ]}
        onPress={() => handleViewDetails(medication)}
      >
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
            
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Added {new Date(medication.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={{ padding: 8, marginBottom: 4 }}
              onPress={() => handleToggleActive(medication)}
            >
              <Ionicons 
                name={medication.isActive ? 'eye' : 'eye-off'} 
                size={24} 
                color={medication.isActive ? '#34C759' : '#FF9500'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ padding: 8, marginBottom: 4 }}
              onPress={() => handleEditMedication(medication)}
            >
              <Ionicons name="create" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => handleDeleteMedication(medication)}
            >
              <Ionicons name="trash" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={medicineStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>
            Loading medications...
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
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 8 }}>
            All Medications ({medications.length})
          </Text>
        </View>

        {medications.length === 0 ? (
          <View style={medicineStyles.card}>
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Ionicons name="medical-outline" size={64} color="#ccc" />
              <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginTop: 16 }}>
                No medications added yet
              </Text>
              <TouchableOpacity
                style={[medicineStyles.primaryButton, { marginTop: 16 }]}
                onPress={() => router.push('/medicine-tracking/add')}
              >
                <Text style={medicineStyles.primaryButtonText}>
                  Add Your First Medication
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          medications.map(renderMedicationCard)
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