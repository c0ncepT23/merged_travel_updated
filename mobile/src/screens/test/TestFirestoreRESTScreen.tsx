// src/screens/test/TestFirestoreRESTScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { firestoreREST } from '../../services/firebase/firestoreRestService';
import { documentService } from '../../services/firebase/firestoreService';
import { auth } from '../../services/firebase/firebaseConfig';

const TestFirestoreRESTScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [testResults, setTestResults] = useState<{test: string, success: boolean, message: string}[]>([]);
  
  const appendResult = (message: string) => {
    setResult(prev => prev + '\n' + message);
  };
  
  const addTestResult = (test: string, success: boolean, message: string) => {
    setTestResults(prev => [...prev, { test, success, message }]);
  };
  
  const clearResults = () => {
    setResult('');
    setTestResults([]);
  };
  
  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    try {
      appendResult(`\n=== Running ${testName} ===`);
      await testFunction();
      addTestResult(testName, true, 'Test passed');
      appendResult(`✅ ${testName} passed`);
    } catch (error: any) {
      addTestResult(testName, false, error.message);
      appendResult(`❌ ${testName} failed: ${error.message}`);
    }
  };
  
  const testRESTAPI = async () => {
    setLoading(true);
    clearResults();
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please login first');
        return;
      }
      
      // Test 1: Add Document (REST API)
      await runTest('Add Document (REST API)', async () => {
        const testDocument = {
          type: 'flight' as const,
          title: 'Test Flight REST',
          destination: 'Test Destination',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          fileUrl: 'test/file/url',
          status: 'pending' as const,
          uploadDate: new Date().toISOString(),
          details: {
            airline: 'Test Airline',
            flightNumber: 'TEST123'
          }
        };
        
        const document = await firestoreREST.documentService.addDocument(testDocument);
        appendResult(`Document added with ID: ${document.id}`);
      });
      
      // Test 2: Get User Documents (REST API)
      await runTest('Get User Documents (REST API)', async () => {
        const documents = await firestoreREST.documentService.getUserDocuments();
        appendResult(`Found ${documents.length} documents`);
      });
      
      // Test 3: Get Destinations (REST API)
      await runTest('Get Destinations (REST API)', async () => {
        const destinations = await firestoreREST.destinationService.getDestinations();
        appendResult(`Found ${destinations.length} destinations`);
      });
      
      // Test 4: Test Fallback Mechanism
      await runTest('Test Fallback to REST API', async () => {
        const testDocument = {
          type: 'hotel' as const,
          title: 'Test Hotel Fallback',
          destination: 'Test Destination',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          fileUrl: 'test/file/url',
          status: 'pending' as const,
          uploadDate: new Date().toISOString(),
          details: {
            hotelName: 'Test Hotel',
            bookingReference: 'BOOK123'
          }
        };
        
        // This will automatically use REST API if SDK fails
        const document = await documentService.addDocument(testDocument);
        appendResult(`Document added with fallback mechanism, ID: ${document.id}`);
      });
      
    } catch (error: any) {
      appendResult(`General Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const runAllTests = async () => {
    await testRESTAPI();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firestore REST API Tests</Text>
        <Text style={styles.subtitle}>Test the REST API fallback mechanism</Text>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.clearButton, loading && styles.buttonDisabled]}
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      {testResults.length > 0 && (
        <View style={styles.testResultsSummary}>
          <Text style={styles.summaryTitle}>Test Summary</Text>
          {testResults.map((result, index) => (
            <View key={index} style={styles.testResultItem}>
              <Text style={[
                styles.testResultStatus,
                result.success ? styles.success : styles.failure
              ]}>
                {result.success ? '✅' : '❌'}
              </Text>
              <Text style={styles.testResultName}>{result.test}</Text>
              <Text style={styles.testResultMessage}>{result.message}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Detailed Results:</Text>
        <Text style={styles.resultText}>{result}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#666666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testResultsSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  testResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testResultStatus: {
    width: 24,
    fontSize: 16,
  },
  testResultName: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    color: '#333333',
  },
  testResultMessage: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  success: {
    color: '#4CAF50',
  },
  failure: {
    color: '#F44336',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  resultText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'monospace',
  },
});

export default TestFirestoreRESTScreen;