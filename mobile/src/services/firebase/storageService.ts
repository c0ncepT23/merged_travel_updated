// src/services/firebase/storageService.ts
import { 
    getStorage, 
    ref, 
    uploadString, 
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
      
      // Create a reference to the file location
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `${path}/${currentUser.uid}/${filename}`);
      
      // For iOS, we need to read the file into a blob before uploading
      if (Platform.OS === 'ios') {
        const fileBlob = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        
        // Upload the Base64 string
        const snapshot = await uploadString(storageRef, fileBlob, 'base64');
        return getDownloadURL(snapshot.ref);
      } else {
        // For Android, use a fetch blob approach
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Create upload task
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        // Monitor upload progress
        if (onProgress) {
          uploadTask.on('state_changed', snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
            onProgress(progress);
          });
        }
        
        // Wait for upload to complete
        return new Promise((resolve, reject) => {
          uploadTask.then(snapshot => {
            getDownloadURL(snapshot.ref).then(downloadURL => {
              resolve(downloadURL);
            });
          }).catch(error => {
            reject(error);
          });
        });
      }
    },
  
    // Upload a document file
    async uploadDocumentFile(uri: string, documentType: string, onProgress?: (progress: number) => void): Promise<string> {
      return this.uploadFile(uri, 'documents/' + documentType, onProgress);
    },
  
    // Upload a profile image
    async uploadProfileImage(uri: string, onProgress?: (progress: number) => void): Promise<string> {
      return this.uploadFile(uri, 'profiles', onProgress);
    },
  
    // Delete a file from Storage
    async deleteFile(url: string): Promise<void> {
      // Extract the path from the URL
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf('o/') + 2;
      const endIndex = decodedUrl.indexOf('?');
      const path = decodedUrl.substring(startIndex, endIndex);
      
      const fileRef = ref(storage, path);
      return deleteObject(fileRef);
    }
  };