
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Calendar, TrendingUp, AlertCircle, Check, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../../src/config';

interface SugarRecord {
  id: number;
  glucose_level: number;
  notes: string;
  timestamp: string;
}

export default function AddSugarReading() {
  const [glucose, setGlucose] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<SugarRecord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<SugarRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load sugar records from API
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No token available, using sample data');
          // Fallback to sample data if no token
          const sampleData = [
            { id: 1, glucose_level: 120, notes: 'Morning reading', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
            { id: 2, glucose_level: 135, notes: 'After meal', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 3, glucose_level: 128, notes: '', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 4, glucose_level: 142, notes: 'Stressful day', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
          ];
          setRecords(sampleData);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/sugar/getsugar`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to load sugar records:', response.status);
          // Fallback to sample data
          const sampleData = [
            { id: 1, glucose_level: 120, notes: 'Morning reading', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
            { id: 2, glucose_level: 135, notes: 'After meal', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 3, glucose_level: 128, notes: '', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 4, glucose_level: 142, notes: 'Stressful day', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
          ];
          setRecords(sampleData);
          return;
        }

        const data = await response.json();
        const formattedRecords = data.map((record: any) => ({
          id: record.id,
          glucose_level: record.glucose_level,
          notes: record.notes || '',
          timestamp: record.recorded_at
        }));
        setRecords(formattedRecords);
      } catch (error) {
        console.error('Error loading sugar records:', error);
        // Fallback to sample data
        const sampleData = [
          { id: 1, glucose_level: 120, notes: 'Morning reading', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
          { id: 2, glucose_level: 135, notes: 'After meal', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: 3, glucose_level: 128, notes: '', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { id: 4, glucose_level: 142, notes: 'Stressful day', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
        ];
        setRecords(sampleData);
      }
    };

    loadRecords();
  }, []);

  // Blood sugar categorization
  const categorizeSugar = (level: number) => {
    if (level < 70) {
      return { category: 'Low Blood Sugar', color: 'bg-red-300', textColor: 'text-red-700', urgency: 'URGENT' };
    } else if (level >= 70 && level <= 99) {
      return { category: 'Normal (Fasting)', color: 'bg-green-100', textColor: 'text-green-700', urgency: 'GOOD' };
    } else if (level >= 100 && level <= 125) {
      return { category: 'Prediabetes', color: 'bg-yellow-100', textColor: 'text-yellow-700', urgency: 'WATCH' };
    } else if (level >= 126) {
      return { category: 'Diabetes', color: 'bg-red-200', textColor: 'text-red-600', urgency: 'HIGH' };
    } else {
      return { category: 'Check Values', color: 'bg-gray-100', textColor: 'text-gray-600', urgency: 'REVIEW' };
    }
  };

  // Input validation
  const validateInputs = () => {
    const glucoseValue = parseInt(glucose);

    if (!glucose) {
      Alert.alert('Error', 'Please enter a glucose level');
      return false;
    }

    if (isNaN(glucoseValue)) {
      Alert.alert('Error', 'Please enter a valid number');
      return false;
    }

    if (glucoseValue < 40 || glucoseValue > 400) {
      Alert.alert('Error', 'Glucose level should be between 40-400 mg/dL');
      return false;
    }

    return true;
  };

  // Record blood sugar
  const recordSugar = async () => {
    if (!validateInputs()) return;

    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to record blood sugar');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/sugar/addsugar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          glucose_level: parseInt(glucose),
          notes: notes.trim() || null
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to record blood sugar:', response.status, errorText);
        Alert.alert('Error', `Failed to record blood sugar (${response.status}). Please try again.`);
        return;
      }

      const savedRecord = await response.json();
      
      const newRecord = {
        id: savedRecord.id,
        glucose_level: parseInt(glucose),
        notes: notes.trim(),
        timestamp: savedRecord.recorded_at || new Date().toISOString()
      };

      setRecords(prev => [newRecord, ...prev]);
      setGlucose('');
      setNotes('');
      setShowResults(true);
      
      // Auto-hide results after 5 seconds
      setTimeout(() => setShowResults(false), 5000);
      
      console.log('Blood sugar recorded successfully');
    } catch (error) {
      console.error('Error recording blood sugar:', error);
      Alert.alert('Error', 'Failed to record blood sugar. Please check your connection and try again.');
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

      const response = await fetch(`${BASE_URL}/api/sugar/getsugar`, {
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
        glucose_level: record.glucose_level,
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
    if (records.length < 1) return null;
    
    const recent = records.slice(0, 5);
    const avgGlucose = recent.reduce((sum, r) => sum + r.glucose_level, 0) / recent.length;
    
    return { avgGlucose: Math.round(avgGlucose) };
  };

  // Prepare chart data
  const chartData = records.slice(0, 10).reverse().map((record, index) => ({
    name: `${index + 1}`,
    glucose: record.glucose_level,
    date: new Date(record.timestamp).toLocaleDateString()
  }));

  const trends = calculateTrends();
  const latestReading = records[0];

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
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 py-6">
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Blood Sugar Tracker
            </Text>
            <Text className="text-white/80 text-center text-sm">
              Monitor your glucose levels and track your health
            </Text>
          </View>

          {/* Input Section */}
          <View className="px-6 mb-6">
            <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Text className="text-xl font-semibold text-white mb-4 text-center">
                Add New Reading
              </Text>
              
              <View className="mb-4">
                <Text className="text-white/90 text-base font-medium mb-2">Glucose Level (mg/dL)</Text>
                <TextInput
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-white text-lg"
                  value={glucose}
                  onChangeText={setGlucose}
                  placeholder="Enter glucose level"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-6">
                <Text className="text-white/90 text-base font-medium mb-2">Notes (Optional)</Text>
                <TextInput
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-white text-base"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes about your reading..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={recordSugar}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 items-center"
              >
                <Text className="text-white font-semibold text-lg">Record Reading</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results Section */}
          {showResults && (
            <View className="px-6 mb-6">
              <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Text className="text-xl font-semibold text-white mb-4 text-center">
                  Reading Results
                </Text>
                <View className="items-center mb-4">
                  <Text className="text-4xl font-bold text-white mb-2">{glucose}</Text>
                  <Text className="text-white/80 text-lg">mg/dL</Text>
                </View>
                <View className={`rounded-xl p-4 mb-4 ${categorizeSugar(parseInt(glucose)).color}`}>
                  <Text className={`text-center font-semibold text-lg ${categorizeSugar(parseInt(glucose)).textColor}`}>
                    {categorizeSugar(parseInt(glucose)).category}
                  </Text>
                  <Text className={`text-center font-medium ${categorizeSugar(parseInt(glucose)).textColor}`}>
                    {categorizeSugar(parseInt(glucose)).urgency}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Chart Section */}
          {records.length > 0 && (
            <View className="px-6 mb-6">
              <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Text className="text-xl font-semibold text-white mb-4 text-center">
                  Recent Trends
                </Text>
                <LineChart
                  data={{
                    labels: records.slice(-7).map((_, index) => `Day ${index + 1}`),
                    datasets: [{
                      data: records.slice(-7).map(record => record.glucose_level)
                    }]
                  }}
                  width={Dimensions.get('window').width - 60}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#ffffff'
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              </View>
            </View>
          )}

          {/* History Section */}
          <View className="px-6 mb-6">
            <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-white">Recent Readings</Text>
                <TouchableOpacity
                  onPress={fetchHistory}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"
                >
                  <Text className="text-white font-medium">View All</Text>
                </TouchableOpacity>
              </View>
              
              {records.slice(0, 5).map((record, index) => (
                <View key={record.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white font-semibold text-lg">{record.glucose_level} mg/dL</Text>
                      <Text className="text-white/70 text-sm">{formatDate(record.timestamp)}</Text>
                      {record.notes && (
                        <Text className="text-white/60 text-sm mt-1">{record.notes}</Text>
                      )}
                    </View>
                    <View className={`rounded-full px-3 py-1 ${categorizeSugar(record.glucose_level).color}`}>
                      <Text className={`text-xs font-medium ${categorizeSugar(record.glucose_level).textColor}`}>
                        {categorizeSugar(record.glucose_level).urgency}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
