//src/services/firebase/firestoreService.ts
import { 
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
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { TravelDocument } from '../../store/reducers/profileReducer';
import { Attraction } from '../../store/reducers/destinationReducer';
import { auth, db } from './firebaseConfig';
import { firestoreREST } from './firestoreRestService';

// Collections
const USERS_COLLECTION = 'users';
const DOCUMENTS_COLLECTION = 'travelDocuments';
const DESTINATIONS_COLLECTION = 'destinations';
const MESSAGES_COLLECTION = 'messages';
const ATTRACTIONS_COLLECTION = 'attractions';

// Force REST API mode for testing
const FORCE_REST_API = true; // Set to true to force REST API, false to use normal behavior

// Error handling function to detect WebChannel errors
const shouldUseRESTAPI = (error: any): boolean => {
  console.log('Checking error for REST fallback:', error.message || error);
  
  return (
    error.message?.includes('Failed to get document because the client is offline') ||
    error.message?.includes('WebChannel transport') ||
    error.message?.includes('RPC') ||
    error.message?.includes('stream') ||
    error.message?.includes('transport errored') ||
    error.message?.includes('Firestore') ||
    error.code === 'unavailable' ||
    error.code === 'failed-precondition' ||
    error.name === 'FirebaseError'
  );
};

// Wrapper function to automatically fallback to REST API on WebChannel errors
const withRESTFallback = async <T>(
  sdkOperation: () => Promise<T>,
  restOperation: () => Promise<T>
): Promise<T> => {
  // Force REST API mode for testing
  if (FORCE_REST_API) {
    console.log('=== FORCE REST API MODE ENABLED ===');
    try {
      const result = await restOperation();
      console.log('REST API operation successful!');
      return result;
    } catch (restError: any) {
      console.error('REST API failed:', restError.message || restError);
      throw restError;
    }
  }
  
  try {
    console.log('Attempting SDK operation...');
    return await sdkOperation();
  } catch (error: any) {
    console.log('SDK operation failed:', error.message || error);
    console.log('Error code:', error.code);
    console.log('Error name:', error.name);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    
    if (shouldUseRESTAPI(error)) {
      console.log('=== FALLING BACK TO REST API ===');
      try {
        const result = await restOperation();
        console.log('REST API operation successful!');
        return result;
      } catch (restError: any) {
        console.error('REST API also failed:', restError.message || restError);
        throw restError;
      }
    }
    
    console.log('Error does not match REST fallback criteria, throwing original error');
    throw error;
  }
};

// User Profile Service
export const userService = {
  // Create or update user profile
  async updateUserProfile(userId: string, userData: any) {
    return withRESTFallback(
      () => setDoc(doc(db, USERS_COLLECTION, userId), userData, { merge: true }),
      () => firestoreREST.userService.updateUserProfile(userId, userData)
    );
  },

  // Get user profile
  async getUserProfile(userId: string) {
    return withRESTFallback(
      async () => {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      },
      () => firestoreREST.userService.getUserProfile(userId)
    );
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
    
    // Create document ID upfront
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Creating document with ID:', docId);
    
    return withRESTFallback(
      async () => {
        // SDK approach with plain timestamps
        const documentData = {
          type: document.type,
          title: document.title,
          destination: document.destination,
          startDate: document.startDate,
          endDate: document.endDate,
          fileUrl: document.fileUrl,
          status: document.status || 'pending',
          uploadDate: new Date().toISOString(),
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
          details: document.details || {}
        };
        
        try {
          console.log('Attempting setDoc with SDK...');
          const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
          await setDoc(docRef, documentData);
          console.log('SDK setDoc successful');
          
          return {
            id: docId,
            ...documentData
          } as TravelDocument;
        } catch (innerError: any) {
          console.error('Inner SDK error:', innerError.message || innerError);
          console.error('Inner error type:', innerError.name);
          console.error('Inner error code:', innerError.code);
          throw innerError;
        }
      },
      () => {
        console.log('Using REST API directly for document creation');
        return firestoreREST.documentService.addDocument(document);
      }
    );
  },

  // Get all documents for current user
  async getUserDocuments() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    return withRESTFallback(
      async () => {
        const q = query(
          collection(db, DOCUMENTS_COLLECTION),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TravelDocument[];
      },
      () => firestoreREST.documentService.getUserDocuments()
    );
  },

  // Get a single document by ID
  async getDocument(documentId: string) {
    return withRESTFallback(
      async () => {
        const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) return null;
        
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as TravelDocument;
      },
      () => firestoreREST.documentService.getDocument(documentId)
    );
  },

  // Update a document
  async updateDocument(documentId: string, data: Partial<TravelDocument>) {
    return withRESTFallback(
      () => {
        const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
        return updateDoc(docRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
      },
      () => firestoreREST.documentService.updateDocument(documentId, data)
    );
  },

  // Add method to verify/approve a document
  async verifyDocument(documentId: string) {
    return this.updateDocument(documentId, {
      status: 'verified',
      verifiedAt: new Date().toISOString()
    });
  },

  // Add method to reject a document
  async rejectDocument(documentId: string, reason?: string) {
    return this.updateDocument(documentId, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });
  },

  // Delete a document
  async deleteDocument(documentId: string) {
    return withRESTFallback(
      () => {
        const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
        return deleteDoc(docRef);
      },
      () => firestoreREST.documentService.deleteDocument(documentId)
    );
  }
};

// Message Service for chat functionality
export const messageService = {
  // Send a new message
  async sendMessage(groupId: string, message: any) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    return withRESTFallback(
      () => {
        const messageData = {
          ...message,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        };
        
        return addDoc(collection(db, MESSAGES_COLLECTION), messageData);
      },
      () => firestoreREST.messageService.sendMessage(groupId, message)
    );
  },

  // Get messages for a destination group
  async getMessages(destinationId: string, subDestinationId?: string) {
    const groupId = subDestinationId 
      ? `${destinationId}_${subDestinationId}` 
      : destinationId;
    
    return withRESTFallback(
      async () => {
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
      () => firestoreREST.messageService.getMessages(destinationId, subDestinationId)
    );
  },

  // Subscribe to messages (for real-time updates)
  subscribeToMessages(destinationId: string, subDestinationId: string | undefined, callback: (messages: any[]) => void) {
    const groupId = subDestinationId 
      ? `${destinationId}_${subDestinationId}` 
      : destinationId;
    
    // For real-time updates, we'll fall back to polling with REST API
    let intervalId: NodeJS.Timeout | null = null;
    
    const startSDKSubscription = () => {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      // WebChannel errors often appear in onSnapshot, so let's handle them properly
      let hasSnapshot = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      const subscribe = () => {
        return onSnapshot(q, 
          snapshot => {
            hasSnapshot = true;
            attempts = 0; // Reset attempts on success
            const messages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            callback(messages);
          },
          error => {
            console.error('Snapshot error:', error);
            console.error('Error details:', error.message);
            
            // WebChannel errors often appear here
            if (!hasSnapshot && attempts < maxAttempts) {
              attempts++;
              console.log(`Attempt ${attempts} of ${maxAttempts} failed, retrying...`);
              setTimeout(subscribe, 1000 * attempts); // Exponential backoff
            } else {
              console.log('Falling back to REST API polling due to persistent errors');
              startRESTPolling();
            }
          }
        );
      };
      
      return subscribe();
    };
    
    const startRESTPolling = () => {
      // Stop any existing polling
      if (intervalId) clearInterval(intervalId);
      
      console.log('Starting REST API polling for messages...');
      
      // Initial fetch
      firestoreREST.messageService.getMessages(destinationId, subDestinationId)
        .then(messages => callback(messages))
        .catch(error => console.error('Initial REST fetch error:', error));
      
      // Poll every 3 seconds
      intervalId = setInterval(async () => {
        try {
          console.log('Polling for messages via REST API...');
          const messages = await firestoreREST.messageService.getMessages(destinationId, subDestinationId);
          callback(messages);
        } catch (error) {
          console.error('REST polling error:', error);
        }
      }, 3000);
    };
    
    // If force REST API mode is enabled, start polling directly
    if (FORCE_REST_API) {
      console.log('Force REST API mode: Starting REST polling directly');
      startRESTPolling();
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
    
    // Try SDK first
    const unsubscribe = startSDKSubscription();
    
    // Return a function to clean up both subscription and polling
    return () => {
      if (unsubscribe) unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }
};

// Destination Service
export const destinationService = {
  // Get all destinations
  async getDestinations() {
    return withRESTFallback(
      async () => {
        const querySnapshot = await getDocs(collection(db, DESTINATIONS_COLLECTION));
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      },
      () => firestoreREST.destinationService.getDestinations()
    );
  },

  // Get a single destination
  async getDestination(destinationId: string) {
    return withRESTFallback(
      async () => {
        const docRef = doc(db, DESTINATIONS_COLLECTION, destinationId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) return null;
        
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      },
      () => firestoreREST.destinationService.getDestination(destinationId)
    );
  },

  // Get attractions for a destination
  async getAttractions(destinationId: string, subDestinationId?: string): Promise<Attraction[]> {
    return withRESTFallback(
      async () => {
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
          return [];
        }
      },
      () => firestoreREST.destinationService.getAttractions(destinationId, subDestinationId)
    );
  },

  // Join a destination group
  async joinDestination(destinationId: string, subDestinationId?: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    return withRESTFallback(
      () => {
        const memberRef = doc(db, DESTINATIONS_COLLECTION, destinationId, 'members', currentUser.uid);
        
        return setDoc(memberRef, {
          userId: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL,
          joinedAt: new Date().toISOString(),
          subDestinations: subDestinationId ? [subDestinationId] : []
        }, { merge: true });
      },
      () => firestoreREST.destinationService.joinDestination(destinationId, subDestinationId)
    );
  },

  // Leave a destination group
  async leaveDestination(destinationId: string, subDestinationId?: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    return withRESTFallback(
      async () => {
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
      },
      () => firestoreREST.destinationService.leaveDestination(destinationId, subDestinationId)
    );
  }
};

