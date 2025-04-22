// src/utils/networkUtils.ts
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export const networkUtils = {
  // Check if the device has internet connection
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  // Check connection with timeout
  async checkConnection(timeout: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(false);
      }, timeout);

      NetInfo.fetch().then(state => {
        clearTimeout(timer);
        resolve(state.isConnected ?? false);
      }).catch(() => {
        clearTimeout(timer);
        resolve(false);
      });
    });
  },

  // Show network error alert
  showNetworkError(): void {
    Alert.alert(
      'Network Error',
      'It looks like you\'re offline. Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  },

  // Test Firebase connectivity
  async testFirebaseConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://firestore.googleapis.com/v1/projects/travel-together-7cd3d');
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};