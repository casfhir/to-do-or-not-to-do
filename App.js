import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import EliminationScreen from './src/screens/EliminationScreen';
import { TasksProvider } from './src/context/TasksContext';

// Create a root stack to support modal presentation of the elimination screen.
const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <TasksProvider>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Elimination"
            component={EliminationScreen}
            options={{ title: 'Choose Today\'s Tasks', presentation: 'modal' }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </TasksProvider>
  );
}