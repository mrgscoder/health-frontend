export interface GAD7Interpretation {
  level: string;
  description: string;
  color: string;
  recommendation: string;
}

export const calculateGAD7Score = (responses: number[]): number => {
  if (!responses || responses.length !== 7) {
    throw new Error('GAD-7 requires exactly 7 responses');
  }
  
  return responses.reduce((total, response) => {
    return total + (response || 0);
  }, 0);
};

export const interpretGAD7Score = (score: number): GAD7Interpretation => {
  if (score >= 0 && score <= 4) {
    return {
      level: 'Minimal',
      description: 'Low Anxiety',
      color: '#4CAF50', // Green
      recommendation: 'Your anxiety levels appear minimal. Continue healthy lifestyle practices.'
    };
  } else if (score >= 5 && score <= 9) {
    return {
      level: 'Mild',
      description: 'Mild Anxiety',
      color: '#FFC107', // Yellow
      recommendation: 'You may be experiencing mild anxiety. Consider stress management techniques.'
    };
  } else if (score >= 10 && score <= 14) {
    return {
      level: 'Moderate',
      description: 'Moderate Anxiety',
      color: '#FF9800', // Orange
      recommendation: 'Moderate anxiety detected. Consider speaking with a healthcare professional.'
    };
  } else if (score >= 15 && score <= 21) {
    return {
      level: 'Severe',
      description: 'High Anxiety',
      color: '#F44336', // Red
      recommendation: 'High anxiety levels detected. Strongly consider professional consultation.'
    };
  }
  
  return {
    level: 'Unknown',
    description: 'Invalid Score',
    color: '#9E9E9E',
    recommendation: 'Please retake the assessment.'
  };
}; 