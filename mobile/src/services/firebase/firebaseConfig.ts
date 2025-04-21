import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace this with your Firebase project configuration
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
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
// Enable offline persistence for Firestore
// firestore().settings({
//     persistence: true, // Enable offline cache
//   });

export default app;