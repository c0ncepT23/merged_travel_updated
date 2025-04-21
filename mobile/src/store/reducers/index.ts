import { combineReducers } from 'redux';
import authReducer from './authReducer';
import destinationReducer from './destinationReducer';
import chatReducer from './chatReducer';
import profileReducer from './profileReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  destinations: destinationReducer,
  chat: chatReducer,
  profile: profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;