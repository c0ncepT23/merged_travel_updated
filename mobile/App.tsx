import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { legacy_createStore as createStore } from 'redux';
import { applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

// Import components and services
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import rootReducer from './src/store/reducers';
//import { AuthProvider, useAuth } from './src/services/auth/AuthProvider';
import { AuthProvider } from './src/services/auth/AuthProvider';
import { useAuth } from './src/hooks/useAuth';
import LoadingScreen from './src/components/common/LoadingScreen';

// Create Redux store
const store = createStore(rootReducer, applyMiddleware(thunk));

// Separate component to use the auth hook
const AppContent = () => {
  const { user, loading } = useAuth();

  // Add the useEffect hook here
  useEffect(() => {
    // Import on demand
    const { initializeDestinations } = require('./src/services/firebase/initializeData');
    
    // Initialize data if needed
    initializeDestinations().catch((error: unknown) => {
      console.error('Error initializing data:', error);
    });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}