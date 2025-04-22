// src/services/firebase/storageService.ts
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { auth, storage } from './firebaseConfig';

export const storageService = {
  // Upload a file to Firebase Storage
  async uploadFile(uri: string, path: string, onProgress?: (progress: number) => void): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      // Create a reference to the file location
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `${path}/${currentUser.uid}/${filename}`);
      
      // For both iOS and Android, use a fetch blob approach
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload the file
      if (onProgress) {
        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
              onProgress(progress);
            }, 
            (error) => {
              reject(error);
            }, 
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, blob);
        return getDownloadURL(snapshot.ref);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Upload a document file
  async uploadDocumentFile(uri: string, documentType: string, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(uri, `documents/${documentType}`, onProgress);
  },

  // Upload a profile image
  async uploadProfileImage(uri: string, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(uri, 'profiles', onProgress);
  },

  // Delete a file from Storage
  async deleteFile(url: string): Promise<void> {
    try {
      // Extract the path from the URL
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf('o/') + 2;
      const endIndex = decodedUrl.indexOf('?');
      const path = decodedUrl.substring(startIndex, endIndex);
      
      const fileRef = ref(storage, path);
      return deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};