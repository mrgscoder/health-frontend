import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AssessmentResult } from './utils/storage';
import { CheckCircle, ArrowLeft, Share2 } from 'lucide-react-native';
import { commonStyles } from './styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPosting, setIsPosting] = useState(false);
  const hasPostedRef = useRef(false);
  
  const result: AssessmentResult = params.result ? JSON.parse(params.result as string) : null;
  const assessmentType = params.assessmentType as string;

  // Post assessment result to API when component mounts (only once)
  useEffect(() => {
    if (result && !hasPostedRef.current) {
      hasPostedRef.current = true;
      postAssessmentToAPI();
    }
  }, []); // Empty dependency array ensures it only runs once

  const postAssessmentToAPI = async () => {
    try {
      setIsPosting(true);
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.log('No authentication token found, skipping API call');
        return;
      }

      const response = await fetch('http://192.168.1.16:5001/api/assessment/postassessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessment_type: assessmentType,
          total_score: result.score,
          level: result.interpretation.level,
          color: result.interpretation.color,
          description: result.interpretation.description,
          recommendation: result.interpretation.recommendation || null
        }),
      });

      if (response.ok) {
        console.log('Assessment result posted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to post assessment result:', errorData);
      }
    } catch (error) {
      console.error('Error posting assessment result:', error);
    } finally {
      setIsPosting(false);
    }
  };

  if (!result) {
    return (
      <SafeAreaView style={commonStyles.safeContainer}>
        <View style={commonStyles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[commonStyles.title, { color: '#fff' }]}>No results found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const getAssessmentTitle = () => {
    return assessmentType === 'stress' ? 'Stress Assessment (PSS-10)' : 'Anxiety Assessment (GAD-7)';
  };

  const getScoreColor = () => {
    return result.interpretation.color;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                <Text style={commonStyles.title}>Assessment Results</Text>
                <Text style={commonStyles.subtitle}>{getAssessmentTitle()}</Text>
                {isPosting && (
                  <Text style={[commonStyles.recommendationText, { fontSize: 12, color: '#666', marginTop: 4 }]}>
                    Saving to cloud...
                  </Text>
                )}
              </View>
            </View>

            {/* Results Content */}
            <View style={commonStyles.resultCard}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <CheckCircle size={48} color={getScoreColor()} />
              </View>
              
              <Text style={[commonStyles.scoreText, { color: getScoreColor() }]}>
                {result.score}
              </Text>
              <Text style={commonStyles.recommendationText}>
                Total Score
              </Text>

              <View style={[commonStyles.card, { marginVertical: 20 }]}>
                <Text style={[commonStyles.levelText, { color: getScoreColor() }]}>
                  {result.interpretation.level}
                </Text>
                <Text style={commonStyles.recommendationText}>
                  {result.interpretation.description}
                </Text>
                {result.interpretation.recommendation && (
                  <Text style={[commonStyles.recommendationText, { marginTop: 10 }]}>
                    {result.interpretation.recommendation}
                  </Text>
                )}
              </View>

              <Text style={[commonStyles.recommendationText, { fontSize: 14, color: '#999' }]}>
                Completed on {formatDate(result.date)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={commonStyles.buttonContainer}>
              <TouchableOpacity
                style={commonStyles.primaryButton}
                onPress={() => router.push('/stress-assessment' as any)}
              >
                <Text style={commonStyles.buttonText}>
                  Take Another Assessment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.primaryButton, { backgroundColor: '#6c757d' }]}
                onPress={() => router.push('/stress-assessment/history' as any)}
              >
                <Text style={commonStyles.buttonText}>
                  View History
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.primaryButton, { backgroundColor: '#007AFF' }]}
                onPress={() => {
                  // Share functionality would go here
                  console.log('Share results');
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Share2 size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={commonStyles.buttonText}>
                    Share Results
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 