import AsyncStorage from '@react-native-async-storage/async-storage';

const STRESS_RESULTS_KEY = '@pss10_results';
const ANXIETY_RESULTS_KEY = '@gad7_results';

export interface AssessmentResult {
  id: number;
  type: 'stress' | 'anxiety';
  score: number;
  interpretation: {
    level: string;
    description: string;
    color: string;
    recommendation?: string;
  };
  responses: Array<{
    questionId: number;
    value: number;
    questionText: string;
  }>;
  date: string;
  timeframe: string;
}

// Save assessment result
export const saveAssessmentResult = async (result: AssessmentResult, assessmentType: 'stress' | 'anxiety'): Promise<boolean> => {
  try {
    const key = assessmentType === 'stress' ? STRESS_RESULTS_KEY : ANXIETY_RESULTS_KEY;
    const existingResults = await getAssessmentResults(assessmentType);
    const newResults = [result, ...existingResults];
    await AsyncStorage.setItem(key, JSON.stringify(newResults));
    return true;
  } catch (error) {
    console.error('Error saving assessment result:', error);
    return false;
  }
};

// Get assessment results
export const getAssessmentResults = async (assessmentType: 'stress' | 'anxiety'): Promise<AssessmentResult[]> => {
  try {
    const key = assessmentType === 'stress' ? STRESS_RESULTS_KEY : ANXIETY_RESULTS_KEY;
    const results = await AsyncStorage.getItem(key);
    return results ? JSON.parse(results) : [];
  } catch (error) {
    console.error('Error retrieving assessment results:', error);
    return [];
  }
};

// Get all assessment results (for combined history)
export const getAllAssessmentResults = async (): Promise<AssessmentResult[]> => {
  try {
    const stressResults = await getAssessmentResults('stress');
    const anxietyResults = await getAssessmentResults('anxiety');
    
    // Combine and sort by date
    const allResults = [
      ...stressResults.map(result => ({ ...result, type: 'stress' as const })),
      ...anxietyResults.map(result => ({ ...result, type: 'anxiety' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return allResults;
  } catch (error) {
    console.error('Error retrieving all assessment results:', error);
    return [];
  }
}; 