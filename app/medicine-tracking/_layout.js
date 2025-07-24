import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { useNavigation } from 'expo-router';

const Stack = createStackNavigator();

export default function MedicineTrackingLayout() {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ReminderList" 
        component={require('./screens/ReminderList').default}
        options={{
          title: 'My Medications',
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <Text 
                style={{ color: '#fff', fontWeight: '600' }}
                onPress={() => navigation.navigate('AddReminder')}
              >
                Add
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="AddReminder" 
        component={require('./screens/ReminderForm').default}
        options={{ title: 'Add Medication' }}
      />
      <Stack.Screen 
        name="EditReminder" 
        component={require('./screens/ReminderForm').default}
        options={{ title: 'Edit Medication' }}
      />
      <Stack.Screen 
        name="UpcomingReminders" 
        component={require('./screens/UpcomingReminders').default}
        options={{ title: 'Upcoming Medications' }}
      />
    </Stack.Navigator>
  );
}
