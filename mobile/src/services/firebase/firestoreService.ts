// src/services/firebase/firestoreService.ts
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    serverTimestamp, 
    onSnapshot
  } from 'firebase/firestore';
  import { TravelDocument } from '../../store/reducers/profileReducer';
  import { auth, db } from './firebaseConfig';
  
  // Collections
  const USERS_COLLECTION = 'users';
  const DOCUMENTS_COLLECTION = 'travelDocuments';
  const DESTINATIONS_COLLECTION = 'destinations';
  const MESSAGES_COLLECTION = 'messages';
  
  // User Profile Service
  export const userService = {
    // Create or update user profile
    async updateUserProfile(userId: string, userData: any) {
      return setDoc(doc(db, USERS_COLLECTION, userId), userData, { merge: true });
    },
  
    // Get user profile
    async getUserProfile(userId: string) {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      return docSnap.exists() ? docSnap.data() : null;
    },
  
    // Create initial user profile after registration
    async createInitialProfile(userId: string, data: { name: string, email: string }) {
      const initialProfile = {
        id: userId,
        name: data.name,
        email: data.email,
        avatar: null,
        bio: '',
        country: '',
        languages: [],
        travelPreferences: [],
        tripCount: 0,
        createdAt: serverTimestamp(),
      };
  
      return this.updateUserProfile(userId, initialProfile);
    }
  };
  
  // Travel Document Service
  export const documentService = {
    // Add a new travel document
    async addDocument(document: TravelDocument) {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      const documentWithUser = {
        ...document,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), documentWithUser);
      
      return {
        id: docRef.id,
        ...documentWithUser
      };
    },
  
    // Get all documents for current user
    async getUserDocuments() {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
  
      const q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  
    // Get a single document by ID
    async getDocument(documentId: string) {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    },
  
    // Update a document
    async updateDocument(documentId: string, data: Partial<TravelDocument>) {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      return updateDoc(docRef, data);
    },
  
    // Delete a document
    async deleteDocument(documentId: string) {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      return deleteDoc(docRef);
    }
  };
  
  // Message Service for chat functionality
  export const messageService = {
    // Send a new message
    async sendMessage(groupId: string, message: any) {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      const messageData = {
        ...message,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };
      
      return addDoc(collection(db, MESSAGES_COLLECTION), messageData);
    },
  
    // Get messages for a destination group
    async getMessages(destinationId: string, subDestinationId?: string) {
      const groupId = subDestinationId 
        ? `${destinationId}_${subDestinationId}` 
        : destinationId;
      
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  
    // Subscribe to messages (for real-time updates)
    subscribeToMessages(destinationId: string, subDestinationId: string | undefined, callback: (messages: any[]) => void) {
      const groupId = subDestinationId 
        ? `${destinationId}_${subDestinationId}` 
        : destinationId;
      
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      return onSnapshot(q, snapshot => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(messages);
      });
    }
  };
  
  // Destination Service
  export const destinationService = {
    // Get all destinations
    async getDestinations() {
      const querySnapshot = await getDocs(collection(db, DESTINATIONS_COLLECTION));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  
    // Get a single destination
    async getDestination(destinationId: string) {
      const docRef = doc(db, DESTINATIONS_COLLECTION, destinationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    },
  
    // Join a destination group
    async joinDestination(destinationId: string, subDestinationId?: string) {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      const memberRef = doc(db, DESTINATIONS_COLLECTION, destinationId, 'members', currentUser.uid);
      
      return setDoc(memberRef, {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL,
        joinedAt: serverTimestamp(),
        subDestinations: subDestinationId ? [subDestinationId] : []
      }, { merge: true });
    },
  
    // Leave a destination group
    async leaveDestination(destinationId: string, subDestinationId?: string) {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      if (subDestinationId) {
        // Just leave the subdestination
        const memberRef = doc(db, DESTINATIONS_COLLECTION, destinationId, 'members', currentUser.uid);
        
        const memberDoc = await getDoc(memberRef);
        if (memberDoc.exists()) {
          const data = memberDoc.data();
          if (data && data.subDestinations) {
            const updatedSubDestinations = data.subDestinations.filter(
              (id: string) => id !== subDestinationId
            );
            
            if (updatedSubDestinations.length === 0) {
              // If no subdestinations left, leave the main destination
              return deleteDoc(memberRef);
            }
            
            return updateDoc(memberRef, {
              subDestinations: updatedSubDestinations
            });
          }
        }
      } else {
        // Leave the entire destination
        const memberRef = doc(db, DESTINATIONS_COLLECTION, destinationId, 'members', currentUser.uid);
        return deleteDoc(memberRef);
      }
    }
  };