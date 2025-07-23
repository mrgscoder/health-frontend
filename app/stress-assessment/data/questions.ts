export interface Question {
  id: number;
  text: string;
  reversed: boolean;
}

export interface ResponseOption {
  value: number;
  label: string;
}

export const PSS10_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
    reversed: false
  },
  {
    id: 2,
    text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
    reversed: false
  },
  {
    id: 3,
    text: "In the last month, how often have you felt nervous and 'stressed'?",
    reversed: false
  },
  {
    id: 4,
    text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    reversed: true
  },
  {
    id: 5,
    text: "In the last month, how often have you felt that things were going your way?",
    reversed: true
  },
  {
    id: 6,
    text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    reversed: false
  },
  {
    id: 7,
    text: "In the last month, how often have you been able to control irritations in your life?",
    reversed: true
  },
  {
    id: 8,
    text: "In the last month, how often have you felt that you were on top of things?",
    reversed: true
  },
  {
    id: 9,
    text: "In the last month, how often have you been angered because of things that were outside of your control?",
    reversed: false
  },
  {
    id: 10,
    text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
    reversed: false
  }
];

export const RESPONSE_OPTIONS: ResponseOption[] = [
  { value: 0, label: "Never" },
  { value: 1, label: "Almost Never" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Fairly Often" },
  { value: 4, label: "Very Often" }
]; 