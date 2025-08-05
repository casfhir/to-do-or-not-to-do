import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TodayScreen from '../screens/TodayScreen';
import AllTasksScreen from '../screens/AllTasksScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

/**
 * The bottom tab navigator defines two tabs: Today and All Tasks.
 * Icons are chosen to represent their functions. Tab bar styling is
 * intentionally minimal to keep the focus on content.
 */
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Today') {
            iconName = 'checkmark-done-circle-outline';
          } else if (route.name === 'All Tasks') {
            iconName = 'list-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: { paddingTop: 4, paddingBottom: 6, height: 60 }
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="All Tasks" component={AllTasksScreen} options={{ title: 'All Tasks' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;