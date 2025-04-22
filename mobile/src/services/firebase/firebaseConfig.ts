// src/services/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initializeFirestore
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsSrbbfnm5lRTxPfbaEmM-TgkwSLX5_NA",
  authDomain: "travel-together-7cd3d.firebaseapp.com",
  projectId: "travel-together-7cd3d",
  storageBucket: "travel-together-7cd3d.firebasestorage.app",
  messagingSenderId: "754602985143",
  appId: "1:754602985143:web:04977772096eb9054aaf32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore with specific settings for React Native
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // This can help with WebChannel issues
  useFetchStreams: false, // Disable Fetch streams for better compatibility
  cacheSizeBytes: 1048576 // 1MB cache (smaller cache for mobile)
});

// Initialize Storage
const storage = getStorage(app);

// Export instances
export { auth, db, storage };
export default app;