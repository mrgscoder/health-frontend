// HeartRateTracker.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.16:5001/api/heart'; // Updated API URL
const USER_ID = 1; // Default user ID

// Define the type for heart rate records
interface HeartRateRecord {
  id: number;
  rate: number;
  notes: string | null;
  date_time: string;
}

const HeartRateTracker = () => {
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<HeartRateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addingRecord, setAddingRecord] = useState(false);
  
  useEffect(() => {
    fetchHeartRateRecords();
  }, []);

  const fetchHeartRateRecords = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.error('No token available for fetching heart rate records');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/gethr`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRecords(data.records || data || []);
      } else {
        console.error('Failed to fetch heart rate records:', data.error);
        Alert.alert('Error', data.error || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Fetch heart rate records error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addHeartRate = async () => {
    if (!heartRate.trim()) {
      Alert.alert('Error', 'Please enter a heart rate value');
      return;
    }

    const rateValue = parseInt(heartRate);
    if (isNaN(rateValue) || rateValue < 30 || rateValue > 250) {
      Alert.alert('Error', 'Please enter a valid heart rate (30-250 BPM)');
      return;
    }

    try {
      setLoading(true);
      setAddingRecord(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please log in to record heart rate');
        setLoading(false);
        setAddingRecord(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/addhr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rate: rateValue,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data); // Debug log

      if (response.ok) {
        Alert.alert('Success', 'Heart rate recorded successfully!');
        setHeartRate('');
        setNotes('');
        
        // Add the new record to the frontend immediately
        const newRecord: HeartRateRecord = {
          id: data.id || data.record?.id || Date.now(), // Try multiple possible ID locations
          rate: rateValue,
          notes: notes.trim() || null,
          date_time: data.date_time || data.record?.date_time || new Date().toISOString(),
        };
        
        console.log('Adding new record to frontend:', newRecord); // Debug log
        
        // Add the new record to the beginning of the list
        setRecords(prevRecords => {
          const updatedRecords = [newRecord, ...prevRecords];
          console.log('Updated records count:', updatedRecords.length); // Debug log
          return updatedRecords;
        });
        
        // Also fetch from backend to ensure consistency
        setTimeout(() => {
          fetchHeartRateRecords();
        }, 500);
      } else {
        console.error('Failed to record heart rate:', data.error);
        Alert.alert('Error', data.error || 'Failed to record heart rate');
      }
    } catch (error) {
      console.error('Add heart rate error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setAddingRecord(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHeartRateRecords();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getHeartRateStatus = (rate: number) => {
    if (rate < 60) return { status: 'Low', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate <= 100) return { status: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate <= 150) return { status: 'Elevated', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Prepare chart data
  const getChartData = () => {
    if (records.length === 0) return null;

    const last7Records = records.slice(0, 7).reverse();
    const labels = last7Records.map((record, index) => {
      const date = new Date(record.date_time);
      return date.getDate() + '/' + (date.getMonth() + 1);
    });
    
    const data = last7Records.map(record => record.rate);

    return {
      labels,
      datasets: [{
        data,
        strokeWidth: 3,
      }]
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red color for heart rate
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const screenWidth = Dimensions.get('window').width;
  const chartData = getChartData();

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4">
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-800 mb-6 text-center">
          ❤️ Heart Rate Tracker
        </Text>

        {/* Add Heart Rate Form */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Record New Reading</Text>
          
          <View className="mb-4">
            <Text className="text-gray-600 mb-2 font-medium">Heart Rate (BPM)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
              placeholder="Enter heart rate (e.g., 75)"
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-600 mb-2 font-medium">Notes (Optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base h-20"
              placeholder="Add any notes about your reading..."
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            className={`rounded-lg py-4 ${loading ? 'bg-gray-400' : 'bg-red-500'}`}
            onPress={addHeartRate}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? '⏳ Recording...' : '📊 Record Heart Rate'}
            </Text>
          </TouchableOpacity>
          
          {addingRecord && (
            <View className="mt-3 p-3 bg-green-100 rounded-lg">
              <Text className="text-green-700 text-center font-medium">
                ✅ Record added! Refreshing data...
              </Text>
            </View>
          )}

          {/* View History Button */}
          <TouchableOpacity
            className="bg-blue-500 rounded-lg py-4 mt-3"
            onPress={fetchHeartRateRecords}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              📋 View History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        {chartData && (
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-semibold text-gray-800 mb-4">📈 Recent Trends</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              decorator={() => {
                return null;
              }}
            />
            <Text className="text-gray-500 text-center mt-2">Last 7 readings</Text>
          </View>
        )}

        {/* Statistics */}
        {records.length > 0 && (
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-semibold text-gray-800 mb-4">📊 Quick Stats</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-red-500">
                  {records.length > 0 ? records[0].rate : '--'}
                </Text>
                <Text className="text-gray-600">Latest</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-500">
                  {records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.rate, 0) / records.length) : '--'}
                </Text>
                <Text className="text-gray-600">Average</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-500">
                  {records.length}
                </Text>
                <Text className="text-gray-600">Total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Records List */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            📋 Recent Records ({records.length})
          </Text>

          {loading && records.length === 0 ? (
            <View className="py-8">
              <Text className="text-center text-gray-500">Loading records...</Text>
            </View>
          ) : records.length === 0 ? (
            <View className="py-8">
              <Text className="text-center text-gray-500">No records found</Text>
              <Text className="text-center text-gray-400 mt-2">Add your first heart rate reading above</Text>
            </View>
          ) : (
            <View>
              {records.map((record) => {
                const status = getHeartRateStatus(record.rate);
                return (
                  <View 
                    key={record.id} 
                    className="flex-row items-center justify-between py-4 border-b border-gray-100"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-2xl font-bold text-gray-800 mr-3">
                          {record.rate}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${status.bg}`}>
                          <Text className={`text-xs font-medium ${status.color}`}>
                            {status.status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-500 text-sm">
                        {formatDate(record.date_time)}
                      </Text>
                      {record.notes && (
                        <Text className="text-gray-600 text-sm mt-1 italic">
                          "{record.notes}"
                        </Text>
                      )}
                    </View>
                    <Text className="text-gray-400 text-lg">❤️</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HeartRateTracker;