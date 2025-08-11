import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import BASE_URL from '../../src/config';
import { getAuthToken } from '../utils/authUtils';

const { width: screenWidth } = Dimensions.get('window');

interface Food {
  id: number;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
  serving_size: string;
  icon: string;
  created_at: string;
}

interface DigestiveTimelineItem {
  id: number;
  name: string;
  category: string;
  digestion: {
    carbs: { duration: number; amount: number };
    protein: { duration: number; amount: number };
    fat: { duration: number; amount: number };
  };
  totalDigestionTime: number;
}

const FoodResults: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [digestiveTimeline, setDigestiveTimeline] = useState<DigestiveTimelineItem[]>([]);
  const [noData, setNoData] = useState(false);

  const API_BASE_URL = `${BASE_URL}/api`;

  const fetchDigestiveTimeline = async () => {
    try {
      setLoading(true);
      setNoData(false);
      
      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        console.error('No auth token available');
        Alert.alert('Authentication Error', 'Please log in again to view food insights.');
        return;
      }

      console.log('🔍 Fetching today\'s foods from:', `${API_BASE_URL}/foodlist/today`);
      
      // First, get today's food data
      const todayFoodsRes = await fetch(`${API_BASE_URL}/foodlist/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Today\'s foods response status:', todayFoodsRes.status);

      if (!todayFoodsRes.ok) {
        const errorText = await todayFoodsRes.text();
        console.error('❌ Failed to fetch today\'s foods:', todayFoodsRes.status, errorText);
        throw new Error(`Failed to fetch today's foods: ${todayFoodsRes.status} - ${errorText}`);
      }

      const todayFoods = await todayFoodsRes.json();
      console.log('✅ Today\'s foods fetched successfully:', todayFoods);

      if (!Array.isArray(todayFoods) || todayFoods.length === 0) {
        console.log('⚠️ No food data found for today');
        setDigestiveTimeline([]);
        setNoData(true);
        return;
      }

      // Now fetch digestive timeline using today's food data
      console.log('🔍 Fetching digestive timeline with food data:', todayFoods.length, 'items');
      
      const digestiveRes = await fetch(`${API_BASE_URL}/insights/digestive-timeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ foods: todayFoods })
      });

      console.log('📊 Digestive timeline response status:', digestiveRes.status);

      if (!digestiveRes.ok) {
        const errorText = await digestiveRes.text();
        console.error('❌ Failed to fetch digestive timeline:', digestiveRes.status, errorText);
        throw new Error(`Failed to fetch digestive timeline: ${digestiveRes.status} - ${errorText}`);
      }

      const digestiveData = await digestiveRes.json();
      console.log('✅ Digestive timeline data received:', digestiveData);

      setDigestiveTimeline(digestiveData);
      setNoData(false);
    } catch (error) {
      console.error('❌ Error fetching digestive timeline:', error);
      Alert.alert(
        'Error', 
        'Failed to load digestive timeline. Please try again or check if you have logged food today.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDigestiveTimeline();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setNoData(false);
    fetchDigestiveTimeline();
  };

  const renderDigestiveTimeline = () => (
    <View style={styles.insightCard}>
      <Text style={styles.cardTitle}>🕒 Digestive Load Timeline</Text>
      <Text style={styles.cardDescription}>
        How long different parts of your meals will stay in your system
      </Text>
      
      {digestiveTimeline.map((meal, index) => (
        <View key={meal.id} style={styles.timelineItem}>
          <Text style={styles.mealName}>{meal.name} ({meal.category})</Text>
          
          <View style={styles.macroTimeline}>
            <View style={[styles.timelineBar, { backgroundColor: '#FF6B6B', width: `${(meal.digestion.carbs.duration / 6) * 100}%` }]}>
              <Text style={styles.timelineText}>Carbs: {meal.digestion.carbs.duration}h ({meal.digestion.carbs.amount}g)</Text>
            </View>
            <View style={[styles.timelineBar, { backgroundColor: '#4ECDC4', width: `${(meal.digestion.protein.duration / 6) * 100}%` }]}>
              <Text style={styles.timelineText}>Protein: {meal.digestion.protein.duration}h ({meal.digestion.protein.amount}g)</Text>
            </View>
            <View style={[styles.timelineBar, { backgroundColor: '#45B7D1', width: `${(meal.digestion.fat.duration / 6) * 100}%` }]}>
              <Text style={styles.timelineText}>Fat: {meal.digestion.fat.duration}h ({meal.digestion.fat.amount}g)</Text>
            </View>
          </View>
          
          <Text style={styles.timelineInfo}>
            Will keep you full for ~{meal.totalDigestionTime} hours
          </Text>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#45B7D1" />
        <Text style={styles.loadingText}>Analyzing your digestive timeline...</Text>
      </View>
    );
  }

  if (noData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No food data available for today.</Text>
        <Text style={styles.noDataSubtext}>Please log your food intake to see your digestive timeline.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderDigestiveTimeline()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 10,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  timelineItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  macroTimeline: {
    marginBottom: 12,
  },
  timelineBar: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    minWidth: 120,
  },
  timelineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  timelineInfo: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default FoodResults;
