import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PSS10_QUESTIONS, RESPONSE_OPTIONS } from './data/questions';
import { calculatePSSScore, interpretScore } from './utils/scoring';
import { saveAssessmentResult, AssessmentResult } from './utils/storage';
import { commonStyles } from './styles/commonStyles';

export default function StressTestScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(Array(PSS10_QUESTIONS.length).fill(null));
  const totalQuestions = PSS10_QUESTIONS.length;

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment(newResponses);
    }
  };

  const handleOptionSelect = (value: number) => {
    const updated = [...selectedOptions];
    updated[currentQuestion] = value;
    setSelectedOptions(updated);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (selectedOptions[currentQuestion] === null) return;
    
    const newResponses = [...responses];
    newResponses[currentQuestion] = selectedOptions[currentQuestion]!;
    setResponses(newResponses);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment(newResponses);
    }
  };

  const completeAssessment = async (allResponses: number[]) => {
    try {
      const score = calculatePSSScore(allResponses, PSS10_QUESTIONS);
      const interpretation = interpretScore(score);

      const result: AssessmentResult = {
        id: Date.now(),
        type: 'stress',
        score: score,
        interpretation: interpretation,
        responses: allResponses.map((value, index) => ({
          questionId: PSS10_QUESTIONS[index].id,
          value: value,
          questionText: PSS10_QUESTIONS[index].text
        })),
        date: new Date().toISOString(),
        timeframe: 'last month'
      };

      await saveAssessmentResult(result, 'stress');
      
      router.push({
        pathname: '/stress-assessment/results',
        params: { 
          result: JSON.stringify(result),
          assessmentType: 'stress'
        }
      } as any);
    } catch (error) {
      console.error('Error completing stress assessment:', error);
    }
  };

  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <View style={commonStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={commonStyles.content}>
            {/* Header */}
            <View>
              <Text style={commonStyles.title}>Stress Assessment</Text>
              <Text style={commonStyles.subtitle}>PSS-10 Questionnaire</Text>
            </View>

            {/* Progress Bar */}
            <View style={commonStyles.progressContainer}>
              <View 
                style={[
                  commonStyles.progressBar,
                  { width: `${progress}%` }
                ]}
              />
            </View>
            <Text style={commonStyles.progressText}>
              Question {currentQuestion + 1} of {totalQuestions}
            </Text>

            {/* Question */}
            <View style={commonStyles.card}>
              <Text style={commonStyles.questionText}>
                {PSS10_QUESTIONS[currentQuestion].text}
              </Text>
              <Text style={commonStyles.timeframe}>
                Over the last month, how often have you been bothered by this problem?
              </Text>

              {/* Response Options */}
              <View style={commonStyles.optionsContainer}>
                {RESPONSE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={
                      selectedOptions[currentQuestion] === option.value
                        ? commonStyles.selectedOptionButton
                        : commonStyles.optionButton
                    }
                    onPress={() => handleOptionSelect(option.value)}
                  >
                    <Text style={
                      selectedOptions[currentQuestion] === option.value
                        ? commonStyles.selectedOptionText
                        : commonStyles.optionText
                    }>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={commonStyles.buttonContainer}>
              <TouchableOpacity
                style={[
                  commonStyles.secondaryButton,
                  currentQuestion === 0 && { opacity: 0.5 }
                ]}
                onPress={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <Text style={commonStyles.secondaryButtonText}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  commonStyles.primaryButton,
                  selectedOptions[currentQuestion] === null && { opacity: 0.5 }
                ]}
                onPress={handleNext}
                disabled={selectedOptions[currentQuestion] === null}
              >
                <Text style={commonStyles.buttonText}>
                  {currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 