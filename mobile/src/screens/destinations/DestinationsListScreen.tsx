import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import types
import { RootState } from '../../store/reducers';
import { DestinationsStackParamList } from '../../navigation/DestinationsNavigator';
import { Destination } from '../../store/reducers/destinationReducer';

// Import components
import EmptyStateView from '../../components/common/EmptyStateView';
import { fetchDestinations } from '../../store/actions/destinationActions';

type DestinationsScreenNavigationProp = StackNavigationProp<DestinationsStackParamList, 'DestinationsList'>;

const DestinationsListScreen: React.FC = () => {
  const navigation = useNavigation<DestinationsScreenNavigationProp>();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { destinations, loading, error } = useSelector(
    (state: RootState) => state.destinations
  );

  useEffect(() => {
    dispatch(fetchDestinations() as any);
  }, [dispatch]);
  
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchDestinations() as any).finally(() => {
      setRefreshing(false);
    });
  };

  const handleDestinationPress = (destination: Destination) => {
    navigation.navigate('DestinationDetail', { destinationId: destination.id });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'MMM d');
    const end = format(new Date(endDate), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };

  // Render each destination item
  const renderDestinationItem = ({ item }: { item: Destination }) => {
    // Add null check for subDestinations
    const activeJoinedSubdestinations = item.subDestinations?.filter(
      sub => sub?.isJoined === true
    ).length || 0;
    
    return (
      <TouchableOpacity
        style={styles.destinationCard}
        onPress={() => handleDestinationPress(item)}
      >
        <View style={styles.destinationHeader}>
          <Text style={styles.destinationName}>{item.name}</Text>
          <View style={[
            styles.statusBadge, 
            item.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Active' : 'Upcoming'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.dateRange}>
          {formatDateRange(item.startDate, item.endDate)}
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.memberCount || 0} travelers</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.statText}>
              {activeJoinedSubdestinations > 0 
                ? `${activeJoinedSubdestinations} sub-destinations` 
                : 'No sub-destinations joined'}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.subDestRow}>
            {(item.subDestinations || []).slice(0, 3).map((subDest) => {
              // Add null check for subDest
              if (!subDest) return null;
              
              return (
                <View 
                  key={subDest.id} 
                  style={[
                    styles.subDestChip,
                    subDest.isJoined ? styles.joinedChip : styles.notJoinedChip
                  ]}
                >
                  <Text 
                    style={[
                      styles.subDestText,
                      subDest.isJoined ? styles.joinedText : styles.notJoinedText
                    ]}
                  >
                    {subDest.name}
                  </Text>
                </View>
              );
            })}
            {item.subDestinations && item.subDestinations.length > 3 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreText}>
                  +{item.subDestinations.length - 3}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && destinations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading your destinations...</Text>
      </View>
    );
  }

  if (error && destinations.length === 0) {
    return (
      <EmptyStateView
        icon="alert-circle"
        title="Oops!"
        message={`Something went wrong: ${error}`}
        actionLabel="Try Again"
        onAction={() => dispatch(fetchDestinations() as any)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {destinations.length === 0 ? (
        <EmptyStateView
          icon="airplane"
          title="No Destinations Yet"
          message="Upload your travel documents to join destination groups automatically."
          actionLabel="Upload Documents"
          onAction={() => navigation.navigate('Documents' as any)}
        />
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item) => item.id}
          renderItem={renderDestinationItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
  list: {
    padding: 16,
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E0F7E0',
  },
  inactiveBadge: {
    backgroundColor: '#FFE8D9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subDestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  subDestChip: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  joinedChip: {
    backgroundColor: '#E0F0FF',
  },
  notJoinedChip: {
    backgroundColor: '#F0F0F0',
  },
  subDestText: {
    fontSize: 12,
    fontWeight: '500',
  },
  joinedText: {
    color: '#0066CC',
  },
  notJoinedText: {
    color: '#666',
  },
  moreChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DestinationsListScreen;