export interface MedicationCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface MealTiming {
  id: string;
  name: string;
  description: string;
}

export interface Frequency {
  id: string;
  name: string;
  description: string;
}

export const MEDICATION_CATEGORIES: MedicationCategory[] = [
  { id: 'prescription', name: 'Prescription', color: '#007AFF', icon: 'medical' },
  { id: 'vitamins', name: 'Vitamins', color: '#34C759', icon: 'nutrition' },
  { id: 'supplements', name: 'Supplements', color: '#FF9500', icon: 'fitness' },
  { id: 'otc', name: 'Over-the-Counter', color: '#5856D6', icon: 'bandage' },
  { id: 'herbal', name: 'Herbal/Natural', color: '#32D74B', icon: 'leaf' }
];

export const DOSAGE_UNITS: string[] = [
  'tablet', 'capsule', 'ml', 'mg', 'drops', 'spray', 'injection', 'patch', 'cream', 'inhaler'
];

export const MEAL_TIMINGS: MealTiming[] = [
  { id: 'anytime', name: 'Anytime', description: 'Can be taken at any time' },
  { id: 'before', name: 'Before Meals', description: '30 minutes before eating' },
  { id: 'with', name: 'With Meals', description: 'During or immediately after eating' },
  { id: 'after', name: 'After Meals', description: '1-2 hours after eating' },
  { id: 'empty', name: 'Empty Stomach', description: '2 hours after or 1 hour before meals' }
];

export const FREQUENCIES: Frequency[] = [
  { id: 'daily', name: 'Daily', description: 'Every day' },
  { id: 'weekly', name: 'Weekly', description: 'Once per week' },
  { id: 'monthly', name: 'Monthly', description: 'Once per month' },
  { id: 'asNeeded', name: 'As Needed', description: 'Only when required' },
  { id: 'custom', name: 'Custom', description: 'Custom schedule' }
]; 