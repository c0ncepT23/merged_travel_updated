// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';

// // Import screens
// import ProfileScreen from '../screens/profile/ProfileScreen';
// import EditProfileScreen from '../screens/profile/EditProfileScreen';
// import SettingsScreen from '../screens/profile/SettingsScreen';
// import PastTripsScreen from '../screens/profile/PastTripsScreen';

// // Define parameter types for the navigation
// export type ProfileStackParamList = {
//   Profile: undefined;
//   EditProfile: undefined;
//   Settings: undefined;
//   PastTrips: undefined;
// };

// const Stack = createStackNavigator<ProfileStackParamList>();

// const ProfileNavigator: React.FC = () => {
//   return (
//     <Stack.Navigator
//       initialRouteName="Profile"
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: '#0066CC',
//         },
//         headerTintColor: '#FFFFFF',
//         headerTitleStyle: {
//           fontWeight: 'bold',
//         },
//       }}
//     >
//       <Stack.Screen 
//         name="Profile" 
//         component={ProfileScreen} 
//         options={{ title: 'My Profile' }}
//       />
//       <Stack.Screen 
//         name="EditProfile" 
//         component={EditProfileScreen} 
//         options={{ title: 'Edit Profile' }}
//       />
//       <Stack.Screen 
//         name="Settings" 
//         component={SettingsScreen} 
//         options={{ title: 'Settings' }}
//       />
//       <Stack.Screen 
//         name="PastTrips" 
//         component={PastTripsScreen} 
//         options={{ title: 'Past Trips' }}
//       />
//     </Stack.Navigator>
//   );
// };

// export default ProfileNavigator;

// mobile/src/navigation/ProfileNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PastTripsScreen from '../screens/profile/PastTripsScreen';
import AdminCleanupScreen from '../screens/admin/AdminCleanupScreen';

// Define parameter types for the navigation
export type ProfileStackParamList = {
  ProfileMain: undefined;  // Changed from 'Profile' to 'ProfileMain'
  EditProfile: undefined;
  Settings: undefined;
  PastTrips: undefined;
  AdminCleanup: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
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
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="PastTrips" 
        component={PastTripsScreen} 
        options={{ title: 'Past Trips' }}
      />
      <Stack.Screen 
        name="AdminCleanup" 
        component={AdminCleanupScreen} 
        options={{ 
          title: 'Admin Cleanup',
          headerStyle: {
            backgroundColor: '#F44336',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;