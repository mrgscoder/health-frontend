import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Calendar, TrendingUp, AlertCircle, Check, Wind } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from "../../src/config";

interface RespiratoryRateRecord {
  id: number;
  respiratoryRate: number;
  notes: string;
  timestamp: string;
}

const RespiratoryRateTracker = () => {
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<RespiratoryRateRecord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Monitor records state changes
  useEffect(() => {
    console.log('Records state changed:', records.length, 'records');
  }, [records]);

  // Load respiratory rate records from backend
  useEffect(() => {
    fetchRespiratoryRateRecords();
  }, []);

  // Fetch respiratory rate records from backend
  const fetchRespiratoryRateRecords = async () => {
    try {
      console.log('🔍 Fetching respiratory rate records from database...');
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('❌ No token available for fetching respiratory rate records - user may not be logged in');
        Alert.alert('Authentication Required', 'Please log in to view your respiratory rate history.');
        return;
      }

      console.log('�� Making API call to:', `${BASE_URL}/api/resp/getrespiratory`);
      const response = await fetch(`${BASE_URL}/api/resp/getrespiratory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📊 API Response status:', response.status);
      const data = await response.json();
      console.log('📋 API Response data:', data);
      
      if (response.ok) {
        console.log('✅ Successfully fetched respiratory rate records from database');
        setRecords(data || []);
        setShowHistory(true);
        if (data && data.length > 0) {
          console.log(`📈 Found ${data.length} respiratory rate records in database`);
        } else {
          console.log('📭 No respiratory rate records found in database');
        }
      } else {
        console.error('❌ Failed to fetch respiratory rate records:', data.error);
        Alert.alert('Error', `Failed to fetch records: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Fetch respiratory rate records error:', error);
      Alert.alert('Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  // Respiratory rate categorization based on medical guidelines
  const categorizeRespiratoryRate = (rate: number) => {
    if (rate < 12) {
      return { category: 'Bradypnea', color: 'bg-[#00b8f1]', textColor: 'text-[#00b8f1]', urgency: 'CONCERN' };
    } else if (rate >= 12 && rate <= 20) {
      return { category: 'Normal', color: 'bg-green-500', textColor: 'text-green-500', urgency: 'GOOD' };
    } else if (rate > 20 && rate <= 24) {
      return { category: 'Mild Tachypnea', color: 'bg-yellow-500', textColor: 'text-yellow-600', urgency: 'WATCH' };
    } else if (rate > 24 && rate <= 30) {
      return { category: 'Moderate Tachypnea', color: 'bg-orange-500', textColor: 'text-orange-500', urgency: 'CONCERN' };
    } else {
      return { category: 'Severe Tachypnea', color: 'bg-red-600', textColor: 'text-red-600', urgency: 'URGENT' };
    }
  };

  // Input validation
  const validateInputs = () => {
    const rateValue = parseInt(respiratoryRate);

    if (!respiratoryRate) {
      Alert.alert('Error', 'Please enter respiratory rate');
      return false;
    }

    if (isNaN(rateValue)) {
      Alert.alert('Error', 'Please enter a valid respiratory rate number');
      return false;
    }

    if (rateValue < 6 || rateValue > 60) {
      Alert.alert('Error', 'Respiratory rate should be between 6-60 breaths per minute');
      return false;
    }

    return true;
  };

  // Record respiratory rate
  const recordRespiratoryRate = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to record respiratory rate');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/resp/addrespiratory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          respiratoryRate: parseInt(respiratoryRate),
          notes: notes.trim() || null
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to record respiratory rate:', response.status, errorText);
        Alert.alert('Error', 'Failed to record respiratory rate. Please try again.');
        return;
      }

      const savedRecord = await response.json();
      console.log('API Response:', savedRecord);
      
      const newRecord = {
        id: savedRecord.id || Date.now(),
        respiratoryRate: parseInt(respiratoryRate),
        notes: notes.trim(),
        timestamp: new Date().toISOString()
      };

      // Refresh records from backend to get the latest data
      await fetchRespiratoryRateRecords();
      setRespiratoryRate('');
      setNotes('');
      setShowResults(true);
      
      // Auto-hide results after 5 seconds
      setTimeout(() => setShowResults(false), 5000);
      
      console.log('Respiratory rate recorded successfully');
    } catch (error) {
      console.error('Error recording respiratory rate:', error);
      Alert.alert('Error', 'Failed to record respiratory rate. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate trends
  const calculateTrends = () => {
    if (records.length < 1) return null;
    
    const recent = records.slice(0, 5);
    const avgRate = recent.reduce((sum, r) => sum + r.respiratoryRate, 0) / recent.length;
    
    return { 
      avgRate: Math.round(avgRate * 10) / 10
    };
  };

  // Prepare chart data
  const chartData = records.slice(0, 10).reverse().map((record, index) => ({
    name: `${index + 1}`,
    rate: record.respiratoryRate,
    date: new Date(record.timestamp).toLocaleDateString()
  }));

  const trends = calculateTrends();
  const latestReading = records[0];

  return (
    <LinearGradient
      colors={['#f0f9ff', '#e0ecff']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header */}
          <View className="flex-row items-center justify-center mt-6 mb-2">
            <Wind className="w-6 h-6 text-[#00b8f1] mr-8" />
            <Text className="text-2xl font-bold text-gray-800">Respiratory Rate</Text>
          </View>

          {/* Input Form */}
          <View className="m-2 p-6 rounded-2xl">
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Respiratory Rate (breaths per minute)</Text>
              <TextInput
                className="border border-black rounded-lg p-4 text-lg bg-transparent"
                placeholder="e.g., 16"
                value={respiratoryRate}
                onChangeText={setRespiratoryRate}
                keyboardType="numeric"
                maxLength={2}
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
              className={`rounded-2xl p-3 items-center ${loading ? 'bg-gray-400' : 'bg-black'}`}
              onPress={recordRespiratoryRate}
              disabled={loading}
            >
              <Text className="text-white text-lg font-semibold">
                {loading ? 'Recording...' : 'Record Respiratory Rate'}
              </Text>
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
                const result = categorizeRespiratoryRate(latestReading.respiratoryRate);
                return (
                  <View>
                    <Text className="text-gray-600 mb-2">
                      Your respiratory rate ({latestReading.respiratoryRate} breaths/min) is
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
          <View className="m-4 p-6 rounded-2xl border border-black bg-transparent">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Respiratory Rate Trend</Text>
            <View className="items-center">
              {records.length > 0 ? (
                <LineChart
                  data={{
                    labels: chartData.map(d => d.date.split('/')[1] + '/' + d.date.split('/')[0]),
                    datasets: [
                      {
                        data: chartData.map(d => d.rate),
                        color: (opacity = 1) => `rgba(0, 184, 241, ${opacity})`, // #00b8f1
                        strokeWidth: 3,
                      }
                    ],
                    legend: ['Respiratory Rate (breaths/min)'],
                  }}
                  width={Dimensions.get('window').width - 48}
                  height={220}
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
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
              ) : (
                <View className="items-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mb-2" />
                  <Text className="text-gray-400">No data available</Text>
                  <Text className="text-gray-400 text-sm">Record your first reading to see the trend</Text>
                </View>
              )}
            </View>
            {records.length > 0 && (
              <View className="flex-row justify-center mt-2">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 bg-[#00b8f1] rounded mr-2"></View>
                  <Text className="text-sm text-gray-600">Respiratory Rate</Text>
                </View>
              </View>
            )}
          </View>



          {/* View History Button */}
          <View className="m-4">
            <TouchableOpacity
              className="bg-black rounded-2xl p-3 items-center"
              onPress={fetchRespiratoryRateRecords}
            >
              <View className="flex-row items-center">
                <Calendar className="w-5 h-5 text-white mr-2" />
                <Text className="text-white text-lg font-semibold">View History</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* History Records Display */}
          {showHistory && records.length > 0 && (
            <View className="m-4 p-6 rounded-2xl border border-black bg-transparent mb-8">
              <Text className="text-lg font-semibold text-gray-800 mb-4">History Records</Text>
              {records.map((record) => {
                const result = categorizeRespiratoryRate(record.respiratoryRate);
                return (
                  <View key={record.id} className="border-b border-gray-100 py-4 last:border-b-0">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-800">
                          {record.respiratoryRate} breaths/min
                        </Text>
                        <Text className="text-sm text-gray-500">{formatDate(record.timestamp)}</Text>
                      </View>
                      <View className={`${result.color} rounded-full px-3 py-1`}>
                        <Text className="text-white text-xs font-semibold">{result.category}</Text>
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
                        {result.urgency === 'CONCERN' && 'Consult your healthcare provider'}
                        {result.urgency === 'WATCH' && 'Monitor closely'}
                        {result.urgency === 'GOOD' && 'Normal respiratory rate'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RespiratoryRateTracker;