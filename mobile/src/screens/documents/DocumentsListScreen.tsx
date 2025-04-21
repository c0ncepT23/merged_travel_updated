import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import types and components
import { DocumentsStackParamList } from '../../navigation/DocumentsNavigator';
import { RootState } from '../../store/reducers';
import { TravelDocument } from '../../store/reducers/profileReducer';
import EmptyStateView from '../../components/common/EmptyStateView';
import { fetchUserDocuments } from '../../store/actions/profileActions';

type DocumentsScreenNavigationProp = StackNavigationProp<
  DocumentsStackParamList,
  'DocumentsList'
>;

const DocumentsListScreen: React.FC = () => {
  const navigation = useNavigation<DocumentsScreenNavigationProp>();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel'>('flight');
  const scrollX = React.useRef(new Animated.Value(0)).current;
  
  const windowWidth = Dimensions.get('window').width;

  const { travelDocuments, loading, error } = useSelector(
    (state: RootState) => state.profile
  );

  useEffect(() => {
    dispatch(fetchUserDocuments() as any);
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchUserDocuments() as any).finally(() => {
      setRefreshing(false);
    });
  };

  const handleDocumentPress = (document: TravelDocument) => {
    navigation.navigate('DocumentDetail', { documentId: document.id });
  };

  const handleUploadPress = () => {
    navigation.navigate('UploadDocument', { documentType: activeTab });
  };

  const flightDocuments = travelDocuments.filter(doc => doc.type === 'flight');
  const hotelDocuments = travelDocuments.filter(doc => doc.type === 'hotel');

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
    return format(new Date(date), 'MMM d, yyyy');
  };

  const renderFlightDocument = ({ item }: { item: TravelDocument }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(item)}
    >
      <View style={styles.documentIconContainer}>
        <Ionicons
          name={getDocumentIcon(item.type)}
          size={24}
          color="#0066CC"
        />
      </View>
      <View style={styles.documentContent}>
        <Text style={styles.documentTitle}>{item.title}</Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Airline: </Text>
          {item.details?.airline || 'Not specified'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Flight: </Text>
          {item.details?.flightNumber || 'Not specified'}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Destination: </Text>
          {item.destination}
        </Text>
        <Text style={styles.dateRangeText}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
      </View>
      <View style={styles.documentStatus}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderHotelDocument = ({ item }: { item: TravelDocument }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(item)}
    >
      <View style={styles.documentIconContainer}>
        <Ionicons
          name={getDocumentIcon(item.type)}
          size={24}
          color="#0066CC"
        />
      </View>
      <View style={styles.documentContent}>
        <Text style={styles.documentTitle}>{item.title}</Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Hotel: </Text>
          {item.details?.hotelName || 'Not specified'}
        </Text>
        {item.details?.bookingReference && (
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Booking Ref: </Text>
            {item.details.bookingReference}
          </Text>
        )}
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Location: </Text>
          {item.destination}
        </Text>
        <Text style={styles.dateRangeText}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
      </View>
      <View style={styles.documentStatus}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyFlightsList = () => (
    <EmptyStateView
      icon="airplane"
      title="No Flight Documents"
      message="Upload your flight tickets to join destination groups automatically."
      actionLabel="Upload Flight"
      onAction={() => navigation.navigate('UploadDocument', { documentType: 'flight' })}
    />
  );

  const renderEmptyHotelsList = () => (
    <EmptyStateView
      icon="bed"
      title="No Hotel Documents"
      message="Upload your hotel bookings to join destination groups automatically."
      actionLabel="Upload Hotel Booking"
      onAction={() => navigation.navigate('UploadDocument', { documentType: 'hotel' })}
    />
  );

  if (loading && travelDocuments.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading your documents...</Text>
      </View>
    );
  }

  if (error && travelDocuments.length === 0) {
    return (
      <EmptyStateView
        icon="alert-circle"
        title="Oops!"
        message={`Something went wrong: ${error}`}
        actionLabel="Try Again"
        onAction={() => dispatch(fetchUserDocuments() as any)}
      />
    );
  }

  // Tab component
  interface TabProps {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }

  const Tab: React.FC<TabProps> = ({ title, isActive, onPress }) => (
    <TouchableOpacity 
      style={[styles.tab, isActive && styles.activeTab]} 
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Your Travel Documents</Text>
        <Text style={styles.sectionSubtitle}>
          Upload travel documents to join destination groups automatically
        </Text>
        
        <View style={styles.tabsContainer}>
          <Tab 
            title="Flights" 
            isActive={activeTab === 'flight'} 
            onPress={() => setActiveTab('flight')} 
          />
          <Tab 
            title="Hotels" 
            isActive={activeTab === 'hotel'} 
            onPress={() => setActiveTab('hotel')} 
          />
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'flight' ? (
          flightDocuments.length === 0 ? (
            renderEmptyFlightsList()
          ) : (
            <FlatList
              data={flightDocuments}
              keyExtractor={(item) => item.id}
              renderItem={renderFlightDocument}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )
        ) : (
          hotelDocuments.length === 0 ? (
            renderEmptyHotelsList()
          ) : (
            <FlatList
              data={hotelDocuments}
              keyExtractor={(item) => item.id}
              renderItem={renderHotelDocument}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleUploadPress}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0066CC',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  content: {
    flex: 1,
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
  list: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#555555',
  },
  dateRangeText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  documentStatus: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    right: 24,
    bottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default DocumentsListScreen;