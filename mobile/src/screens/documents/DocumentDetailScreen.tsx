// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
// } from 'react-native';
// import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { useSelector, useDispatch } from 'react-redux';
// import { Ionicons } from '@expo/vector-icons';
// import { format } from 'date-fns';

// // Import types
// import { DocumentsStackParamList } from '../../navigation/DocumentsNavigator';
// import { RootState } from '../../store/reducers';
// import { TravelDocument } from '../../store/reducers/profileReducer';
// import { documentService } from '../../services/firebase/firestoreService';
// import { storageService } from '../../services/firebase/storageService';
// import { useDocumentViewer } from '../../hooks/useDocumentViewer';
// import { verifyDocument, rejectDocument } from '../../store/actions/profileActions';

// type DocumentDetailRouteProp = RouteProp<
//   DocumentsStackParamList,
//   'DocumentDetail'
// >;

// type DocumentDetailNavigationProp = StackNavigationProp<
//   DocumentsStackParamList,
//   'DocumentDetail'
// >;

// const DocumentDetailScreen: React.FC = () => {
//   const route = useRoute<DocumentDetailRouteProp>();
//   const navigation = useNavigation<DocumentDetailNavigationProp>();
//   const dispatch = useDispatch();
//   const { documentId } = route.params;
  
//   const [loading, setLoading] = useState(true);
//   const { viewDocument, loading: viewingDocument } = useDocumentViewer();
  
//   // Get document from Redux store
//   const document = useSelector((state: RootState) => {
//     return state.profile.travelDocuments.find(doc => doc.id === documentId);
//   });
  
//   // Simulate loading data
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 800);
    
//     return () => clearTimeout(timer);
//   }, []);
  
//   // Set the navigation title
//   useEffect(() => {
//     if (document) {
//       navigation.setOptions({
//         title: document.title,
//       });
//     }
//   }, [navigation, document]);
  
//   const handleViewDocument = () => {
//     if (document && document.fileUrl) {
//       viewDocument(document.fileUrl);
//     } else {
//       Alert.alert(
//         'No Document',
//         'This document does not have an associated file.'
//       );
//     }
//   };
  
//   const handleVerifyDocument = async () => {
//     if (document) {
//       try {
//         await dispatch(verifyDocument(document.id));
//         Alert.alert('Success', 'Document has been verified!');
//       } catch (error) {
//         Alert.alert('Error', 'Failed to verify document');
//       }
//     }
//   };
  
//   const handleRejectDocument = async () => {
//     if (document) {
//       Alert.prompt(
//         'Reject Document',
//         'Enter rejection reason (optional):',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Reject',
//             style: 'destructive',
//             onPress: async (reason) => {
//               try {
//                 await dispatch(rejectDocument(document.id, reason));
//                 Alert.alert('Success', 'Document has been rejected');
//               } catch (error) {
//                 Alert.alert('Error', 'Failed to reject document');
//               }
//             }
//           }
//         ],
//         'plain-text'
//       );
//     }
//   };
  
//   const handleDeleteDocument = () => {
//     Alert.alert(
//       'Delete Document',
//       'Are you sure you want to delete this document? This action cannot be undone.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               if (document) {
//                 // Delete from Firestore
//                 await documentService.deleteDocument(document.id);
                
//                 // If there's a file URL, delete from Storage too
//                 if (document.fileUrl) {
//                   await storageService.deleteFile(document.fileUrl);
//                 }
                
//                 Alert.alert('Document Deleted', 'The document has been deleted.');
//                 navigation.goBack();
//               }
//             } catch (error) {
//               console.error('Error deleting document:', error);
//               Alert.alert('Error', 'Failed to delete the document. Please try again.');
//             }
//           },
//         },
//       ]
//     );
//   };
  
//   const getDocumentIcon = (type: string) => {
//     switch (type) {
//       case 'flight':
//         return 'airplane';
//       case 'hotel':
//         return 'bed';
//       default:
//         return 'document-text';
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'verified':
//         return '#4CAF50';
//       case 'pending':
//         return '#FFC107';
//       case 'rejected':
//         return '#F44336';
//       default:
//         return '#9E9E9E';
//     }
//   };
  
//   const formatDate = (date: string) => {
//     return format(new Date(date), 'MMMM d, yyyy');
//   };
  
//   if (loading || !document) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#0066CC" />
//         <Text style={styles.loadingText}>Loading document details...</Text>
//       </View>
//     );
//   }
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView style={styles.scrollView}>
//         <View style={styles.headerContainer}>
//           <View style={styles.documentIconContainer}>
//             <Ionicons
//               name={getDocumentIcon(document.type)}
//               size={32}
//               color="#0066CC"
//             />
//           </View>
          
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.title}>{document.title}</Text>
//             <Text style={styles.destination}>{document.destination}</Text>
            
//             <View style={styles.dateContainer}>
//               <Ionicons name="calendar-outline" size={16} color="#666666" />
//               <Text style={styles.dateText}>
//                 {formatDate(document.startDate)} - {formatDate(document.endDate)}
//               </Text>
//             </View>
//           </View>
//         </View>
        
//         <View style={styles.statusContainer}>
//           <Text style={styles.statusLabel}>Status</Text>
//           <View style={styles.statusBadgeContainer}>
//             <View
//               style={[
//                 styles.statusDot,
//                 { backgroundColor: getStatusColor(document.status) },
//               ]}
//             />
//             <Text style={styles.statusText}>{document.status}</Text>
//           </View>
          
//           <Text style={styles.statusDescription}>
//             {document.status === 'verified'
//               ? 'This document has been verified and you have been added to the destination group.'
//               : document.status === 'pending'
//               ? 'This document is being reviewed. You will be notified once it is verified.'
//               : 'This document has been rejected. Please upload a valid document.'}
//           </Text>
          
//           {document.status === 'rejected' && document.rejectionReason && (
//             <Text style={styles.rejectionReason}>
//               Reason: {document.rejectionReason}
//             </Text>
//           )}
//         </View>
        
//         {/* Admin verification buttons (for testing) */}
//         {__DEV__ && document.status === 'pending' && (
//           <View style={styles.adminSection}>
//             <Text style={styles.adminTitle}>Admin Actions (Dev Only)</Text>
//             <View style={styles.adminButtons}>
//               <TouchableOpacity
//                 style={[styles.adminButton, styles.verifyButton]}
//                 onPress={handleVerifyDocument}
//               >
//                 <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
//                 <Text style={styles.adminButtonText}>Verify</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.adminButton, styles.rejectButton]}
//                 onPress={handleRejectDocument}
//               >
//                 <Ionicons name="close-circle" size={20} color="#FFFFFF" />
//                 <Text style={styles.adminButtonText}>Reject</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Document Details</Text>
          
//           <View style={styles.detailItem}>
//             <Text style={styles.detailLabel}>Document Type</Text>
//             <Text style={styles.detailValue}>
//               {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
//             </Text>
//           </View>
          
//           <View style={styles.detailItem}>
//             <Text style={styles.detailLabel}>Upload Date</Text>
//             <Text style={styles.detailValue}>{formatDate(document.uploadDate)}</Text>
//           </View>
          
//           {document.verifiedAt && (
//             <View style={styles.detailItem}>
//               <Text style={styles.detailLabel}>Verified Date</Text>
//               <Text style={styles.detailValue}>{formatDate(document.verifiedAt)}</Text>
//             </View>
//           )}
          
//           {document.type === 'flight' && document.details && (
//             <>
//               <View style={styles.detailItem}>
//                 <Text style={styles.detailLabel}>Airline</Text>
//                 <Text style={styles.detailValue}>{document.details.airline}</Text>
//               </View>
              
//               <View style={styles.detailItem}>
//                 <Text style={styles.detailLabel}>Flight Number</Text>
//                 <Text style={styles.detailValue}>{document.details.flightNumber}</Text>
//               </View>
//             </>
//           )}
          
//           {document.type === 'hotel' && document.details && (
//             <>
//               <View style={styles.detailItem}>
//                 <Text style={styles.detailLabel}>Hotel Name</Text>
//                 <Text style={styles.detailValue}>{document.details.hotelName}</Text>
//               </View>
              
//               {document.details.bookingReference && (
//                 <View style={styles.detailItem}>
//                   <Text style={styles.detailLabel}>Booking Reference</Text>
//                   <Text style={styles.detailValue}>{document.details.bookingReference}</Text>
//                 </View>
//               )}
//             </>
//           )}
//         </View>
        
//         <View style={styles.actionContainer}>
//           <TouchableOpacity
//             style={styles.viewDocumentButton}
//             onPress={handleViewDocument}
//           >
//             <Ionicons name="document-outline" size={20} color="#FFFFFF" />
//             <Text style={styles.viewDocumentText}>View Document</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={handleDeleteDocument}
//           >
//             <Ionicons name="trash-outline" size={20} color="#F44336" />
//             <Text style={styles.deleteButtonText}>Delete Document</Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.noteContainer}>
//           <Text style={styles.noteText}>
//             Note: Deleting this document may remove you from associated destination groups.
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     padding: 20,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//   },
//   documentIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#E0F0FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   headerTextContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333333',
//     marginBottom: 4,
//   },
//   destination: {
//     fontSize: 16,
//     color: '#666666',
//     marginBottom: 8,
//   },
//   dateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#666666',
//     marginLeft: 6,
//   },
//   statusContainer: {
//     padding: 20,
//     backgroundColor: '#FFFFFF',
//     marginTop: 16,
//   },
//   statusLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333333',
//     marginBottom: 12,
//   },
//   statusBadgeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statusDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   statusText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#333333',
//     textTransform: 'capitalize',
//   },
//   statusDescription: {
//     fontSize: 14,
//     color: '#666666',
//     lineHeight: 20,
//   },
//   rejectionReason: {
//     fontSize: 14,
//     color: '#F44336',
//     fontStyle: 'italic',
//     marginTop: 8,
//   },
//   adminSection: {
//     padding: 20,
//     backgroundColor: '#F8F8F8',
//     marginTop: 16,
//   },
//   adminTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333333',
//     marginBottom: 12,
//   },
//   adminButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   adminButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     flex: 0.48,
//   },
//   verifyButton: {
//     backgroundColor: '#4CAF50',
//   },
//   rejectButton: {
//     backgroundColor: '#F44336',
//   },
//   adminButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   section: {
//     padding: 20,
//     backgroundColor: '#FFFFFF',
//     marginTop: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333333',
//     marginBottom: 16,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666666',
//   },
//   detailValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333333',
//   },
//   actionContainer: {
//     padding: 20,
//     backgroundColor: '#FFFFFF',
//     marginTop: 16,
//   },
//   viewDocumentButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#0066CC',
//     height: 48,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   viewDocumentText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   deleteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFFFFF',
//     height: 48,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#F44336',
//   },
//   deleteButtonText: {
//     color: '#F44336',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   noteContainer: {
//     padding: 20,
//     marginBottom: 16,
//   },
//   noteText: {
//     fontSize: 14,
//     color: '#999999',
//     fontStyle: 'italic',
//   },
// });

// export default DocumentDetailScreen;

// mobile/src/screens/documents/DocumentDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import types
import { DocumentsStackParamList } from '../../navigation/DocumentsNavigator';
import { RootState } from '../../store/reducers';
import { TravelDocument } from '../../store/reducers/profileReducer';
import { documentService } from '../../services/firebase/firestoreService';
import { storageService } from '../../services/firebase/storageService';
import { useDocumentViewer } from '../../hooks/useDocumentViewer';
import { verifyDocument, rejectDocument } from '../../store/actions/profileActions';
import ComingSoonView from '../../components/common/ComingSoonView';

type DocumentDetailRouteProp = RouteProp<
  DocumentsStackParamList,
  'DocumentDetail'
>;

type DocumentDetailNavigationProp = StackNavigationProp<
  DocumentsStackParamList,
  'DocumentDetail'
>;

const DocumentDetailScreen: React.FC = () => {
  const route = useRoute<DocumentDetailRouteProp>();
  const navigation = useNavigation<DocumentDetailNavigationProp>();
  const dispatch = useDispatch();
  const { documentId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [unsupportedDestination, setUnsupportedDestination] = useState<string>('');
  const { viewDocument, loading: viewingDocument } = useDocumentViewer();
  
  // Get document from Redux store
  const document = useSelector((state: RootState) => {
    return state.profile.travelDocuments.find(doc => doc.id === documentId);
  });
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Set the navigation title
  useEffect(() => {
    if (document) {
      navigation.setOptions({
        title: document.title,
      });
    }
  }, [navigation, document]);
  
  const handleViewDocument = () => {
    if (document && document.fileUrl) {
      viewDocument(document.fileUrl);
    } else {
      Alert.alert(
        'No Document',
        'This document does not have an associated file.'
      );
    }
  };
  
  const handleVerifyDocument = async () => {
    if (document) {
      try {
        await dispatch(verifyDocument(document.id));
        // Success alert is now handled in the action
      } catch (error: any) {
        if (error.type === 'UNSUPPORTED_DESTINATION') {
          // Show coming soon modal for unsupported destinations
          setUnsupportedDestination(document.destination);
          setShowComingSoon(true);
        } else {
          Alert.alert('Error', 'Failed to verify document');
        }
      }
    }
  };
  
  const handleRejectDocument = async () => {
    if (document) {
      Alert.prompt(
        'Reject Document',
        'Enter rejection reason (optional):',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async (reason) => {
              try {
                await dispatch(rejectDocument(document.id, reason));
                Alert.alert('Success', 'Document has been rejected');
              } catch (error) {
                Alert.alert('Error', 'Failed to reject document');
              }
            }
          }
        ],
        'plain-text'
      );
    }
  };
  
  const handleDeleteDocument = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (document) {
                // Delete from Firestore
                await documentService.deleteDocument(document.id);
                
                // If there's a file URL, delete from Storage too
                if (document.fileUrl) {
                  await storageService.deleteFile(document.fileUrl);
                }
                
                Alert.alert('Document Deleted', 'The document has been deleted.');
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete the document. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return 'airplane';
      case 'hotel':
        return 'bed';
      default:
        return 'document-text';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };
  
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };
  
  if (loading || !document) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading document details...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <View style={styles.documentIconContainer}>
            <Ionicons
              name={getDocumentIcon(document.type)}
              size={32}
              color="#0066CC"
            />
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{document.title}</Text>
            <Text style={styles.destination}>{document.destination}</Text>
            
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#666666" />
              <Text style={styles.dateText}>
                {formatDate(document.startDate)} - {formatDate(document.endDate)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(document.status) },
              ]}
            />
            <Text style={styles.statusText}>{document.status}</Text>
          </View>
          
          <Text style={styles.statusDescription}>
            {document.status === 'verified'
              ? 'This document has been verified and you have been added to the destination group.'
              : document.status === 'pending'
              ? 'This document is being reviewed. You will be notified once it is verified.'
              : 'This document has been rejected. Please upload a valid document.'}
          </Text>
          
          {document.status === 'rejected' && document.rejectionReason && (
            <Text style={styles.rejectionReason}>
              Reason: {document.rejectionReason}
            </Text>
          )}
        </View>
        
        {/* Admin verification buttons (for testing) */}
        {__DEV__ && document.status === 'pending' && (
          <View style={styles.adminSection}>
            <Text style={styles.adminTitle}>Admin Actions (Dev Only)</Text>
            <View style={styles.adminButtons}>
              <TouchableOpacity
                style={[styles.adminButton, styles.verifyButton]}
                onPress={handleVerifyDocument}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.adminButtonText}>Verify</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.adminButton, styles.rejectButton]}
                onPress={handleRejectDocument}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                <Text style={styles.adminButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Document Type</Text>
            <Text style={styles.detailValue}>
              {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Upload Date</Text>
            <Text style={styles.detailValue}>{formatDate(document.uploadDate)}</Text>
          </View>
          
          {document.verifiedAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Verified Date</Text>
              <Text style={styles.detailValue}>{formatDate(document.verifiedAt)}</Text>
            </View>
          )}
          
          {document.type === 'flight' && document.details && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Airline</Text>
                <Text style={styles.detailValue}>{document.details.airline}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Flight Number</Text>
                <Text style={styles.detailValue}>{document.details.flightNumber}</Text>
              </View>
            </>
          )}
          
          {document.type === 'hotel' && document.details && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hotel Name</Text>
                <Text style={styles.detailValue}>{document.details.hotelName}</Text>
              </View>
              
              {document.details.bookingReference && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Booking Reference</Text>
                  <Text style={styles.detailValue}>{document.details.bookingReference}</Text>
                </View>
              )}
            </>
          )}
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.viewDocumentButton}
            onPress={handleViewDocument}
          >
            <Ionicons name="document-outline" size={20} color="#FFFFFF" />
            <Text style={styles.viewDocumentText}>View Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteDocument}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete Document</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Note: Deleting this document may remove you from associated destination groups.
          </Text>
        </View>
      </ScrollView>
      
      {/* Coming Soon Modal */}
      <Modal
        visible={showComingSoon}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowComingSoon(false)}
      >
        <ComingSoonView
          destination={unsupportedDestination}
          onClose={() => setShowComingSoon(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  documentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  destination: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  statusContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#F44336',
    fontStyle: 'italic',
    marginTop: 8,
  },
  adminSection: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    marginTop: 16,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  viewDocumentText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noteContainer: {
    padding: 20,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});

export default DocumentDetailScreen;