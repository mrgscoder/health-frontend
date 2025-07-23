import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, ArrowRight, History } from 'lucide-react-native';
import { commonStyles } from './styles/commonStyles';

const StressAssessmentScreen = () => {
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  const assessments = [
    {
      id: 'stress-test',
      title: 'Stress Assessment (PSS-10)',
      description: 'Evaluate your stress levels using the Perceived Stress Scale',
      color: '#8B5CF6'
    },
    {
      id: 'anxiety-test',
      title: 'Anxiety Assessment (GAD-7)',
      description: 'Assess anxiety symptoms using the Generalized Anxiety Disorder scale',
      color: '#EC4899'
    }
  ];

  const handleAssessmentSelect = (assessmentId: string) => {
    setSelectedAssessment(assessmentId);
    router.push(`/stress-assessment/${assessmentId}` as any);
  };

  const handleHistoryPress = () => {
    router.push('/stress-assessment/history' as any);
  };

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <View style={commonStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={commonStyles.content}>
            {/* Header */}
            <View>
              <Text style={commonStyles.title}>Stress Assessment</Text>
              <Text style={commonStyles.subtitle}>Choose an assessment type</Text>
            </View>

            {/* Assessment Options */}
            <View style={commonStyles.assessmentContainer}>
              {assessments.map((assessment) => (
                <TouchableOpacity
                  key={assessment.id}
                  style={[
                    commonStyles.assessmentCard,
                    {
                      shadowColor: assessment.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }
                  ]}
                  onPress={() => handleAssessmentSelect(assessment.id)}
                >
                  <View style={commonStyles.cardHeader}>
                    <View 
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        backgroundColor: assessment.color + '20'
                      }}
                    >
                      <Brain size={24} color={assessment.color} />
                    </View>
                    <View style={commonStyles.cardTitleContainer}>
                      <Text style={commonStyles.cardTitle}>{assessment.title}</Text>
                      <Text style={commonStyles.cardSubtitle}>{assessment.description}</Text>
                    </View>
                    <View 
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: assessment.color + '20'
                      }}
                    >
                      <ArrowRight size={20} color={assessment.color} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* History Button */}
              <TouchableOpacity
                style={[
                  commonStyles.assessmentCard,
                  commonStyles.historyButton,
                  {
                    shadowColor: '#6B7280',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }
                ]}
                onPress={handleHistoryPress}
              >
                <View style={commonStyles.cardHeader}>
                  <View 
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                      backgroundColor: '#6B7280' + '20'
                    }}
                  >
                    <History size={24} color="#6B7280" />
                  </View>
                  <View style={commonStyles.cardTitleContainer}>
                    <Text style={[commonStyles.cardTitle, { color: '#fff' }]}>Assessment History</Text>
                    <Text style={[commonStyles.cardSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>View your previous assessments</Text>
                  </View>
                  <View 
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#6B7280' + '20'
                    }}
                  >
                    <ArrowRight size={20} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default StressAssessmentScreen; 