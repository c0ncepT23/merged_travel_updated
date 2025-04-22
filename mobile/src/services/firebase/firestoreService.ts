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
import { Attraction } from '../../store/reducers/destinationReducer';
import { auth, db } from './firebaseConfig';

// Collections
const USERS_COLLECTION = 'users';
const DOCUMENTS_COLLECTION = 'travelDocuments';
const DESTINATIONS_COLLECTION = 'destinations';
const MESSAGES_COLLECTION = 'messages';
const ATTRACTIONS_COLLECTION = 'attractions';

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
    console.log('=== DocumentService.addDocument Started ===');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No current user found in auth');
      throw new Error('User not authenticated');
    }
    console.log('Current user ID:', currentUser.uid);
    
    const documentWithUser = {
      ...document,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    };
    console.log('Document with user info:', documentWithUser);
    
    try {
      console.log('Attempting to add document to collection:', DOCUMENTS_COLLECTION);
      console.log('Firestore instance:', db ? 'exists' : 'null');
      console.log('Starting addDoc operation at:', new Date().toISOString());
      
      const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), documentWithUser);
      
      console.log('Document successfully added at:', new Date().toISOString());
      console.log('Document reference ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...documentWithUser
      };
    } catch (firestoreError) {
      console.error('=== Firestore addDoc Error ===');
      console.error('Error code:', firestoreError.code);
      console.error('Error message:', firestoreError.message);
      console.error('Full error:', firestoreError);
      throw firestoreError;
    }
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

  // Get attractions for a destination
  async getAttractions(destinationId: string, subDestinationId?: string): Promise<Attraction[]> {
    const queryLocation = subDestinationId 
      ? `${destinationId}/${subDestinationId}` 
      : destinationId;
    
    const q = query(
      collection(db, DESTINATIONS_COLLECTION, queryLocation, ATTRACTIONS_COLLECTION),
      orderBy('rating', 'desc')
    );
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Attraction[];
    } catch (error) {
      console.error('Error fetching attractions:', error);
      // If there's an error (likely because the subcollection doesn't exist),
      // return an empty array instead of throwing
      return [];
    }
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