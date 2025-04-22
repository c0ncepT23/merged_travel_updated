// // import { db } from '../../services/firebase/firebaseConfig';
// // import { auth } from '../../services/firebase/firebaseConfig';
// // import { collection, doc, getDocs } from 'firebase/firestore';
// // import { serverTimestamp } from 'firebase/firestore';
// // import { writeBatch } from 'firebase/firestore';

// // // Collections
// // const DESTINATIONS_COLLECTION = 'destinations';

// // export const initializeDestinations = async () => {
// //   const destinationsCollection = collection(db, DESTINATIONS_COLLECTION);
  
// //   // Check if destinations already exist
// //   const snapshot = await getDocs(destinationsCollection);
// //   if (!snapshot.empty) {
// //     console.log('Destinations already initialized');
// //     return;
// //   }
  
// //   // Initialize with starter destinations
// //   const destinations = [
// //     {
// //       name: 'Thailand',
// //       country: 'Thailand',
// //       startDate: '2025-06-02',
// //       endDate: '2025-06-10',
// //       isActive: true,
// //       memberCount: 0,
// //       createdAt: serverTimestamp(),
// //       subDestinations: [
// //         { id: '101', name: 'Bangkok', memberCount: 0 },
// //         { id: '102', name: 'Phuket', memberCount: 0 },
// //         { id: '103', name: 'Chiang Mai', memberCount: 0 }
// //       ]
// //     },
// //     {
// //       name: 'Japan',
// //       country: 'Japan',
// //       startDate: '2025-07-15',
// //       endDate: '2025-07-25',
// //       isActive: true,
// //       memberCount: 0,
// //       createdAt: serverTimestamp(),
// //       subDestinations: [
// //         { id: '201', name: 'Tokyo', memberCount: 0 },
// //         { id: '202', name: 'Kyoto', memberCount: 0 },
// //         { id: '203', name: 'Osaka', memberCount: 0 }
// //       ]
// //     },
// //     {
// //       name: 'Italy',
// //       country: 'Italy',
// //       startDate: '2025-09-10',
// //       endDate: '2025-09-18',
// //       isActive: false,
// //       memberCount: 0,
// //       createdAt: serverTimestamp(),
// //       subDestinations: [
// //         { id: '301', name: 'Rome', memberCount: 0 },
// //         { id: '302', name: 'Florence', memberCount: 0 },
// //         { id: '303', name: 'Venice', memberCount: 0 }
// //       ]
// //     }
// //   ];
  
// //   // Add each destination to Firestore
// //   const batch = writeBatch(db);
  
// //   destinations.forEach(destination => {
// //     const docRef = doc(collection(db, 'destinations'));
// //     batch.set(docRef, destination);
// //   });
  
// //   await batch.commit();
// //   console.log('Destinations initialized successfully');
// // };

// // mobile/src/services/firebase/initializeData.ts
// import { db } from '../../services/firebase/firebaseConfig';
// import { auth } from '../../services/firebase/firebaseConfig';
// import { collection, doc, getDocs } from 'firebase/firestore';
// import { serverTimestamp } from 'firebase/firestore';
// import { writeBatch } from 'firebase/firestore';

// // Collections
// const DESTINATIONS_COLLECTION = 'destinations';

// export const initializeDestinations = async () => {
//   const destinationsCollection = collection(db, DESTINATIONS_COLLECTION);
  
//   // Check if destinations already exist
//   const snapshot = await getDocs(destinationsCollection);
//   if (!snapshot.empty) {
//     console.log('Destinations already initialized');
//     return;
//   }
  
//   // Initialize with only Thailand and Japan
//   const destinations = [
//     {
//       name: 'Thailand',
//       country: 'Thailand',
//       startDate: '2025-01-01',  // General dates as these are persistent groups
//       endDate: '2025-12-31',
//       isActive: true,
//       memberCount: 0,
//       createdAt: serverTimestamp(),
//       subDestinations: [
//         { id: '101', name: 'Bangkok', memberCount: 0 },
//         { id: '102', name: 'Phuket', memberCount: 0 },
//         { id: '103', name: 'Chiang Mai', memberCount: 0 },
//         { id: '104', name: 'Pattaya', memberCount: 0 },
//         { id: '105', name: 'Krabi', memberCount: 0 },
//         { id: '106', name: 'Koh Samui', memberCount: 0 }
//       ]
//     },
//     {
//       name: 'Japan',
//       country: 'Japan',
//       startDate: '2025-01-01',
//       endDate: '2025-12-31',
//       isActive: true,
//       memberCount: 0,
//       createdAt: serverTimestamp(),
//       subDestinations: [
//         { id: '201', name: 'Tokyo', memberCount: 0 },
//         { id: '202', name: 'Osaka', memberCount: 0 },
//         { id: '203', name: 'Kyoto', memberCount: 0 },
//         { id: '204', name: 'Hokkaido', memberCount: 0 },
//         { id: '205', name: 'Nagoya', memberCount: 0 },
//         { id: '206', name: 'Fukuoka', memberCount: 0 },
//         { id: '207', name: 'Hiroshima', memberCount: 0 },
//         { id: '208', name: 'Nara', memberCount: 0 },
//         { id: '209', name: 'Yokohama', memberCount: 0 },
//         { id: '210', name: 'Sapporo', memberCount: 0 }
//       ]
//     }
//   ];
  
//   // Add each destination to Firestore
//   const batch = writeBatch(db);
  
//   destinations.forEach(destination => {
//     const docRef = doc(collection(db, 'destinations'));
//     batch.set(docRef, destination);
//   });
  
//   await batch.commit();
//   console.log('Destinations initialized successfully');
// };

// mobile/src/services/firebase/initializeData.ts
import { db } from '../../services/firebase/firebaseConfig';
import { auth } from '../../services/firebase/firebaseConfig';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { writeBatch } from 'firebase/firestore';

// Collections
const DESTINATIONS_COLLECTION = 'destinations';

export const initializeDestinations = async () => {
  const destinationsCollection = collection(db, DESTINATIONS_COLLECTION);
  
  // Check if destinations already exist
  const snapshot = await getDocs(destinationsCollection);
  
  // If we have destinations but they're not the right ones, we need to clean up
  const existingDestinations = snapshot.docs.map(doc => doc.data().name);
  const hasOldData = existingDestinations.some(name => 
    !['Thailand', 'Japan'].includes(name)
  );
  
  if (!snapshot.empty && !hasOldData) {
    console.log('Correct destinations already initialized');
    return;
  }
  
  // Initialize with only Thailand and Japan
  const destinations = [
    {
      name: 'Thailand',
      country: 'Thailand',
      startDate: '2025-01-01',  // General dates as these are persistent groups
      endDate: '2025-12-31',
      isActive: true,
      memberCount: 0,
      createdAt: serverTimestamp(),
      subDestinations: [
        { id: '101', name: 'Bangkok', memberCount: 0 },
        { id: '102', name: 'Phuket', memberCount: 0 },
        { id: '103', name: 'Chiang Mai', memberCount: 0 },
        { id: '104', name: 'Pattaya', memberCount: 0 },
        { id: '105', name: 'Krabi', memberCount: 0 },
        { id: '106', name: 'Koh Samui', memberCount: 0 }
      ]
    },
    {
      name: 'Japan',
      country: 'Japan',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: true,
      memberCount: 0,
      createdAt: serverTimestamp(),
      subDestinations: [
        { id: '201', name: 'Tokyo', memberCount: 0 },
        { id: '202', name: 'Osaka', memberCount: 0 },
        { id: '203', name: 'Kyoto', memberCount: 0 },
        { id: '204', name: 'Hokkaido', memberCount: 0 },
        { id: '205', name: 'Nagoya', memberCount: 0 },
        { id: '206', name: 'Fukuoka', memberCount: 0 },
        { id: '207', name: 'Hiroshima', memberCount: 0 },
        { id: '208', name: 'Nara', memberCount: 0 },
        { id: '209', name: 'Yokohama', memberCount: 0 },
        { id: '210', name: 'Sapporo', memberCount: 0 }
      ]
    }
  ];
  
  // Add each destination to Firestore
  const batch = writeBatch(db);
  
  // Use predetermined IDs for consistency
  const thailandId = 'destination_thailand';
  const japanId = 'destination_japan';
  
  // Set Thailand
  const thailandRef = doc(db, DESTINATIONS_COLLECTION, thailandId);
  batch.set(thailandRef, {
    ...destinations[0],
    id: thailandId
  });
  
  // Set Japan
  const japanRef = doc(db, DESTINATIONS_COLLECTION, japanId);
  batch.set(japanRef, {
    ...destinations[1],
    id: japanId
  });
  
  await batch.commit();
  console.log('Destinations initialized successfully with Thailand and Japan only');
};