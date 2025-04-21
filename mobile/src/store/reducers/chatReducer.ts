import { AnyAction } from 'redux';

// Define action types
export const FETCH_MESSAGES_REQUEST = 'FETCH_MESSAGES_REQUEST';
export const FETCH_MESSAGES_SUCCESS = 'FETCH_MESSAGES_SUCCESS';
export const FETCH_MESSAGES_FAILURE = 'FETCH_MESSAGES_FAILURE';
export const SEND_MESSAGE_REQUEST = 'SEND_MESSAGE_REQUEST';
export const SEND_MESSAGE_SUCCESS = 'SEND_MESSAGE_SUCCESS';
export const SEND_MESSAGE_FAILURE = 'SEND_MESSAGE_FAILURE';
export const NEW_MESSAGE_RECEIVED = 'NEW_MESSAGE_RECEIVED';
export const SET_ACTIVE_CHAT = 'SET_ACTIVE_CHAT';

// Define message interface
export interface Message {
  id: string;
  text: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  destinationId: string;
  subDestinationId?: string;
}

// Define chat state interface
export interface ChatState {
  messages: { [groupId: string]: Message[] }; // Group ID can be destination ID or sub-destination ID
  activeChat: {
    destinationId: string;
    subDestinationId?: string;
  } | null;
  loading: boolean;
  error: string | null;
  sending: boolean;
}

// Initial state
const initialState: ChatState = {
  messages: {},
  activeChat: null,
  loading: false,
  error: null,
  sending: false,
};

// Chat reducer
const chatReducer = (
  state: ChatState = initialState,
  action: AnyAction
): ChatState => {
  switch (action.type) {
    case FETCH_MESSAGES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_MESSAGES_SUCCESS: {
      const { groupId, messages } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [groupId]: messages,
        },
        loading: false,
        error: null,
      };
    }
    case FETCH_MESSAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case SEND_MESSAGE_REQUEST:
      return {
        ...state,
        sending: true,
      };
    case SEND_MESSAGE_SUCCESS:
    case NEW_MESSAGE_RECEIVED: {
      const { groupId, message } = action.payload;
      const existingMessages = state.messages[groupId] || [];
      
      // Check if message already exists to prevent duplicates
      const isDuplicate = existingMessages.some(msg => msg.id === message.id);
      
      if (isDuplicate) {
        return state;
      }
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [groupId]: [message, ...existingMessages],
        },
        sending: false,
      };
    }
    case SEND_MESSAGE_FAILURE:
      return {
        ...state,
        sending: false,
        error: action.payload,
      };
    case SET_ACTIVE_CHAT:
      return {
        ...state,
        activeChat: action.payload,
      };
    default:
      return state;
  }
};

export default chatReducer;