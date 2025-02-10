// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/screens/LoginPage';
import HomePage from './src/screens/HomePage';
import ProfileEditScreen from './src/screens/ProfileEditScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="HomePage" component={HomePage} options={{ title: 'Trang Chủ' }} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: 'Chỉnh Sửa Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
