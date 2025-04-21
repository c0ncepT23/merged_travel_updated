import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DestinationsListScreen from '../screens/destinations/DestinationsListScreen';
import DestinationDetailScreen from '../screens/destinations/DestinationDetailScreen';
import ThingsToSeeScreen from '../screens/destinations/ThingsToSeeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import AttractionDetailScreen from '../screens/destinations/AttractionDetailScreen';

// Define parameter types for the navigation
export type DestinationsStackParamList = {
  DestinationsList: undefined;
  DestinationDetail: { destinationId: string };
  ThingsToSee: { 
    destinationId: string;
    subDestinationId?: string;
    title: string;
  };
  Chat: { 
    destinationId: string;
    subDestinationId?: string;
    title: string;
  };
  AttractionDetail: { 
    attractionId: string;
    destinationId: string;
  };
};

const Stack = createStackNavigator<DestinationsStackParamList>();

const DestinationsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DestinationsList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066CC',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="DestinationsList" 
        component={DestinationsListScreen} 
        options={{ title: 'My Destinations' }}
      />
      <Stack.Screen 
        name="DestinationDetail" 
        component={DestinationDetailScreen}
        options={({ route }) => ({ title: 'Destination' })}
      />
      <Stack.Screen 
        name="ThingsToSee" 
        component={ThingsToSeeScreen}
        options={({ route }) => ({ 
          title: route.params.title ? `Things to See in ${route.params.title}` : 'Things to See'
        })}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({ 
          title: route.params.title ? `${route.params.title} Chat` : 'Group Chat'
        })}
      />
      <Stack.Screen 
        name="AttractionDetail" 
        component={AttractionDetailScreen}
        options={{ title: 'Attraction Details' }}
      />
    </Stack.Navigator>
  );
};

export default DestinationsNavigator;