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
  UPLOAD_DOCUMENT_FAILURE,
  VERIFY_DOCUMENT_SUCCESS,
  REJECT_DOCUMENT_SUCCESS
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
    console.log('=== UploadDocument Action Started ===');
    dispatch({ type: UPLOAD_DOCUMENT_REQUEST });
    
    try {
      console.log('Checking authentication status...');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }
      console.log('User authenticated:', currentUser.uid);
      
      console.log('Calling documentService.addDocument with data:', documentData);
      console.log('Starting Firestore operation at:', new Date().toISOString());
      
      const document = await documentService.addDocument(documentData as TravelDocument);
      
      console.log('Document added successfully at:', new Date().toISOString());
      console.log('Document ID:', document.id);
      
      dispatch({
        type: UPLOAD_DOCUMENT_SUCCESS,
        payload: document
      });
      
      return document.id;
      
    } catch (error) {
      console.error('=== Error in UploadDocument Action ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
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

// Verify a document
export const verifyDocument = (documentId: string) => {
  return async (dispatch: Dispatch) => {
    try {
      await documentService.verifyDocument(documentId);
      
      dispatch({
        type: VERIFY_DOCUMENT_SUCCESS,
        payload: {
          id: documentId,
          verifiedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  };
};

// Reject a document
export const rejectDocument = (documentId: string, reason?: string) => {
  return async (dispatch: Dispatch) => {
    try {
      await documentService.rejectDocument(documentId, reason);
      
      dispatch({
        type: REJECT_DOCUMENT_SUCCESS,
        payload: {
          id: documentId,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        }
      });
      
    } catch (error) {
      console.error('Error rejecting document:', error);
      throw error;
    }
  };
};