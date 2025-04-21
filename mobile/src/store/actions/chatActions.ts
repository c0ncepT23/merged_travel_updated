import { Dispatch } from 'redux';
import { messageService } from '../../services/firebase/firestoreService';
import { auth } from '../../services/firebase/firebaseConfig';
import {
  FETCH_MESSAGES_REQUEST,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILURE,
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
  NEW_MESSAGE_RECEIVED,
  SET_ACTIVE_CHAT
} from '../reducers/chatReducer';

// Fetch messages for a destination group
export const fetchMessages = (destinationId: string, subDestinationId?: string) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_MESSAGES_REQUEST });
    
    try {
      const messages = await messageService.getMessages(destinationId, subDestinationId);
      const groupId = subDestinationId ? `${destinationId}_${subDestinationId}` : destinationId;
      
      dispatch({
        type: FETCH_MESSAGES_SUCCESS,
        payload: {
          groupId,
          messages
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      dispatch({
        type: FETCH_MESSAGES_FAILURE,
        payload: error instanceof Error ? error.message : String(error)
      });
    }
  };
};

// Subscribe to real-time message updates
export const subscribeToMessages = (destinationId: string, subDestinationId?: string) => {
  return (dispatch: Dispatch) => {
    const groupId = subDestinationId ? `${destinationId}_${subDestinationId}` : destinationId;
    
    // Set active chat
    dispatch({
      type: SET_ACTIVE_CHAT,
      payload: {
        destinationId,
        subDestinationId
      }
    });
    
    // Setup Firestore listener
    const unsubscribe = messageService.subscribeToMessages(
      destinationId, 
      subDestinationId,
      (messages) => {
        dispatch({
          type: FETCH_MESSAGES_SUCCESS,
          payload: {
            groupId,
            messages
          }
        });
      }
    );
    
    // Return unsubscribe function so it can be called when component unmounts
    return unsubscribe;
  };
};

// Send a message
export const sendMessage = (destinationId: string, subDestinationId: string | undefined, text: string) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: SEND_MESSAGE_REQUEST });
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const groupId = subDestinationId ? `${destinationId}_${subDestinationId}` : destinationId;
      
      // Extract hashtags from message
      const HASHTAG_REGEX = /#(\w+)/g;
      const hashtags: string[] = [];
      let match;
      while ((match = HASHTAG_REGEX.exec(text)) !== null) {
        hashtags.push(match[1]);
      }
      
      // Create message object
      const messageData = {
        text,
        groupId,
        destinationId,
        subDestinationId,
        hashtags,
        user: {
          id: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          avatar: currentUser.photoURL,
        }
      };
      
      // Add message to Firestore
      await messageService.sendMessage(groupId, messageData);
      
      dispatch({ type: SEND_MESSAGE_SUCCESS });
      
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: SEND_MESSAGE_FAILURE,
        payload: error instanceof Error ? error.message : String(error)
      });
    }
  };
};