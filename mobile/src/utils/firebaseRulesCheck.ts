// src/utils/firebaseRulesCheck.ts
import { auth, db } from '../services/firebase/firebaseConfig';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

export const checkFirebaseRules = async (): Promise<{
  canWrite: boolean;
  error?: string;
}> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { canWrite: false, error: 'User not authenticated' };
    }

    // Attempt to write a test document
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      test: true,
      userId: currentUser.uid,
      timestamp: new Date()
    });

    // If successful, immediately delete the test document
    await deleteDoc(doc(db, 'test', testDoc.id));

    return { canWrite: true };
  } catch (error) {
    console.error('Firebase rules check failed:', error);
    return { 
      canWrite: false, 
      error: (error as any).code === 'permission-denied'
        ? 'Firebase rules do not allow writes. Please check your Firestore rules.'
        : (error as any).message
    };
  }
};