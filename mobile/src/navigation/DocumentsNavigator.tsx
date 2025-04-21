import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DocumentsListScreen from '../screens/documents/DocumentsListScreen';
import UploadDocumentScreen from '../screens/documents/UploadDocumentScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';

// Define parameter types for the navigation
export type DocumentsStackParamList = {
  DocumentsList: undefined;
  UploadDocument: { documentType?: 'flight' | 'hotel' | 'other' };
  DocumentDetail: { documentId: string };
};

const Stack = createStackNavigator<DocumentsStackParamList>();

const DocumentsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DocumentsList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066CC',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="DocumentsList" 
        component={DocumentsListScreen} 
        options={{ title: 'My Travel Documents' }}
      />
      <Stack.Screen 
        name="UploadDocument" 
        component={UploadDocumentScreen} 
        options={({ route }) => {
          const { documentType } = route.params || {};
          const title = documentType 
            ? `Upload ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}` 
            : 'Upload Document';
          return { title };
        }}
      />
      <Stack.Screen 
        name="DocumentDetail" 
        component={DocumentDetailScreen}
        options={{ title: 'Document Details' }}
      />
    </Stack.Navigator>
  );
};

export default DocumentsNavigator;