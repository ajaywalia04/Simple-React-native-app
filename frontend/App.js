import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerifyResetCodeScreen from './src/screens/VerifyResetCodeScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import IdeaDetailScreen from './src/screens/IdeaDetailScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import CreateIdeaScreen from './src/screens/CreateIdeaScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: true }} />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen} 
            options={{ headerShown: true, title: 'Forgot Password' }} 
          />
          <Stack.Screen 
            name="VerifyResetCode" 
            component={VerifyResetCodeScreen} 
            options={{ headerShown: true, title: 'Verify Code' }} 
          />
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen} 
            options={{ headerShown: true, title: 'Reset Password' }} 
          />
          <Stack.Screen
            name="IdeaDetail"
            component={IdeaDetailScreen}
            options={{
              headerShown: true,
              title: 'Idea Detail',
            }}
          />
          <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={{
              headerShown: true,
              title: 'Profile',
            }}
          />
          <Stack.Screen
            name="CreateIdea"
            component={CreateIdeaScreen}
            options={{
              headerShown: true,
              title: 'Create Idea',
              presentation: 'modal'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
