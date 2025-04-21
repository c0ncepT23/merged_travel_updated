import { Dispatch } from 'redux';
import { userService, documentService } from '../../services/firebase/firestoreService';
import { auth } from '../../services/firebase/firebaseConfig';
import {
  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
  UPLOAD_DOCUMENT_FAILURE
} from '../reducers/profileReducer';
import { TravelDocument } from '../reducers/profileReducer';

// Fetch user profile
export const fetchUserProfile = () => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PROFILE_REQUEST });
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const profile = await userService.getUserProfile(currentUser.uid);
      
      dispatch({
        type: FETCH_PROFILE_SUCCESS,
        payload: profile
      });
      
      // Also fetch user's travel documents
      dispatch(fetchUserDocuments());
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      dispatch({
        type: FETCH_PROFILE_FAILURE,
        payload: error instanceof Error ? error.message : String(error)
      });
    }
  };
};

// Update user profile
export const updateUserProfile = (profileData: any) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      await userService.updateUserProfile(currentUser.uid, profileData);
      
      dispatch({
        type: UPDATE_PROFILE_SUCCESS,
        payload: {
          ...profileData,
          id: currentUser.uid
        }
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch({
        type: UPDATE_PROFILE_FAILURE,
        payload: error instanceof Error ? error.message : String(error)
      });
    }
  };
};

// Upload travel document
export const uploadDocument = (documentData: Partial<TravelDocument>) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: UPLOAD_DOCUMENT_REQUEST });
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const document = await documentService.addDocument(documentData as TravelDocument);
      
      dispatch({
        type: UPLOAD_DOCUMENT_SUCCESS,
        payload: document
      });
      
      return document.id;
      
    } catch (error) {
      console.error('Error uploading document:', error);
      dispatch({
        type: UPLOAD_DOCUMENT_FAILURE,
        payload: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };
};

// Fetch user documents
export const fetchUserDocuments = () => {
  return async (dispatch: Dispatch) => {
    try {
      const documents = await documentService.getUserDocuments();
      
      documents.forEach(document => {
        dispatch({
          type: UPLOAD_DOCUMENT_SUCCESS,
          payload: document
        });
      });
      
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };
};