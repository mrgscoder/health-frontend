// createhistory.js — View sleep history with chart and score suggestions
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from "../../src/config";

const screenWidth = Dimensions.get('window').width;
const API_BASE_URL = `${BASE_URL}/api/auth`; // Updated API URL

export default function CreateHistory() {
  const [sleepHistory, setSleepHistory] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeeklySummary = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'Please log in to view sleep history');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/weekly-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Weekly summary response:', data);

      if (response.ok) {
        setWeeklyData(data);
        // Also update local history for backward compatibility
        setSleepHistory(data);
      } else {
        console.error('Failed to fetch weekly summary:', data.error);
        Alert.alert('Error', data.error || 'Failed to fetch sleep history');
      }
    } catch (error) {
      console.error('Fetch weekly summary error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeeklySummary();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadHistory = async () => {
      // First try to load from API
      await fetchWeeklySummary();
      
      // Fallback to local storage if API fails
      const stored = await AsyncStorage.getItem('sleepLogs');
      if (stored && weeklyData.length === 0) {
        setSleepHistory(JSON.parse(stored));
      }
    };
    loadHistory();
  }, []);

  const getDurationInHours = (start: string, end: string): number => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return isNaN(diff) ? 0 : parseFloat(diff.toFixed(1));
  };

  const getScore = (hours: number): number => {
    if (hours >= 8) return 90;
    if (hours >= 7) return 80;
    if (hours >= 6) return 70;
    return 60;
  };

  const getSuggestion = (score: number): string => {
    if (score >= 90) return 'Perfect sleep! Keep it up.';
    if (score >= 80) return 'You\'re doing well. Aim for 8 hrs.';
    if (score >= 70) return 'Try sleeping earlier.';
    return 'You need more rest.';
  };

  // Use weekly data for chart if available, otherwise fall back to local history
  const chartData = weeklyData.length > 0 ? weeklyData : sleepHistory;
  
  const data = {
    labels: chartData.map((entry, idx) => {
      if (entry.sleep_date && entry.sleep_date !== 'Invalid Date') {
        // For API data with sleep_date
        const date = new Date(entry.sleep_date);
        if (!isNaN(date.getTime())) {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
      }
      // For local storage data or invalid dates
      return `Day ${idx + 1}`;
    }),
    datasets: [
      {
        data: chartData.map(entry => {
          if (entry.duration_minutes && typeof entry.duration_minutes === 'number') {
            // For API data with duration_minutes
            return parseFloat((entry.duration_minutes / 60).toFixed(1));
          } else if (entry.start && entry.end) {
            // For local storage data
            return getDurationInHours(entry.start, entry.end);
          } else {
            // Fallback for invalid data
            return 0;
          }
        }),
      },
    ],
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155', '#475569']}
      style={styles.bg}
    >
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Your Weekly Sleep Summary</Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <Ionicons name="time-outline" size={20} color="#cbd5e1" />
            <Text style={styles.loadingText}> Loading sleep data...</Text>
          </View>
        )}

        {chartData.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={data}
              width={Math.max(chartData.length * 60, screenWidth)}  // make wide enough to scroll
              height={240}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix="h"
            />
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No sleep data available</Text>
        )}

        {chartData.map((entry, idx) => {
          let hours, score, suggestion;
          
          if (entry.duration_minutes && typeof entry.duration_minutes === 'number') {
            // For API data
            hours = parseFloat((entry.duration_minutes / 60).toFixed(1));
            score = getScore(hours);
            suggestion = getSuggestion(score);
          } else if (entry.start && entry.end) {
            // For local storage data
            hours = getDurationInHours(entry.start, entry.end);
            score = getScore(hours);
            suggestion = getSuggestion(score);
          } else {
            // Fallback for invalid data
            hours = 0;
            score = getScore(hours);
            suggestion = getSuggestion(score);
          }

          return (
            <View key={idx} style={styles.entryCard}>
              <Text style={styles.entryTitle}>Sleep Log #{idx + 1}</Text>
              <View style={styles.entryRow}>
                <Ionicons name="calendar-outline" size={16} color="#e2e8f0" />
                <Text style={styles.entryText}>
                  Date: {entry.sleep_date && !isNaN(new Date(entry.sleep_date).getTime()) 
                    ? new Date(entry.sleep_date).toDateString() 
                    : entry.date && !isNaN(new Date(entry.date).getTime())
                    ? new Date(entry.date).toDateString()
                    : 'Invalid Date'}
                </Text>
              </View>
              {entry.sleep_start && entry.sleep_end && !isNaN(new Date(entry.sleep_start).getTime()) && !isNaN(new Date(entry.sleep_end).getTime()) ? (
                <>
                  <View style={styles.entryRow}>
                    <Ionicons name="moon-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.entryText}>Bedtime: {new Date(entry.sleep_start).toLocaleTimeString()}</Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Ionicons name="sunny-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.entryText}>Wake Time: {new Date(entry.sleep_end).toLocaleTimeString()}</Text>
                  </View>
                </>
              ) : entry.start && entry.end && !isNaN(new Date(entry.start).getTime()) && !isNaN(new Date(entry.end).getTime()) ? (
                <>
                  <View style={styles.entryRow}>
                    <Ionicons name="moon-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.entryText}>Bedtime: {new Date(entry.start).toLocaleTimeString()}</Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Ionicons name="sunny-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.entryText}>Wake Time: {new Date(entry.end).toLocaleTimeString()}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.entryRow}>
                    <Ionicons name="moon-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.entryText}>Bedtime: Invalid Time</Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Ionicons name="sunny-outline" size={16} color="#e2e8f0" />
                    <Text style={styles.entryText}>Wake Time: Invalid Time</Text>
                  </View>
                </>
              )}
              <View style={styles.entryRow}>
                <Ionicons name="time-outline" size={16} color="#e2e8f0" />
                <Text style={styles.entryText}>Duration: {hours} hrs</Text>
              </View>
              {entry.sleep_quality && (
                <View style={styles.entryRow}>
                  <Ionicons name="star-outline" size={16} color="#e2e8f0" />
                  <Text style={styles.entryText}>Quality: {entry.sleep_quality}</Text>
                </View>
              )}
              <View style={styles.entryRow}>
                <Ionicons name="bed-outline" size={16} color="#38bdf8" />
                <Text style={styles.scoreText}>Sleep Score: {score} / 100</Text>
              </View>
              <View style={styles.entryRow}>
                <Ionicons name="bulb-outline" size={16} color="#94a3b8" />
                <Text style={styles.suggestion}>{suggestion}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#1E293B',
  backgroundGradientTo: '#1E293B',
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.6,
  decimalPlaces: 1,
  propsForBackgroundLines: {
    stroke: '#475569',
  },
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 32,
  },
  noDataText: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#334155',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryTitle: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entryText: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 4,
  },
  scoreText: {
    color: '#38bdf8',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  suggestion: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
});