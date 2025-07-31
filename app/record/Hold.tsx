import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addHoldRecord, getHoldRecords, HoldRecord } from '../../src/services/holdService';

interface BreathHoldRecord {
  id: string;
  duration: number;
  date: Date;
}

const Hold: React.FC = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [timer, setTimer] = useState(0);
  const [records, setRecords] = useState<BreathHoldRecord[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [lastHoldTime, setLastHoldTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [apiRecords, setApiRecords] = useState<HoldRecord[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lottieRef = useRef<LottieView>(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (isHolding) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHolding]);

  // Pause/resume Lottie animation based on holding state
  useEffect(() => {
    if (lottieRef.current) {
      if (isHolding) {
        lottieRef.current.pause();
      } else {
        lottieRef.current.play();
      }
    }
  }, [isHolding]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startHold = () => {
    setIsHolding(true);
    setTimer(0);
    setShowResult(false);
  };

  const stopHold = async () => {
    if (timer > 0) {
      setIsHolding(false);
      setLastHoldTime(timer);
      setShowResult(true);
      setLoading(true);
      
      try {
        // Save to API
        await addHoldRecord(timer);
        
        // Save the record locally for chart
        const newRecord: BreathHoldRecord = {
          id: Date.now().toString(),
          duration: timer,
          date: new Date(),
        };
        
        setRecords(prev => [...prev, newRecord].slice(-10)); // Keep last 10 records
        setTimer(0);
      } catch (error) {
        console.error('Error saving hold record:', error);
        Alert.alert('Error', 'Failed to save your hold record. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetTimer = () => {
    setIsHolding(false);
    setTimer(0);
    setShowResult(false);
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getHoldRecords();
      setApiRecords(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching hold history:', error);
      Alert.alert('Error', 'Failed to fetch hold history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Chart data preparation
  const chartData = {
    labels: records.length > 0 
      ? records.slice(-7).map((_, index) => `${index + 1}`)
      : ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [
      {
        data: records.length > 0 
          ? records.slice(-7).map(record => record.duration)
          : [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(17, 181, 207, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#1f2937',
    backgroundGradientFrom: '#374151',
    backgroundGradientTo: '#1f2937',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#11B5CF',
    },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <LinearGradient
      colors={[
        '#1B1F23',
        '#2B2F35',
        '#3B3F47',
        '#4B4F59',
        '#5B5F6B'
      ]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 px-6 py-8">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-[#11B5CF] mb-2">Hold your breath!</Text>
            <Text className="text-gray-400 text-sm text-center">
              Practice breath holding to improve your lung capacity
            </Text>
          </View>

          {/* Lottie Animation */}
          <View className="items-center mb-4">
            <LottieView
              ref={lottieRef}
              source={require('../assets/lottie/hold.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>

          {/* Timer Display */}
          <View className="items-center mb-8">
            <Text className="text-6xl font-mono font-bold text-[#11B5CF] mb-4">
              {formatTime(timer)}
            </Text>
            
            {showResult && (
              <View className="bg-black-500/20 px-6 py-3 rounded-lg border border-black-500/30">
                <Text className="text-black text-lg font-semibold text-center">
                  You held your breath for {formatTime(lastHoldTime)}!
                </Text>
              </View>
            )}
          </View>

          {/* Control Buttons */}
          <View className="items-center mb-8">
            {!isHolding ? (
              <TouchableOpacity
                onPress={startHold}
                style={{ backgroundColor: '#11B5CF' }}
                className="px-8 py-4 rounded-full shadow-lg"
                disabled={loading}
              >
                <Text className="text-white text-xl font-semibold">
                  {loading ? 'Saving...' : 'Hold'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="items-center space-y-3">
                <TouchableOpacity
                  onPress={stopHold}
                  className="bg-[#11B5CF] px-6 py-3 rounded-full shadow-lg active:bg-red-700"
                  disabled={loading}
                >
                  <Text className="text-white text-lg font-semibold">
                    {loading ? 'Saving...' : 'Stop'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={resetTimer}
                  className="bg-gray-600 px-6 py-3 rounded-full shadow-lg active:bg-gray-700 mt-2"
                  disabled={loading}
                >
                  <Text className="text-white text-lg font-semibold">Reset</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Chart */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Recent Performance</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 16,
              }}
              yAxisSuffix="s"
            />
          </View>

          {/* View History Button */}
          <TouchableOpacity
            onPress={fetchHistory}
            className="bg-gray-700 py-3 px-6 rounded-lg mb-4"
            disabled={historyLoading}
          >
            <Text className="text-white text-center text-lg font-medium">
              {historyLoading ? 'Loading...' : 'View History'}
            </Text>
          </TouchableOpacity>

          {/* History Section */}
          {showHistory && (
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">Hold History</Text>
              {apiRecords.length > 0 ? (
                <View>
                  {apiRecords.map((record, index) => (
                    <View key={record.id} className={`bg-gray-800/50 p-4 rounded-lg border border-gray-700 ${index > 0 ? 'mt-2' : ''}`}>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-[#11B5CF] text-lg font-semibold">
                          {formatTime(record.duration)}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {formatDate(record.date)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <Text className="text-gray-400 text-center">No hold records found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Hold;