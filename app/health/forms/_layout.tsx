import { Stack } from "expo-router";
import '../../globals.css'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="Inform"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LifestyleForm"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Wellness"
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
            name="Result"
            options={{
            headerShown: false,
            }}/>
        <Stack.Screen
            name="Signup"
            options={{
            headerShown: false,
            }}/>
       
    </Stack>
   
  );
}
