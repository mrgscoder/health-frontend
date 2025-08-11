import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Target,
  Calendar,
  Clock
} from 'lucide-react-native';
import BASE_URL from '../../src/config';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  cardioByDate: Array<{
    date: string;
    total_sets: number;
    exercises: Record<string, number>;
  }>;
  breathHoldRecords: Array<{
    date: string;
    duration: number;
    moving_avg: number;
  }>;
  correlationData: Array<{
    date: string;
    cardio_sets: number;
    cardio_variety: number;
    avg_breath_hold: number;
    max_breath_hold: number;
  }>;
  stats: {
    total_cardio_sets: number;
    unique_exercises: number;
    avg_breath_hold: number;
    max_breath_hold: number;
    total_breath_records: number;
  };
  correlation: {
    coefficient: number;
    strength: string;
    direction: string;
  };
}

interface Exercise {
  exercise: string;
  total_sets: number;
  days_performed: number;
  first_performed: string;
  last_performed: string;
}

const CardioBreathHoldAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(30);
  const [activeTab, setActiveTab] = useState<'overview' | 'correlation' | 'exercises'>('overview');
  
  // Replace with actual user ID
  const userId = 1;
  const API_BASE_URL = `${BASE_URL}/api`;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }
      
      console.log('🔍 Making API requests to:', {
        analyticsUrl: `${API_BASE_URL}/analytics/getanalytics?timeframe=${timeframe}`,
        exercisesUrl: `${API_BASE_URL}/analytics/exercises?timeframe=${timeframe}`,
        token: token ? 'Present' : 'Missing'
      });

      // Test server connectivity first
      try {
        const healthCheck = await fetch(`${BASE_URL}/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        console.log('🔍 Server health check:', healthCheck.status, healthCheck.ok);
      } catch (healthError) {
        console.error('🔍 Server health check failed:', healthError);
      }

      const [analyticsRes, exercisesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/getanalytics?timeframe=${timeframe}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/analytics/exercises?timeframe=${timeframe}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);

      console.log('🔍 API responses:', {
        analyticsStatus: analyticsRes.status,
        exercisesStatus: exercisesRes.status,
        analyticsOk: analyticsRes.ok,
        exercisesOk: exercisesRes.ok
      });

      if (!analyticsRes.ok) {
        const errorText = await analyticsRes.text();
        console.error('🔍 Analytics API error:', errorText);
        throw new Error(`Analytics API failed: ${analyticsRes.status} - ${errorText}`);
      }

      if (!exercisesRes.ok) {
        const errorText = await exercisesRes.text();
        console.error('🔍 Exercises API error:', errorText);
        throw new Error(`Exercises API failed: ${exercisesRes.status} - ${errorText}`);
      }

      const analyticsData = await analyticsRes.json();
      const exercisesData = await exercisesRes.json();

      if (analyticsData.success) {
        setData(analyticsData.data);
      }
      
      if (exercisesData.success) {
        setExercises(exercisesData.data);
      }
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        url: `${API_BASE_URL}/analytics/getanalytics?timeframe=${timeframe}`
      });
      Alert.alert('Error', `Failed to fetch analytics data: ${error?.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const getCorrelationColor = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs > 0.7) return '#10B981'; // Strong - Green
    if (abs > 0.3) return '#F59E0B'; // Moderate - Orange  
    return '#EF4444'; // Weak - Red
  };

  const renderOverview = () => {
    if (!data) return null;

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
    };

    // Prepare breath hold chart data
    const breathHoldData = {
      labels: data.breathHoldRecords.slice(0, 7).reverse().map(r => 
        new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: data.breathHoldRecords.slice(0, 7).reverse().map(r => r.duration),
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2
      }]
    };

    // Prepare cardio volume chart data
    const cardioData = {
      labels: data.cardioByDate.slice(0, 7).reverse().map(r => 
        new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: data.cardioByDate.slice(0, 7).reverse().map(r => r.total_sets),
      }]
    };

    return (
      <ScrollView className="flex-1 p-4">
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-transparent border border-black rounded-2xl p-4 flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-1">Total Cardio Sets</Text>
            <Text className="text-2xl font-bold text-blue-600">{data.stats.total_cardio_sets}</Text>
          </View>
          <View className="bg-transparent border border-black rounded-2xl p-4 flex-1 ml-2">
            <Text className="text-gray-600 text-sm mb-1">Avg Breath Hold</Text>
            <Text className="text-2xl font-bold text-green-600">{Math.round(data.stats.avg_breath_hold)}s</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="bg-transparent border border-black rounded-2xl p-4 flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-1">Unique Exercises</Text>
            <Text className="text-2xl font-bold text-purple-600">{data.stats.unique_exercises}</Text>
          </View>
          <View className="bg-transparent border border-black rounded-2xl p-4 flex-1 ml-2">
            <Text className="text-gray-600 text-sm mb-1">Max Breath Hold</Text>
            <Text className="text-2xl font-bold text-orange-600">{Math.round(data.stats.max_breath_hold)}s</Text>
          </View>
        </View>

        {/* Breath Hold Trend */}
        <View className="bg-transparent border border-black rounded-2xl p-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Breath Hold Progress</Text>
          {breathHoldData.labels.length > 0 ? (
            <LineChart
              data={breathHoldData}
              width={screenWidth - 80}
              height={200}
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
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#ffffff',
                },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text className="text-gray-500 text-center py-8">No breath hold data available</Text>
          )}
        </View>

        {/* Cardio Volume */}
        <View className="bg-transparent border border-black rounded-2xl p-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Cardio Volume</Text>
          {cardioData.labels.length > 0 ? (
            <BarChart
              data={cardioData}
              width={screenWidth - 80}
              height={200}
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
              }}
              style={{ borderRadius: 16 }}
              yAxisSuffix=" sets"
              yAxisLabel=""
            />
          ) : (
            <Text className="text-gray-500 text-center py-8">No cardio data available</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderCorrelation = () => {
    if (!data) return null;

    const correlationData = data.correlationData.slice(0, 10).reverse();
    
    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
      strokeWidth: 2,
    };

    const scatterData = {
      labels: correlationData.map(r => 
        new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          data: correlationData.map(r => r.cardio_sets),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: correlationData.map(r => r.avg_breath_hold / 10), // Scale down for visualization
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Cardio Sets', 'Breath Hold (÷10)']
    };

    return (
      <ScrollView className="flex-1 p-4">
        {/* Correlation Summary */}
        <View className="bg-transparent border border-black rounded-2xl p-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Performance Correlation</Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-600">Correlation Strength:</Text>
            <View className="flex-row items-center">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getCorrelationColor(data.correlation.coefficient) }}
              />
              <Text className="font-semibold">{data.correlation.strength}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-600">Direction:</Text>
            <Text className="font-semibold">{data.correlation.direction}</Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Coefficient:</Text>
            <Text className="font-semibold">{data.correlation.coefficient.toFixed(3)}</Text>
          </View>
          
          <Text className="text-sm text-gray-500 mt-4">
            {data.correlation.coefficient > 0.3 
              ? "Your cardio training appears to positively impact breath hold performance!"
              : data.correlation.coefficient < -0.3
              ? "Interesting! Higher cardio volume might be affecting breath hold performance."
              : "No strong correlation detected between cardio volume and breath hold performance."}
          </Text>
        </View>

        {/* Dual Line Chart */}
        <View className="bg-transparent border border-black rounded-2xl p-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Cardio vs Breath Hold Trend</Text>
          {correlationData.length > 0 ? (
            <LineChart
              data={scatterData}
              width={screenWidth - 80}
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
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#ffffff',
                },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Text className="text-gray-500 text-center py-8">No correlation data available</Text>
          )}
          <Text className="text-xs text-gray-500 mt-2 text-center">
            Blue: Cardio Sets | Green: Breath Hold Duration (scaled)
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderExercises = () => {
    return (
      <ScrollView className="flex-1 p-4">
        <Text className="text-xl font-bold text-gray-800 mb-6">Exercise Breakdown</Text>
        
        {exercises.map((exercise, index) => (
          <View key={index} className="bg-transparent border border-black rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold text-gray-800 flex-1">{exercise.exercise}</Text>
              <Text className="text-2xl font-bold text-blue-600">{exercise.total_sets}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Days Performed:</Text>
              <Text className="font-medium">{exercise.days_performed}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Avg Sets/Day:</Text>
              <Text className="font-medium">
                {(exercise.total_sets / exercise.days_performed).toFixed(1)}
              </Text>
            </View>
          </View>
        ))}
        
        {exercises.length === 0 && (
          <Text className="text-gray-500 text-center py-8">No exercise data available</Text>
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#E6E6FA', '#D8BFD8']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-4">Loading analytics...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="p-4">
          <View className="flex-row items-center justify-center mt-6 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-500 mr-8" />
            <Text className="text-2xl font-bold text-gray-800">
              Fitness Analytics
            </Text>
          </View>
          
          {/* Timeframe Selector */}
          <View className="bg-transparent border border-black rounded-2xl p-1 mb-4">
            <View className="flex-row">
              {[7, 30, 90].map((days) => (
                <TouchableOpacity
                  key={days}
                  onPress={() => setTimeframe(days)}
                  className={`flex-1 py-3 px-4 rounded-xl ${
                    timeframe === days ? 'bg-black' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    timeframe === days ? 'text-white' : 'text-gray-800'
                  }`}>
                    {days}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Navigation */}
          <View className="bg-transparent border border-black rounded-2xl p-1 mb-4">
            <View className="flex-row">
              {[
                { key: 'overview', label: 'Overview', icon: Activity },
                { key: 'correlation', label: 'Correlation', icon: TrendingUp },
                { key: 'exercises', label: 'Exercises', icon: Target }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center ${
                    activeTab === tab.key ? 'bg-black' : 'bg-transparent'
                  }`}
                >
                  <tab.icon 
                    size={16} 
                    color={activeTab === tab.key ? '#ffffff' : '#374151'} 
                    className="mr-2"
                  />
                  <Text className={`text-sm font-medium ${
                    activeTab === tab.key ? 'text-white' : 'text-gray-800'
                  }`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'correlation' && renderCorrelation()}
        {activeTab === 'exercises' && renderExercises()}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CardioBreathHoldAnalytics;