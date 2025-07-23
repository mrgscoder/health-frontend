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

import { StorageManager, AdherenceData } from './Medreminder/utils/storageManager';
import { medicineStyles } from './Medreminder/styles/medicineStyles';

interface TimeRange {
  id: string;
  name: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { id: '7', name: '7 Days', days: 7 },
  { id: '30', name: '30 Days', days: 30 },
  { id: '90', name: '90 Days', days: 90 }
];

export default function AnalyticsScreen() {
  const [adherenceData, setAdherenceData] = useState<AdherenceData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData();
    }, [selectedTimeRange])
  );

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const days = parseInt(selectedTimeRange);
      const data = await StorageManager.getAdherenceData(null, days);
      setAdherenceData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  }, [selectedTimeRange]);

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return '#34C759';
    if (rate >= 70) return '#FF9500';
    return '#FF3B30';
  };

  const getAdherenceStatus = (rate: number) => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 70) return 'Good';
    if (rate >= 50) return 'Fair';
    return 'Poor';
  };

  const renderStatCard = (title: string, value: number, color: string, subtitle?: string) => (
    <View style={[
      medicineStyles.card, 
      { flex: 1, marginHorizontal: 4 }
    ]}>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const renderMedicationCard = (medication: any) => {
    const medicationLogs = adherenceData?.logs.filter(log => 
      log.medicationId === medication.id
    ) || [];
    
    const totalScheduled = medicationLogs.length;
    const taken = medicationLogs.filter(log => log.status === 'taken').length;
    const adherenceRate = totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0;
    
    return (
      <View 
        key={medication.id} 
        style={[
          medicineStyles.card, 
          { borderLeftWidth: 4, borderLeftColor: medication.color }
        ]}
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
            <Text style={medicineStyles.medicationName}>
              {medication.name}
            </Text>
            <Text style={medicineStyles.medicationDetails}>
              {medication.dosage} {medication.unit}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <View style={[
                { width: 60, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }
              ]}>
                <View style={[
                  { height: '100%', backgroundColor: getAdherenceColor(adherenceRate) },
                  { width: `${adherenceRate}%` }
                ]} />
              </View>
              <Text style={[
                { fontSize: 14, fontWeight: '600', marginLeft: 8 },
                { color: getAdherenceColor(adherenceRate) }
              ]}>
                {adherenceRate}%
              </Text>
            </View>
            
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {taken} of {totalScheduled} doses taken
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={medicineStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>
            Loading analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const overallAdherenceRate = adherenceData?.adherenceRate || 0;
  const adherenceColor = getAdherenceColor(overallAdherenceRate);
  const adherenceStatus = getAdherenceStatus(overallAdherenceRate);

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
            Analytics
          </Text>
        </View>

        {/* Time Range Selector */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Time Range
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {TIME_RANGES.map(range => (
              <TouchableOpacity
                key={range.id}
                style={[
                  {
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    marginHorizontal: 4,
                    alignItems: 'center'
                  },
                  selectedTimeRange === range.id
                    ? { backgroundColor: '#007AFF' }
                    : { backgroundColor: '#f0f0f0' }
                ]}
                onPress={() => setSelectedTimeRange(range.id)}
              >
                <Text style={[
                  { fontSize: 14, fontWeight: '600' },
                  selectedTimeRange === range.id
                    ? { color: '#fff' }
                    : { color: '#333' }
                ]}>
                  {range.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overall Adherence */}
        <View style={medicineStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
            Overall Adherence
          </Text>
          
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: adherenceColor }}>
              {overallAdherenceRate}%
            </Text>
            <Text style={{ fontSize: 16, color: adherenceColor, fontWeight: '600' }}>
              {adherenceStatus}
            </Text>
          </View>
          
          <View style={medicineStyles.progressContainer}>
            <View style={medicineStyles.progressBar}>
              <View style={[
                medicineStyles.progressFill,
                { width: `${overallAdherenceRate}%`, backgroundColor: adherenceColor }
              ]} />
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {renderStatCard(
            'Total Scheduled',
            adherenceData?.totalScheduled || 0,
            '#007AFF'
          )}
          {renderStatCard(
            'Taken',
            adherenceData?.taken || 0,
            '#34C759'
          )}
          {renderStatCard(
            'Skipped',
            adherenceData?.skipped || 0,
            '#FF9500'
          )}
        </View>

        {/* Medication Breakdown */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Medication Breakdown
        </Text>

        {adherenceData?.medications.length === 0 ? (
          <View style={medicineStyles.card}>
            <View style={{ alignItems: 'center', padding: 32 }}>
              <Ionicons name="bar-chart-outline" size={64} color="#ccc" />
              <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginTop: 16 }}>
                No medication data available
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
          adherenceData?.medications.map(renderMedicationCard)
        )}

        {/* Recent Activity */}
        {adherenceData?.logs.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              Recent Activity
            </Text>
            
            {adherenceData.logs.slice(0, 5).map((log, index) => {
              const medication = adherenceData.medications.find(med => med.id === log.medicationId);
              if (!medication) return null;
              
              return (
                <View 
                  key={log.id} 
                  style={[
                    medicineStyles.card, 
                    { marginBottom: 8 }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={log.status === 'taken' ? 'checkmark-circle' : 'close-circle'} 
                      size={20} 
                      color={log.status === 'taken' ? '#34C759' : '#FF9500'} 
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600' }}>
                        {medication.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {new Date(log.scheduledTime).toLocaleDateString()} • {log.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 