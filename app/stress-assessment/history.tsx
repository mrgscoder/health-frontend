import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AssessmentResult } from './utils/storage';
import { ArrowLeft, Trash2, Calendar, TrendingUp } from 'lucide-react-native';
import { commonStyles } from './styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface APIAssessmentResult {
  id: number;
  assessment_type: string;
  total_score: number;
  level: string;
  color: string;
  description: string;
  recommendation: string | null;
  recorded_at: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to view your assessment history.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://192.168.1.16:5001/api/assessment/getassessment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch assessment history');
      }

      const apiResults: APIAssessmentResult[] = await response.json();
      
      // Transform API results to match local AssessmentResult format
      const transformedResults: AssessmentResult[] = apiResults.map(apiResult => ({
        id: apiResult.id,
        type: apiResult.assessment_type as 'stress' | 'anxiety',
        score: apiResult.total_score,
        interpretation: {
          level: apiResult.level,
          color: apiResult.color,
          description: apiResult.description,
          recommendation: apiResult.recommendation || undefined
        },
        responses: [], // API doesn't store individual responses
        date: apiResult.recorded_at,
        timeframe: apiResult.assessment_type === 'stress' ? 'last month' : 'last 2 weeks'
      }));

      setResults(transformedResults);
    } catch (error) {
      console.error('Error loading results:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assessment history');
      
      // Fallback to local storage if API fails
      try {
        const { getAllAssessmentResults } = await import('./utils/storage');
        const localResults = await getAllAssessmentResults();
        setResults(localResults);
        console.log('Falling back to local storage data');
      } catch (localError) {
        console.error('Failed to load from local storage as well:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssessmentTypeLabel = (type: string) => {
    return type === 'stress' ? 'Stress (PSS-10)' : 'Anxiety (GAD-7)';
  };

  const getScoreColor = (result: AssessmentResult) => {
    return result.interpretation.color;
  };

  const handleResultPress = (result: AssessmentResult) => {
    router.push({
      pathname: '/stress-assessment/results',
      params: { 
        result: JSON.stringify(result),
        assessmentType: result.type
      }
    } as any);
  };

  const handleDeleteResult = (resultId: number) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment result?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Delete functionality would go here
            console.log('Delete result:', resultId);
            loadResults(); // Reload after deletion
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={commonStyles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[commonStyles.title, { color: '#fff' }]}>Loading...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <View style={commonStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={commonStyles.content}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginRight: 16 }}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
              <View>
                <Text style={commonStyles.title}>Assessment History</Text>
                <Text style={commonStyles.subtitle}>
                  {results.length} assessment{results.length !== 1 ? 's' : ''} completed
                </Text>
                {error && (
                  <Text style={[commonStyles.recommendationText, { fontSize: 12, color: '#EF4444', marginTop: 4 }]}>
                    {error}
                  </Text>
                )}
              </View>
            </View>

            {/* History Content */}
            {results.length === 0 ? (
              <View style={commonStyles.card}>
                <View style={{ alignItems: 'center' }}>
                  <Calendar size={64} color="#9CA3AF" />
                  <Text style={[commonStyles.title, { marginTop: 16, marginBottom: 8 }]}>
                    No Assessments Yet
                  </Text>
                  <Text style={commonStyles.recommendationText}>
                    You haven't completed any assessments yet. Take your first assessment to see your results here.
                  </Text>
                  <TouchableOpacity
                    style={commonStyles.primaryButton}
                    onPress={() => router.push('/stress-assessment' as any)}
                  >
                    <Text style={commonStyles.buttonText}>
                      Take Assessment
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {results.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={commonStyles.resultItem}
                    onPress={() => handleResultPress(result)}
                  >
                    <View style={commonStyles.resultHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TrendingUp size={24} color={getScoreColor(result)} />
                        <Text style={[commonStyles.resultDate, { marginLeft: 12 }]}>
                          {getAssessmentTypeLabel(result.type)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteResult(result.id)}
                        style={{ padding: 8 }}
                      >
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={commonStyles.resultDetails}>
                      <Text style={[commonStyles.resultScore, { color: getScoreColor(result) }]}>
                        {result.score}
                      </Text>
                      <Text style={commonStyles.resultLevel}>
                        {result.interpretation.level}
                      </Text>
                    </View>

                    <Text style={[commonStyles.recommendationText, { marginVertical: 12 }]}>
                      {result.interpretation.description}
                    </Text>

                    <View style={commonStyles.resultDetails}>
                      <Text style={[commonStyles.resultDate, { fontSize: 12, color: '#666' }]}>
                        {formatDate(result.date)}
                      </Text>
                      <Text style={[commonStyles.resultType, { fontSize: 12 }]}>
                        {result.timeframe}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 