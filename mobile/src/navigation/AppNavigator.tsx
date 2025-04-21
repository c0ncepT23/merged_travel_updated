import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DestinationsNavigator from './DestinationsNavigator';
import ProfileNavigator from './ProfileNavigator';
import DocumentsNavigator from './DocumentsNavigator';

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Destinations') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Destinations" 
        component={DestinationsNavigator} 
        options={{ title: 'My Trips' }}
      />
      <Tab.Screen 
        name="Documents" 
        component={DocumentsNavigator} 
        options={{ title: 'Travel Docs' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;