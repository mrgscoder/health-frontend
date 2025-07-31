import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Calendar, TrendingUp, AlertCircle, Check, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from "../../src/config";

interface BloodPressureRecord {
  id: number;
  systolic: number;
  diastolic: number;
  notes: string;
  timestamp: string;
}

const BloodPressureTracker = () => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<BloodPressureRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load blood pressure records from API
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No token available, using sample data');
          // Fallback to sample data if no token
          const sampleData = [
            { id: 1, systolic: 125, diastolic: 82, notes: 'Morning reading', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
            { id: 2, systolic: 135, diastolic: 88, notes: 'After workout', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 3, systolic: 128, diastolic: 78, notes: '', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 4, systolic: 142, diastolic: 92, notes: 'Stressful day', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
          ];
          setRecords(sampleData);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/bp/getbp`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to load blood pressure records:', response.status);
          // Fallback to sample data
          const sampleData = [
            { id: 1, systolic: 125, diastolic: 82, notes: 'Morning reading', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
            { id: 2, systolic: 135, diastolic: 88, notes: 'After workout', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 3, systolic: 128, diastolic: 78, notes: '', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 4, systolic: 142, diastolic: 92, notes: 'Stressful day', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
          ];
          setRecords(sampleData);
          return;
        }

        const data = await response.json();
        const formattedRecords = data.map((record: any) => ({
          id: record.id,
          systolic: record.systolic,
          diastolic: record.diastolic,
          notes: record.notes || '',
          timestamp: record.recorded_at
        }));
        setRecords(formattedRecords);
      } catch (error) {
        console.error('Error loading blood pressure records:', error);
        // Fallback to sample data
        const sampleData = [
          { id: 1, systolic: 125, diastolic: 82, notes: 'Morning reading', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
          { id: 2, systolic: 135, diastolic: 88, notes: 'After workout', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: 3, systolic: 128, diastolic: 78, notes: '', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { id: 4, systolic: 142, diastolic: 92, notes: 'Stressful day', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
        ];
        setRecords(sampleData);
      }
    };

    loadRecords();
  }, []);

  // Blood pressure categorization based on AHA guidelines
  const categorizeBP = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) {
      return { category: 'Hypertensive Crisis', color: 'bg-red-300', textColor: 'text-red-700', urgency: 'URGENT' };
    } else if (sys >= 140 || dia >= 90) {
      return { category: 'High BP Stage 2', color: 'bg-red-200', textColor: 'text-red-600', urgency: 'HIGH' };
    } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      return { category: 'High BP Stage 1', color: 'bg-orange-200', textColor: 'text-orange-600', urgency: 'MODERATE' };
    } else if (sys >= 120 && sys <= 129 && dia < 80) {
      return { category: 'Elevated', color: 'bg-yellow-100', textColor: 'text-yellow-700', urgency: 'WATCH' };
    } else if (sys < 120 && dia < 80) {
      return { category: 'Normal', color: 'bg-green-100', textColor: 'text-green-700', urgency: 'GOOD' };
    } else {
      return { category: 'Check Values', color: 'bg-gray-100', textColor: 'text-gray-600', urgency: 'REVIEW' };
    }
  };

  // Input validation
  const validateInputs = () => {
    const sysValue = parseInt(systolic);
    const diaValue = parseInt(diastolic);

    if (!systolic || !diastolic) {
      Alert.alert('Error', 'Please enter both systolic and diastolic values');
      return false;
    }

    if (isNaN(sysValue) || isNaN(diaValue)) {
      Alert.alert('Error', 'Please enter valid numbers');
            return false;
    }

    if (sysValue < 90 || sysValue > 200) {
      Alert.alert('Error', 'Systolic pressure should be between 90-200 mmHg');
      return false;
    }

    if (diaValue < 60 || diaValue > 130) {
      Alert.alert('Error', 'Diastolic pressure should be between 60-130 mmHg');
      return false;
    }

    if (sysValue <= diaValue) {
      Alert.alert('Error', 'Systolic pressure must be higher than diastolic pressure');
      return false;
    }

    return true;
  };

  // Record blood pressure
  const recordBP = async () => {
    if (!validateInputs()) return;

    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to record blood pressure');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/bp/addbp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          notes: notes.trim() || null
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to record blood pressure:', response.status, errorText);
        console.error('Request URL:', `${BASE_URL}/api/bp/addbp`);
        console.error('Request body:', JSON.stringify({
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          notes: notes.trim() || null
        }));
        Alert.alert('Error', `Failed to record blood pressure (${response.status}). Please try again.`);
        return;
      }

      const savedRecord = await response.json();
      
      const newRecord = {
        id: savedRecord.id,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        notes: notes.trim(),
        timestamp: savedRecord.recorded_at || new Date().toISOString()
      };

      setRecords(prev => [newRecord, ...prev]);
      setSystolic('');
      setDiastolic('');
      setNotes('');
      setShowResults(true);
      
      // Auto-hide results after 5 seconds
      setTimeout(() => setShowResults(false), 5000);
      
      console.log('Blood pressure recorded successfully');
    } catch (error) {
      console.error('Error recording blood pressure:', error);
      Alert.alert('Error', 'Failed to record blood pressure. Please check your connection and try again.');
    }
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch history data
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to view history');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/bp/getbp`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch history:', response.status, errorText);
        Alert.alert('Error', 'Failed to fetch history. Please try again.');
        return;
      }

      const data = await response.json();
      const formattedRecords = data.map((record: any) => ({
        id: record.id,
        systolic: record.systolic,
        diastolic: record.diastolic,
        notes: record.notes || '',
        timestamp: record.recorded_at
      }));
      
      setHistoryRecords(formattedRecords);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Failed to fetch history. Please check your connection and try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Calculate trends
  const calculateTrends = () => {
    if (records.length < 0) return null;
    
    const recent = records.slice(0, 5);
    const avgSystolic = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length;
    const avgDiastolic = recent.reduce((sum, r) => sum + r.diastolic, 0) / recent.length;
    
    return { avgSystolic: Math.round(avgSystolic), avgDiastolic: Math.round(avgDiastolic) };
  };

  // Prepare chart data
  const chartData = records.slice(0, 10).reverse().map((record, index) => ({
    name: `${index + 1}`,
    systolic: record.systolic,
    diastolic: record.diastolic,
    date: new Date(record.timestamp).toLocaleDateString()
  }));

  const trends = calculateTrends();
  const latestReading = records[0];

  return (
    <LinearGradient
      colors={['#e0f7fa', '#c8e6c9']}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-center mt-6 mb-2">
            <Heart className="w-6 h-6 text-red-500 mr-8" />
            <Text className="text-2xl font-bold text-gray-800">Blood Pressure</Text>
          </View>

          {/* Input Form */}
          <View className="m-2 p-6 rounded-2xl">
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Systolic (top number)</Text>
              <TextInput
                className="border border-black rounded-lg p-4 text-lg bg-transparent"
                placeholder="e.g., 120"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Diastolic (bottom number)</Text>
              <TextInput
                className="border border-black rounded-lg p-4 text-lg bg-transparent"
                placeholder="e.g., 80"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 mb-2">Notes (optional)</Text>
              <TextInput
                className="border border-black rounded-lg p-4 text-lg h-20 bg-transparent"
                placeholder="Add any notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              className="bg-black rounded-2xl p-3 items-center"
              onPress={recordBP}
            >
              <Text className="text-white text-lg font-semibold">Record Blood Pressure</Text>
            </TouchableOpacity>
          </View>

          {/* Results Display */}
          {showResults && latestReading && (
            <View className="m-4 p-6 rounded-2xl border border-black">
              <View className="flex-row items-center mb-3">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <Text className="text-lg font-semibold text-gray-800">Reading Recorded Successfully!</Text>
              </View>
              {(() => {
                const result = categorizeBP(latestReading.systolic, latestReading.diastolic);
                return (
                  <View>
                    <Text className="text-gray-600 mb-2">
                      Your blood pressure reading ({latestReading.systolic}/{latestReading.diastolic}) is in the
                    </Text>
                    <View className={`${result.color} rounded-lg p-3 mb-2`}>
                      <Text className="text-white font-bold text-center">{result.category}</Text>
                    </View>
                    <Text className="text-sm text-gray-500 text-center">category</Text>
                  </View>
                );
              })()}
            </View>
          )}



          {/* Chart */}
          {records.length > 0 && (
            <View className="m-4 p-6 rounded-2xl border border-black bg-transparent">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Blood Pressure Trend</Text>
              <View className="items-center">
                              <LineChart
                data={{
                  labels: chartData.map(d => d.date),
                  datasets: [
                    {
                      data: chartData.map(d => d.systolic),
                      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // green
                      strokeWidth: 2,
                    },
                    {
                      data: chartData.map(d => d.diastolic),
                      color: (opacity = 1) => `rgba(17, 181, 207, ${opacity})`, // #11B5CF
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={Dimensions.get('window').width - 48}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: { 
                    borderRadius: 16,
                    backgroundColor: '#ffffff'
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#ffffff',
                  },
                }}
                bezier
                style={{ borderRadius: 16 }}
              />
              </View>
              <View className="flex-row justify-center mt-2">
                <View className="flex-row items-center mr-4">
                  <View className="w-4 h-4 bg-green-500 rounded mr-2"></View>
                  <Text className="text-sm text-gray-600">Systolic</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded mr-2" style={{backgroundColor: '#11B5CF'}}></View>
                  <Text className="text-sm text-gray-600">Diastolic</Text>
                </View>
              </View>
            </View>
          )}



          {/* View History Button */}
          <View className="m-4">
            <TouchableOpacity
              className="bg-black rounded-2xl p-3 items-center"
              onPress={fetchHistory}
              disabled={loadingHistory}
            >
              <Text className="text-white text-lg font-semibold">
                {loadingHistory ? 'Loading...' : 'View History'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* History Records */}
          {showHistory && (
            <View className="m-4 p-6 rounded-2xl border border-black mb-8">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Complete History</Text>
              {historyRecords.length === 0 ? (
                <View className="items-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                  <Text className="text-gray-400">No history records found</Text>
                </View>
              ) : (
                historyRecords.map((record) => {
                  const result = categorizeBP(record.systolic, record.diastolic);
                  return (
                    <View key={record.id} className="border-b border-gray-100 py-4 last:border-b-0">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-gray-800">
                            {record.systolic}/{record.diastolic} mmHg
                          </Text>
                          <Text className="text-sm text-gray-500">{formatDate(record.timestamp)}</Text>
                        </View>
                        <View className={`${result.color} rounded-full px-3 py-1`}>
                          <Text className="text-black text-xs font-semibold">{result.category}</Text>
                        </View>
                      </View>
                      {record.notes && (
                        <View className="bg-gray-50 rounded-lg p-3 mt-2">
                          <Text className="text-gray-600 text-sm">{record.notes}</Text>
                        </View>
                      )}
                      <View className="flex-row items-center mt-2">
                        {result.urgency === 'URGENT' && <AlertCircle className="w-4 h-4 text-red-500 mr-1" />}
                        <Text className={`text-xs ${result.textColor}`}>
                          {result.urgency === 'URGENT' && 'Seek immediate medical attention'}
                          {result.urgency === 'HIGH' && 'Consult your healthcare provider'}
                          {result.urgency === 'MODERATE' && 'Monitor closely'}
                          {result.urgency === 'WATCH' && 'Continue healthy lifestyle'}
                          {result.urgency === 'GOOD' && 'Keep up the good work'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BloodPressureTracker;