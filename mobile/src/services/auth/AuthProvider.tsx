// src/services/auth/AuthProvider.tsx
import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, AuthContextType } from './AuthContext';
import { auth } from '../firebase/firebaseConfig';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await AsyncStorage.setItem('userToken', token);
        } catch (error) {
          console.error('Error storing token:', error);
        }
      }
    });

    const checkToken = async () => {
      try {
        await AsyncStorage.getItem('userToken');
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken();
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log("AuthProvider: Starting signup for", email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created with ID:", userCredential.user.uid);
      
      if (userCredential.user) {
        console.log("Updating profile with name:", name);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Also create a user profile in Firestore
        try {
          // Import your user service
          const { userService } = require('../firebase/firestoreService');
          
          console.log("Creating initial profile in Firestore");
          await userService.createInitialProfile(userCredential.user.uid, { 
            name, 
            email 
          });
          console.log("Initial profile created successfully");
        } catch (profileError) {
          console.error("Error creating initial profile:", profileError);
          // We might still want to continue even if profile creation fails
        }
      }
      console.log("Signup process completed successfully");
    } catch (error) {
      console.error("Firebase auth signup error:", error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: { displayName?: string, photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, data);
      setUser({ ...auth.currentUser });
    } else {
      throw new Error('No authenticated user');
    }
  };

  const authContextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };