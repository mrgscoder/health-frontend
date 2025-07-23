import { Question } from '../data/questions';

export interface ScoreInterpretation {
  level: string;
  description: string;
  color: string;
}

export const calculatePSSScore = (responses: number[], questions: Question[]): number => {
  let totalScore = 0;
  
  responses.forEach((response, index) => {
    const question = questions[index];
    if (question.reversed) {
      totalScore += (4 - response);
    } else {
      totalScore += response;
    }
  });
  
  return totalScore;
};

export const interpretScore = (score: number): ScoreInterpretation => {
  if (score <= 13) {
    return {
      level: "Low Stress",
      description: "Your stress levels appear to be well-managed.",
      color: "#4CAF50"
    };
  } else if (score <= 26) {
    return {
      level: "Moderate Stress",
      description: "You're experiencing moderate levels of stress.",
      color: "#FF9800"
    };
  } else {
    return {
      level: "High Stress",
      description: "Your stress levels are quite high. Consider seeking support.",
      color: "#F44336"
    };
  }
}; 