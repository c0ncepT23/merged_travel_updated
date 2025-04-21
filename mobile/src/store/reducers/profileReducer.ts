import { AnyAction } from 'redux';

// Define action types
export const FETCH_PROFILE_REQUEST = 'FETCH_PROFILE_REQUEST';
export const FETCH_PROFILE_SUCCESS = 'FETCH_PROFILE_SUCCESS';
export const FETCH_PROFILE_FAILURE = 'FETCH_PROFILE_FAILURE';
export const UPDATE_PROFILE_REQUEST = 'UPDATE_PROFILE_REQUEST';
export const UPDATE_PROFILE_SUCCESS = 'UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_FAILURE = 'UPDATE_PROFILE_FAILURE';
export const UPLOAD_DOCUMENT_REQUEST = 'UPLOAD_DOCUMENT_REQUEST';
export const UPLOAD_DOCUMENT_SUCCESS = 'UPLOAD_DOCUMENT_SUCCESS';
export const UPLOAD_DOCUMENT_FAILURE = 'UPLOAD_DOCUMENT_FAILURE';

// Define travel document interface
export interface TravelDocument {
  id: string;
  type: 'flight' | 'hotel' | 'other';
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  fileUrl: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  details?: {
    flightNumber?: string;
    airline?: string;
    hotelName?: string;
    bookingReference?: string;
  };
}

// Define profile state interface
export interface ProfileState {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    country?: string;
    languages: string[];
    travelPreferences: string[];
    tripCount: number;
  } | null;
  travelDocuments: TravelDocument[];
  loading: boolean;
  error: string | null;
  uploadingDocument: boolean;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  travelDocuments: [],
  loading: false,
  error: null,
  uploadingDocument: false,
};

// Profile reducer
const profileReducer = (
  state: ProfileState = initialState,
  action: AnyAction
): ProfileState => {
  switch (action.type) {
    case FETCH_PROFILE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PROFILE_SUCCESS:
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_PROFILE_FAILURE:
    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case UPLOAD_DOCUMENT_REQUEST:
      return {
        ...state,
        uploadingDocument: true,
        error: null,
      };
    case UPLOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        travelDocuments: [...state.travelDocuments, action.payload],
        uploadingDocument: false,
        error: null,
      };
    case UPLOAD_DOCUMENT_FAILURE:
      return {
        ...state,
        uploadingDocument: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default profileReducer;