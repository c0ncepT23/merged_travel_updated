// In src/store/actions/destinationActions.ts (create this file)
import { Dispatch } from 'redux';
import { destinationService } from '../../services/firebase/firestoreService';
import {
  FETCH_DESTINATIONS_REQUEST,
  FETCH_DESTINATIONS_SUCCESS,
  FETCH_DESTINATIONS_FAILURE,
  JOIN_DESTINATION_GROUP,
  LEAVE_DESTINATION_GROUP
} from '../reducers/destinationReducer';

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