import { Redirect } from 'expo-router';

export default function MedicineTrackingIndex() {
  // Redirect to the main medicine tracking screen
  return <Redirect href="/medicine-tracking/reminders" />;
}
