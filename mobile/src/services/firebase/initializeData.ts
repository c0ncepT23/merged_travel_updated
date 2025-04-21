import { db } from '../../services/firebase/firebaseConfig';
import { auth } from '../../services/firebase/firebaseConfig';
import { collection, doc, getDocs } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { writeBatch } from 'firebase/firestore';

// Collections
const DESTINATIONS_COLLECTION = 'destinations';

export const initializeDestinations = async () => {
  const destinationsCollection = collection(db, DESTINATIONS_COLLECTION);
  
  // Check if destinations already exist
  const snapshot = await getDocs(destinationsCollection);
  if (!snapshot.empty) {
    console.log('Destinations already initialized');
    return;
  }
  
  // Initialize with starter destinations
  const destinations = [
    {
      name: 'Thailand',
      country: 'Thailand',
      startDate: '2025-06-02',
      endDate: '2025-06-10',
      isActive: true,
      memberCount: 0,
      createdAt: serverTimestamp(),
      subDestinations: [
        { id: '101', name: 'Bangkok', memberCount: 0 },
        { id: '102', name: 'Phuket', memberCount: 0 },
        { id: '103', name: 'Chiang Mai', memberCount: 0 }
      ]
    },
    {
      name: 'Japan',
      country: 'Japan',
      startDate: '2025-07-15',
      endDate: '2025-07-25',
      isActive: true,
      memberCount: 0,
      createdAt: serverTimestamp(),
      subDestinations: [
        { id: '201', name: 'Tokyo', memberCount: 0 },
        { id: '202', name: 'Kyoto', memberCount: 0 },
        { id: '203', name: 'Osaka', memberCount: 0 }
      ]
    },
    {
      name: 'Italy',
      country: 'Italy',
      startDate: '2025-09-10',
      endDate: '2025-09-18',
      isActive: false,
      memberCount: 0,
      createdAt: serverTimestamp(),
      subDestinations: [
        { id: '301', name: 'Rome', memberCount: 0 },
        { id: '302', name: 'Florence', memberCount: 0 },
        { id: '303', name: 'Venice', memberCount: 0 }
      ]
    }
  ];
  
  // Add each destination to Firestore
  const batch = writeBatch(db);
  
  destinations.forEach(destination => {
    const docRef = doc(collection(db, 'destinations'));
    batch.set(docRef, destination);
  });
  
  await batch.commit();
  console.log('Destinations initialized successfully');
};