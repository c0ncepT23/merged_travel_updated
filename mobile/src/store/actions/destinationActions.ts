// // In src/store/actions/destinationActions.ts
// import { Dispatch } from 'redux';
// import { destinationService } from '../../services/firebase/firestoreService';
// import {
//   FETCH_DESTINATIONS_REQUEST,
//   FETCH_DESTINATIONS_SUCCESS,
//   FETCH_DESTINATIONS_FAILURE,
//   JOIN_DESTINATION_GROUP,
//   LEAVE_DESTINATION_GROUP,
//   FETCH_THINGS_TO_SEE_SUCCESS,
//   FETCH_THINGS_TO_SEE_FAILURE
// } from '../reducers/destinationReducer';
// import { Attraction } from '../reducers/destinationReducer';

// // Fetch all destinations
// export const fetchDestinations = () => {
//   return async (dispatch: Dispatch) => {
//     dispatch({ type: FETCH_DESTINATIONS_REQUEST });
    
//     try {
//       const destinations = await destinationService.getDestinations();
      
//       dispatch({
//         type: FETCH_DESTINATIONS_SUCCESS,
//         payload: destinations
//       });
//     } catch (error) {
//       console.error('Error fetching destinations:', error);
//       dispatch({
//         type: FETCH_DESTINATIONS_FAILURE,
//         payload: error.message
//       });
//     }
//   };
// };

// // Join a destination group
// export const joinDestinationGroup = (destinationId: string, subDestinationId?: string) => {
//   return async (dispatch: Dispatch) => {
//     try {
//       await destinationService.joinDestination(destinationId, subDestinationId);
      
//       dispatch({
//         type: JOIN_DESTINATION_GROUP,
//         payload: {
//           destinationId,
//           subDestinationId,
//         }
//       });
//     } catch (error) {
//       console.error('Error joining destination:', error);
//       throw error;
//     }
//   };
// };

// // Leave a destination group
// export const leaveDestinationGroup = (destinationId: string, subDestinationId?: string, leaveMainGroup: boolean = false) => {
//   return async (dispatch: Dispatch) => {
//     try {
//       await destinationService.leaveDestination(destinationId, subDestinationId);
      
//       dispatch({
//         type: LEAVE_DESTINATION_GROUP,
//         payload: {
//           destinationId,
//           subDestinationId,
//           leaveMainGroup
//         }
//       });
//     } catch (error) {
//       console.error('Error leaving destination:', error);
//       throw error;
//     }
//   };
// };

// // Fetch attractions for a destination
// export const fetchAttractions = (destinationId: string, subDestinationId?: string) => {
//   return async (dispatch: Dispatch) => {
//     dispatch({ type: 'FETCH_THINGS_TO_SEE_REQUEST' });
    
//     try {
//       // Get attractions from API or service
//       const attractions = await destinationService.getAttractions(destinationId, subDestinationId);
      
//       dispatch({
//         type: FETCH_THINGS_TO_SEE_SUCCESS,
//         payload: {
//           destinationId,
//           attractions,
//         },
//       });
//     } catch (error) {
//       console.error('Error fetching attractions:', error);
//       dispatch({
//         type: FETCH_THINGS_TO_SEE_FAILURE,
//         payload: error.message,
//       });
//     }
//   };
// };

// export const autoJoinDestinationsFromDocument = (document: TravelDocument) => {
//   return async (dispatch: Dispatch) => {
//     try {
//       // Get all destinations first
//       const destinations = await destinationService.getDestinations();
      
//       // Find matching destinations
//       const matchedDestinations = destinations.filter(destination => {
//         const docStart = new Date(document.startDate);
//         const docEnd = new Date(document.endDate);
//         const destStart = new Date(destination.startDate);
//         const destEnd = new Date(destination.endDate);
        
//         // Check if location matches
//         const locationMatch = 
//           document.destination.toLowerCase().includes(destination.name.toLowerCase()) ||
//           destination.name.toLowerCase().includes(document.destination.toLowerCase()) ||
//           document.destination.toLowerCase().includes(destination.country.toLowerCase()) ||
//           destination.country.toLowerCase().includes(document.destination.toLowerCase());
        
//         // Check if dates overlap
//         const datesOverlap = docStart <= destEnd && docEnd >= destStart;
        
//         return locationMatch && datesOverlap;
//       });
      
//       // Auto-join each matched destination
//       for (const destination of matchedDestinations) {
//         let subDestId = undefined;
        
//         // Find matching sub-destination if applicable
//         if (document.type === 'flight' || document.type === 'hotel') {
//           const subDest = destination.subDestinations?.find(sub => 
//             sub.name.toLowerCase().includes(document.destination.toLowerCase()) ||
//             document.destination.toLowerCase().includes(sub.name.toLowerCase())
//           );
          
//           if (subDest) {
//             subDestId = subDest.id;
//           }
//         }
        
//         // Dispatch join action
//         await dispatch(joinDestinationGroup(destination.id, subDestId) as any);
//       }
      
//       // Refresh destinations to reflect new memberships
//       dispatch(fetchDestinations() as any);
      
//     } catch (error) {
//       console.error('Error auto-joining destinations:', error);
//       throw error;
//     }
//   };
// };

// mobile/src/store/actions/destinationActions.ts
import { Dispatch } from 'redux';
import { destinationService } from '../../services/firebase/firestoreService';
import {
  FETCH_DESTINATIONS_REQUEST,
  FETCH_DESTINATIONS_SUCCESS,
  FETCH_DESTINATIONS_FAILURE,
  JOIN_DESTINATION_GROUP,
  LEAVE_DESTINATION_GROUP,
  FETCH_THINGS_TO_SEE_SUCCESS,
  FETCH_THINGS_TO_SEE_FAILURE,
  DOCUMENT_VERIFIED_JOIN_GROUP
} from '../reducers/destinationReducer';
import { Attraction } from '../reducers/destinationReducer';

// List of supported destinations
const SUPPORTED_DESTINATIONS = [
  'thailand',
  'japan',
  'bangkok',
  'phuket',
  'chiang mai',
  'pattaya',
  'krabi',
  'koh samui',
  'tokyo',
  'osaka',
  'kyoto',
  'hokkaido',
  'nagoya',
  'fukuoka',
  'hiroshima',
  'nara',
  'yokohama',
  'sapporo'
];

// Fetch all destinations
export const fetchDestinations = () => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_DESTINATIONS_REQUEST });
    
    try {
      const destinations = await destinationService.getDestinations();
      
      dispatch({
        type: FETCH_DESTINATIONS_SUCCESS,
        payload: destinations
      });
    } catch (error) {
      console.error('Error fetching destinations:', error);
      dispatch({
        type: FETCH_DESTINATIONS_FAILURE,
        payload: error.message
      });
    }
  };
};

// Join a destination group
export const joinDestinationGroup = (destinationId: string, subDestinationId?: string) => {
  return async (dispatch: Dispatch) => {
    try {
      await destinationService.joinDestination(destinationId, subDestinationId);
      
      dispatch({
        type: JOIN_DESTINATION_GROUP,
        payload: {
          destinationId,
          subDestinationId,
        }
      });
    } catch (error) {
      console.error('Error joining destination:', error);
      throw error;
    }
  };
};

// Leave a destination group
export const leaveDestinationGroup = (destinationId: string, subDestinationId?: string, leaveMainGroup: boolean = false) => {
  return async (dispatch: Dispatch) => {
    try {
      await destinationService.leaveDestination(destinationId, subDestinationId);
      
      dispatch({
        type: LEAVE_DESTINATION_GROUP,
        payload: {
          destinationId,
          subDestinationId,
          leaveMainGroup
        }
      });
    } catch (error) {
      console.error('Error leaving destination:', error);
      throw error;
    }
  };
};

// Auto-join destination when document is verified
export const autoJoinDestinationAfterVerification = (documentData: {
  destination: string,
  startDate: string,
  endDate: string,
  type: string
}) => {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      const { destination, startDate, endDate } = documentData;
      const destinationLower = destination.toLowerCase();
      
      // Check if destination is supported
      const isSupportedDestination = SUPPORTED_DESTINATIONS.includes(destinationLower);
      
      if (!isSupportedDestination) {
        // Handle unsupported destination - show coming soon
        dispatch({
          type: 'UNSUPPORTED_DESTINATION',
          payload: {
            destination,
            message: `${destination} groups are coming soon!`
          }
        });
        return;
      }
      
      // Get all destinations from store
      const state = getState();
      const destinations = state.destinations.destinations;
      
      // Find matching main destination (Thailand or Japan)
      let mainDestination = null;
      let subDestinationData = null;
      
      // Check if it's a sub-destination (specific city)
      if (destinationLower !== 'thailand' && destinationLower !== 'japan') {
        // Find which main destination contains this city
        mainDestination = destinations.find((d: any) => 
          d.subDestinations?.some((sub: any) => 
            sub.name.toLowerCase() === destinationLower
          )
        );
        
        if (mainDestination) {
          subDestinationData = mainDestination.subDestinations.find(
            (sub: any) => sub.name.toLowerCase() === destinationLower
          );
        }
      } else {
        // It's a main destination (Thailand or Japan)
        mainDestination = destinations.find(
          (d: any) => d.name.toLowerCase() === destinationLower
        );
      }
      
      if (mainDestination) {
        // Join the destination group
        const mainDestinationId = mainDestination.id;
        const subDestinationId = subDestinationData?.id;
        
        await destinationService.joinDestination(mainDestinationId, subDestinationId);
        
        dispatch({
          type: DOCUMENT_VERIFIED_JOIN_GROUP,
          payload: {
            destinationId: mainDestinationId,
            destinationName: mainDestination.name,
            country: mainDestination.country,
            subDestinationId,
            startDate,
            endDate
          }
        });
        
        return {
          success: true,
          destinationId: mainDestinationId,
          subDestinationId
        };
      } else {
        // Main destination not found (shouldn't happen with Thailand/Japan)
        throw new Error('Destination not found');
      }
      
    } catch (error) {
      console.error('Error auto-joining destination:', error);
      throw error;
    }
  };
};

// Fetch attractions for a destination
export const fetchAttractions = (destinationId: string, subDestinationId?: string) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: 'FETCH_THINGS_TO_SEE_REQUEST' });
    
    try {
      // Get attractions from API or service
      const attractions = await destinationService.getAttractions(destinationId, subDestinationId);
      
      dispatch({
        type: FETCH_THINGS_TO_SEE_SUCCESS,
        payload: {
          destinationId,
          attractions,
        },
      });
    } catch (error) {
      console.error('Error fetching attractions:', error);
      dispatch({
        type: FETCH_THINGS_TO_SEE_FAILURE,
        payload: error.message,
      });
    }
  };
};