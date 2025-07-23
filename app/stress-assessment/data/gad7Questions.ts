export interface GAD7Question {
  id: number;
  text: string;
  timeframe?: string;
}

export interface GAD7Option {
  value: number;
  label: string;
}

export const gad7Questions: GAD7Question[] = [
  {
    id: 1,
    text: "Feeling nervous, anxious, or on edge",
    timeframe: "Over the last 2 weeks, how often have you been bothered by:"
  },
  {
    id: 2,
    text: "Not being able to stop or control worrying"
  },
  {
    id: 3,
    text: "Worrying too much about different things"
  },
  {
    id: 4,
    text: "Trouble relaxing"
  },
  {
    id: 5,
    text: "Being so restless that it is hard to sit still"
  },
  {
    id: 6,
    text: "Becoming easily annoyed or irritable"
  },
  {
    id: 7,
    text: "Feeling afraid, as if something awful might happen"
  }
];

export const gad7Options: GAD7Option[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
]; 