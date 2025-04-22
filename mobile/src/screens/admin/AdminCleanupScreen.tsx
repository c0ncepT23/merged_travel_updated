// mobile/src/screens/admin/AdminCleanupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cleanupFirebaseData, resetAppData } from '../../utils/cleanupFirebaseData';

const AdminCleanupScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLog(prevLog => [...prevLog, message]);
  };
  
  const handleCleanupAll = async () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            addLog('Starting cleanup...');
            
            try {
              const result = await cleanupFirebaseData();
              if (result) {
                addLog('Cleanup successful!');
                Alert.alert('Success', 'All data has been cleaned from Firebase!');
              } else {
                addLog('Cleanup failed');
                Alert.alert('Error', 'Failed to clean up data');
              }
            } catch (error) {
              addLog(`Error: ${error}`);
              Alert.alert('Error', 'An error occurred during cleanup');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  const handleResetApp = async () => {
    Alert.alert(
      'Reset App Data',
      'This will delete all data and re-initialize with Thailand and Japan only. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            addLog('Resetting app data...');
            
            try {
              const result = await resetAppData();
              if (result) {
                addLog('App reset successful!');
                Alert.alert(
                  'Success', 
                  'App data has been reset! Please restart the app.',
                  [{ text: 'OK' }]
                );
              } else {
                addLog('Reset failed');
                Alert.alert('Error', 'Failed to reset app data');
              }
            } catch (error) {
              addLog(`Error: ${error}`);
              Alert.alert('Error', 'An error occurred during reset');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={24} color="#F44336" />
        <Text style={styles.title}>Admin Cleanup Panel</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Cleanup</Text>
          <Text style={styles.sectionDescription}>
            Delete all data from Firebase collections (destinations, users, documents, messages)
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton, loading && styles.buttonDisabled]}
            onPress={handleCleanupAll}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Delete All Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reset App</Text>
          <Text style={styles.sectionDescription}>
            Delete all data and re-initialize with only Thailand and Japan destinations
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handleResetApp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Reset App Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>Log:</Text>
          {log.map((message, index) => (
            <Text key={index} style={styles.logText}>{message}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  resetButton: {
    backgroundColor: '#0066CC',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  logText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
});

export default AdminCleanupScreen;