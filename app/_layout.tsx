import { Stack } from "expo-router";
import './globals.css'
export default function RootLayout() {
  return <Stack>
    <Stack.Screen
      name="health/[id]"
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="health/forms/MultiStepForm"
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="(tabs)"
      options={{
        headerShown: false,
      }}
    />
      <Stack.Screen
      name="health/Account"
      options={{
        headerShown: false,
      }}
    />
     <Stack.Screen
      name="health/forms/Signup"
      options={{
        headerShown: false,
      }}
    />
  </Stack>;
}
