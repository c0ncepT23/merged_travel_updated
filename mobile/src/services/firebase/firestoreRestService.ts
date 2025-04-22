// src/services/firebase/firestoreRestService.ts
import { auth } from './firebaseConfig';
import { TravelDocument } from '../../store/reducers/profileReducer';
import { Attraction } from '../../store/reducers/destinationReducer';

const FIRESTORE_API_URL = 'https://firestore.googleapis.com/v1';
const PROJECT_ID = 'travel-together-7cd3d';

// Collections
const USERS_COLLECTION = 'users';
const DOCUMENTS_COLLECTION = 'travelDocuments';
const DESTINATIONS_COLLECTION = 'destinations';
const MESSAGES_COLLECTION = 'messages';
const ATTRACTIONS_COLLECTION = 'attractions';

// Helper function to get auth token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.getIdToken();
};

// Helper function to make REST API requests
const firestoreRequest = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  data?: any
) => {
  const token = await getAuthToken();
  
  const url = `${FIRESTORE_API_URL}/projects/${PROJECT_ID}/databases/(default)/documents${path}`;
  
  console.log(`Making ${method} request to:`, url);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const options: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Firestore REST API error:', errorData);
      throw new Error(errorData.error?.message || 'Firestore REST API request failed');
    }
    
    return method === 'DELETE' ? {} : await response.json();
  } catch (error) {
    console.error('Firestore REST API request failed:', error);
    throw error;
  }
};

// Convert JavaScript object to Firestore format
const convertToFirestoreDocument = (data: any) => {
  const fields: any = {};
  
  for (const key in data) {
    const value = data[key];
    
    if (value === null) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { integerValue: value.toString() };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { integerValue: item.toString() };
            if (typeof item === 'boolean') return { booleanValue: item };
            return { nullValue: null };
          })
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: convertToFirestoreDocument(value) } };
    }
  }
  
  return fields;
};

// Convert Firestore document to JavaScript object
const convertFromFirestoreDocument = (doc: any) => {
  const data: any = {};
  
  if (doc.fields) {
    for (const key in doc.fields) {
      const field = doc.fields[key];
      
      if ('stringValue' in field) {
        data[key] = field.stringValue;
      } else if ('integerValue' in field) {
        data[key] = parseInt(field.integerValue);
      } else if ('booleanValue' in field) {
        data[key] = field.booleanValue;
      } else if ('timestampValue' in field) {
        data[key] = field.timestampValue;
      } else if ('nullValue' in field) {
        data[key] = null;
      } else if ('arrayValue' in field) {
        data[key] = field.arrayValue.values?.map((item: any) => {
          if ('stringValue' in item) return item.stringValue;
          if ('integerValue' in item) return parseInt(item.integerValue);
          if ('booleanValue' in item) return item.booleanValue;
          return null;
        }) || [];
      } else if ('mapValue' in field) {
        data[key] = convertFromFirestoreDocument({ fields: field.mapValue.fields });
      }
    }
  }
  
  // If doc has a name (document path), extract the ID
  if (doc.name) {
    const parts = doc.name.split('/');
    data.id = parts[parts.length - 1];
  }
  
  return data;
};

// User Profile Service (REST API version)
export const userServiceREST = {
  async updateUserProfile(userId: string, userData: any) {
    const docData = {
      fields: convertToFirestoreDocument({
        ...userData,
        updatedAt: new Date().toISOString()
      })
    };
    
    return firestoreRequest('PATCH', `/${USERS_COLLECTION}/${userId}`, docData);
  },
  
  async getUserProfile(userId: string) {
    try {
      const doc = await firestoreRequest('GET', `/${USERS_COLLECTION}/${userId}`);
      return convertFromFirestoreDocument(doc);
    } catch (error) {
      return null;
    }
  },
  
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
      createdAt: new Date().toISOString(),
    };
    
    return this.updateUserProfile(userId, initialProfile);
  }
};

// Travel Document Service (REST API version)
export const documentServiceREST = {
  async addDocument(document: TravelDocument) {
    console.log('=== DocumentServiceREST.addDocument Started ===');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Creating document with ID:', docId);
    
    const documentData = {
      fields: convertToFirestoreDocument({
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
      })
    };
    
    try {
      await firestoreRequest('PATCH', `/${DOCUMENTS_COLLECTION}/${docId}`, documentData);
      
      return {
        id: docId,
        ...document,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      } as TravelDocument;
      
    } catch (error) {
      console.error('Error adding document via REST API:', error);
      throw error;
    }
  },
  
  async getUserDocuments() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    // Firestore REST API query structure
    const queryData = {
      structuredQuery: {
        from: [{ collectionId: DOCUMENTS_COLLECTION }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'userId' },
            op: 'EQUAL',
            value: { stringValue: currentUser.uid }
          }
        }
      }
    };
    
    try {
      const response = await firestoreRequest('POST', ':runQuery', queryData);
      
      return response
        .filter((item: any) => item.document)
        .map((item: any) => convertFromFirestoreDocument(item.document));
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  },
  
  async getDocument(documentId: string) {
    try {
      const doc = await firestoreRequest('GET', `/${DOCUMENTS_COLLECTION}/${documentId}`);
      return convertFromFirestoreDocument(doc);
    } catch (error) {
      return null;
    }
  },
  
  async updateDocument(documentId: string, data: Partial<TravelDocument>) {
    const docData = {
      fields: convertToFirestoreDocument({
        ...data,
        updatedAt: new Date().toISOString()
      })
    };
    
    return firestoreRequest('PATCH', `/${DOCUMENTS_COLLECTION}/${documentId}`, docData);
  },
  
  async deleteDocument(documentId: string) {
    return firestoreRequest('DELETE', `/${DOCUMENTS_COLLECTION}/${documentId}`);
  }
};

// Message Service (REST API version)
export const messageServiceREST = {
  async sendMessage(groupId: string, message: any) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      fields: convertToFirestoreDocument({
        ...message,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      })
    };
    
    return firestoreRequest('PATCH', `/${MESSAGES_COLLECTION}/${messageId}`, messageData);
  },
  
  async getMessages(destinationId: string, subDestinationId?: string) {
    const groupId = subDestinationId 
      ? `${destinationId}_${subDestinationId}` 
      : destinationId;
    
    const queryData = {
      structuredQuery: {
        from: [{ collectionId: MESSAGES_COLLECTION }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'groupId' },
            op: 'EQUAL',
            value: { stringValue: groupId }
          }
        },
        orderBy: [
          {
            field: { fieldPath: 'createdAt' },
            direction: 'DESCENDING'
          }
        ],
        limit: 50
      }
    };
    
    try {
      const response = await firestoreRequest('POST', ':runQuery', queryData);
      
      return response
        .filter((item: any) => item.document)
        .map((item: any) => convertFromFirestoreDocument(item.document));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
};

// Destination Service (REST API version)
export const destinationServiceREST = {
  async getDestinations() {
    const queryData = {
      structuredQuery: {
        from: [{ collectionId: DESTINATIONS_COLLECTION }]
      }
    };
    
    try {
      const response = await firestoreRequest('POST', ':runQuery', queryData);
      
      return response
        .filter((item: any) => item.document)
        .map((item: any) => convertFromFirestoreDocument(item.document));
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  },
  
  async getDestination(destinationId: string) {
    try {
      const doc = await firestoreRequest('GET', `/${DESTINATIONS_COLLECTION}/${destinationId}`);
      return convertFromFirestoreDocument(doc);
    } catch (error) {
      return null;
    }
  },
  
  async getAttractions(destinationId: string, subDestinationId?: string): Promise<Attraction[]> {
    const subcollectionPath = subDestinationId 
      ? `/${destinationId}/${subDestinationId}`
      : `/${destinationId}`;
    
    const queryData = {
      structuredQuery: {
        from: [{ 
          collectionId: ATTRACTIONS_COLLECTION,
          parent: `projects/${PROJECT_ID}/databases/(default)/documents/${DESTINATIONS_COLLECTION}${subcollectionPath}`
        }],
        orderBy: [
          {
            field: { fieldPath: 'rating' },
            direction: 'DESCENDING'
          }
        ]
      }
    };
    
    try {
      const response = await firestoreRequest('POST', ':runQuery', queryData);
      
      return response
        .filter((item: any) => item.document)
        .map((item: any) => convertFromFirestoreDocument(item.document)) as Attraction[];
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return [];
    }
  },
  
  async joinDestination(destinationId: string, subDestinationId?: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    const memberData = {
      fields: convertToFirestoreDocument({
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL,
        joinedAt: new Date().toISOString(),
        subDestinations: subDestinationId ? [subDestinationId] : []
      })
    };
    
    return firestoreRequest(
      'PATCH', 
      `/${DESTINATIONS_COLLECTION}/${destinationId}/members/${currentUser.uid}`, 
      memberData
    );
  },
  
  async leaveDestination(destinationId: string, subDestinationId?: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    if (subDestinationId) {
      try {
        // Get current member data
        const memberDoc = await firestoreRequest(
          'GET', 
          `/${DESTINATIONS_COLLECTION}/${destinationId}/members/${currentUser.uid}`
        );
        
        const memberData = convertFromFirestoreDocument(memberDoc);
        
        if (memberData && memberData.subDestinations) {
          const updatedSubDestinations = memberData.subDestinations.filter(
            (id: string) => id !== subDestinationId
          );
          
          if (updatedSubDestinations.length === 0) {
            // If no subdestinations left, leave the main destination
            return firestoreRequest(
              'DELETE', 
              `/${DESTINATIONS_COLLECTION}/${destinationId}/members/${currentUser.uid}`
            );
          }
          
          const updateData = {
            fields: convertToFirestoreDocument({
              ...memberData,
              subDestinations: updatedSubDestinations
            })
          };
          
          return firestoreRequest(
            'PATCH', 
            `/${DESTINATIONS_COLLECTION}/${destinationId}/members/${currentUser.uid}`, 
            updateData
          );
        }
      } catch (error) {
        console.error('Error leaving subdestination:', error);
        throw error;
      }
    } else {
      // Leave the entire destination
      return firestoreRequest(
        'DELETE', 
        `/${DESTINATIONS_COLLECTION}/${destinationId}/members/${currentUser.uid}`
      );
    }
  }
};

// Export all REST services
export const firestoreREST = {
  userService: userServiceREST,
  documentService: documentServiceREST,
  messageService: messageServiceREST,
  destinationService: destinationServiceREST
};