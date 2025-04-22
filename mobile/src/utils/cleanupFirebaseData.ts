// mobile/src/utils/cleanupFirebaseData.ts
import { db, auth } from '../services/firebase/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const cleanupFirebaseData = async () => {
  try {
    console.log('Starting Firebase cleanup...');
    
    // Collections to clean
    const collections = [
      'destinations',
      'users',
      'travelDocuments',
      'messages'
    ];
    
    for (const collectionName of collections) {
      console.log(`Cleaning ${collectionName}...`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      let count = 0;
      for (const document of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, document.id));
        count++;
      }
      
      console.log(`Deleted ${count} documents from ${collectionName}`);
    }
    
    console.log('Firebase cleanup completed!');
    return true;
  } catch (error) {
    console.error('Error cleaning Firebase data:', error);
    return false;
  }
};

// Function to reset the app to fresh state
export const resetAppData = async () => {
  try {
    // Clean Firebase collections
    await cleanupFirebaseData();
    
    // Sign out current user if any
    if (auth.currentUser) {
      await auth.signOut();
    }
    
    // Re-initialize with only Thailand and Japan
    const { initializeDestinations } = require('../services/firebase/initializeData');
    await initializeDestinations();
    
    console.log('App data reset completed!');
    return true;
  } catch (error) {
    console.error('Error resetting app data:', error);
    return false;
  }
};