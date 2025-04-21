// Create a new file src/hooks/useDocumentViewer.ts
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Alert } from 'react-native';

export const useDocumentViewer = () => {
  const [loading, setLoading] = useState(false);
  
  const viewDocument = async (url: string) => {
    if (!url) {
      Alert.alert('Error', 'No document URL provided');
      return;
    }
    
    try {
      setLoading(true);
      
      if (Platform.OS === 'ios') {
        // For iOS, simply open the URL in a web browser
        await WebBrowser.openBrowserAsync(url);
      } else {
        // For Android, download the file first, then open it
        const filename = url.substring(url.lastIndexOf('/') + 1);
        const localPath = `${FileSystem.cacheDirectory}${filename}`;
        
        // Download the file
        const { uri } = await FileSystem.downloadAsync(url, localPath);
        
        // Get the file's MIME type
        const fileInfo = await FileSystem.getInfoAsync(uri);
        let mimeType = 'application/pdf'; // Default to PDF
        
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else if (filename.endsWith('.png')) {
          mimeType = 'image/png';
        }
        
        // Open the file with the appropriate app
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: uri,
          flags: 1,
          type: mimeType,
        });
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', 'Failed to open document');
    } finally {
      setLoading(false);
    }
  };
  
  return { viewDocument, loading };
};