import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { gad7Questions, gad7Options } from './data/gad7Questions';
import { calculateGAD7Score, interpretGAD7Score } from './utils/gad7Scoring';
import { saveAssessmentResult, AssessmentResult } from './utils/storage';
import { commonStyles } from './styles/commonStyles';

export default function AnxietyTestScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(Array(gad7Questions.length).fill(null));
  const totalQuestions = gad7Questions.length;

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
      const score = calculateGAD7Score(allResponses);
      const interpretation = interpretGAD7Score(score);

      const result: AssessmentResult = {
        id: Date.now(),
        type: 'anxiety',
        score: score,
        interpretation: interpretation,
        responses: allResponses.map((value, index) => ({
          questionId: gad7Questions[index].id,
          value: value,
          questionText: gad7Questions[index].text
        })),
        date: new Date().toISOString(),
        timeframe: 'last 2 weeks'
      };

      await saveAssessmentResult(result, 'anxiety');
      
      router.push({
        pathname: '/stress-assessment/results',
        params: { 
          result: JSON.stringify(result),
          assessmentType: 'anxiety'
        }
      } as any);
    } catch (error) {
      console.error('Error completing anxiety assessment:', error);
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
              <Text style={commonStyles.title}>Anxiety Assessment</Text>
              <Text style={commonStyles.subtitle}>GAD-7 Questionnaire</Text>
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
                {gad7Questions[currentQuestion].text}
              </Text>
              <Text style={commonStyles.timeframe}>
                Over the last 2 weeks, how often have you been bothered by this problem?
              </Text>

              {/* Response Options */}
              <View style={commonStyles.optionsContainer}>
                {gad7Options.map((option) => (
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