import { AnyAction } from 'redux';

// Define action types
export const FETCH_DESTINATIONS_REQUEST = 'FETCH_DESTINATIONS_REQUEST';
export const FETCH_DESTINATIONS_SUCCESS = 'FETCH_DESTINATIONS_SUCCESS';
export const FETCH_DESTINATIONS_FAILURE = 'FETCH_DESTINATIONS_FAILURE';
export const JOIN_DESTINATION_GROUP = 'JOIN_DESTINATION_GROUP';
export const LEAVE_DESTINATION_GROUP = 'LEAVE_DESTINATION_GROUP';
export const FETCH_THINGS_TO_SEE_SUCCESS = 'FETCH_THINGS_TO_SEE_SUCCESS';
export const FETCH_THINGS_TO_SEE_FAILURE = 'FETCH_THINGS_TO_SEE_FAILURE';

// Define destination and attractions interfaces
export interface Destination {
  id: string;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  memberCount: number;
  subDestinations: SubDestination[];
}

export interface SubDestination {
  id: string;
  name: string;
  memberCount: number;
  isJoined: boolean;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  rating: number;
  openingHours?: string;
  price?: string;
  tags: string[];
}

// Define destination state interface
export interface DestinationState {
  destinations: Destination[];
  currentDestination: Destination | null;
  attractions: { [destinationId: string]: Attraction[] };
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DestinationState = {
  destinations: [],
  currentDestination: null,
  attractions: {},
  loading: false,
  error: null,
};

// Destination reducer
const destinationReducer = (
  state: DestinationState = initialState,
  action: AnyAction
): DestinationState => {
  switch (action.type) {
    case FETCH_DESTINATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_DESTINATIONS_SUCCESS:
      return {
        ...state,
        destinations: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_DESTINATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case JOIN_DESTINATION_GROUP:
      return {
        ...state,
        destinations: state.destinations.map(destination => {
          if (destination.id === action.payload.destinationId) {
            // Join main destination
            return {
              ...destination,
              isActive: true,
              memberCount: destination.memberCount + 1,
              // Update sub-destination if applicable
              subDestinations: destination.subDestinations.map(subDest => {
                if (subDest.id === action.payload.subDestinationId) {
                  return {
                    ...subDest,
                    isJoined: true,
                    memberCount: subDest.memberCount + 1,
                  };
                }
                return subDest;
              }),
            };
          }
          return destination;
        }),
      };
    case LEAVE_DESTINATION_GROUP:
      return {
        ...state,
        destinations: state.destinations.map(destination => {
          if (destination.id === action.payload.destinationId) {
            // Leave main destination
            const leaveMain = action.payload.leaveMainGroup;
            return {
              ...destination,
              isActive: leaveMain ? false : destination.isActive,
              memberCount: leaveMain ? destination.memberCount - 1 : destination.memberCount,
              // Update sub-destination if applicable
              subDestinations: destination.subDestinations.map(subDest => {
                if (subDest.id === action.payload.subDestinationId) {
                  return {
                    ...subDest,
                    isJoined: false,
                    memberCount: subDest.memberCount - 1,
                  };
                }
                return subDest;
              }),
            };
          }
          return destination;
        }),
      };
    case FETCH_THINGS_TO_SEE_SUCCESS:
      return {
        ...state,
        attractions: {
          ...state.attractions,
          [action.payload.destinationId]: action.payload.attractions,
        },
        loading: false,
        error: null,
      };
    case FETCH_THINGS_TO_SEE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default destinationReducer;