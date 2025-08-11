export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getMealMapping = () => {
  return {
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'snacks': 'Snack'
  };
};

export const getMealIcon = (meal: string) => {
  switch (meal) {
    case 'Breakfast':
      return 'food-croissant';
    case 'Lunch':
      return 'food-variant';
    case 'Dinner':
      return 'food-fork-drink';
    case 'Snack':
      return 'food-apple';
    default:
      return 'food';
  }
};

export const dailyGoals = {
  calories: 1870,
  carbs: 209,
  fat: 58,
  protein: 84,
  sodium: 2300,
  sugar: 63
}; 