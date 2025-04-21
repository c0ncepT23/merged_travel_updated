import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';

// Import types
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import EmptyStateView from '../../components/common/EmptyStateView';
import { RootState } from '../../store/reducers';

type PastTripsNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'PastTrips'
>;

interface PastTrip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  companions: number;
  places: number;
}

// Define an action creator to fetch past trips
const fetchPastTrips = () => {
  return async (dispatch: any) => {
    dispatch({ type: 'FETCH_PAST_TRIPS_REQUEST' });
    
    try {
      // Call your API service to get past trips
      const response = await fetch('your-api-endpoint/past-trips');
      const data = await response.json();
      
      dispatch({
        type: 'FETCH_PAST_TRIPS_SUCCESS',
        payload: data
      });
    } catch (error) {
      console.error('Error fetching past trips:', error);
      dispatch({
        type: 'FETCH_PAST_TRIPS_FAILURE',
        payload: error.message
      });
    }
  };
};

const PastTripsScreen: React.FC = () => {
  const navigation = useNavigation<PastTripsNavigationProp>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // Get past trips from Redux state (add this to your store if needed)
  const pastTrips = useSelector((state: RootState) => state.profile.pastTrips || []);
  const error = useSelector((state: RootState) => state.profile.error);

  useEffect(() => {
    const loadPastTrips = async () => {
      try {
        // Dispatch action to load past trips
        await dispatch(fetchPastTrips());
        setLoading(false);
      } catch (error) {
        console.error('Error loading past trips:', error);
        setLoading(false);
      }
    };
    
    loadPastTrips();
  }, [dispatch]);
  
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'MMM d');
    const end = format(new Date(endDate), 'MMM d, yyyy');
    return `${start} - ${end}`;
  };
  
  const getTimePassed = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - end.getFullYear()) * 12 + 
                       (now.getMonth() - end.getMonth());
                       
    if (monthsDiff < 1) {
      return 'Less than a month ago';
    } else if (monthsDiff === 1) {
      return '1 month ago';
    } else if (monthsDiff < 12) {
      return `${monthsDiff} months ago`;
    } else if (monthsDiff === 12) {
      return '1 year ago';
    } else {
      return `${Math.floor(monthsDiff / 12)} years ago`;
    }
  };
  
  const renderTripItem = ({ item }: { item: PastTrip }) => (
    <TouchableOpacity style={styles.tripCard}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.tripImage}
      />
      <View style={styles.tripOverlay} />
      
      <View style={styles.tripContent}>
        <View style={styles.tripHeader}>
          <View>
            <Text style={styles.tripDestination}>{item.destination}</Text>
            <Text style={styles.tripCountry}>{item.country}</Text>
          </View>
          <View style={styles.timePassedContainer}>
            <Text style={styles.timePassedText}>{getTimePassed(item.endDate)}</Text>
          </View>
        </View>
        
        <View style={styles.tripInfo}>
          <Text style={styles.tripDates}>
            {formatDateRange(item.startDate, item.endDate)}
          </Text>
          
          <View style={styles.tripStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#FFFFFF" />
              <Text style={styles.statText}>{item.companions} travelers</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="map" size={16} color="#FFFFFF" />
              <Text style={styles.statText}>{item.places} places</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading your past trips...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <EmptyStateView
        icon="alert-circle"
        title="Error Loading Trips"
        message={`Something went wrong: ${error}`}
        actionLabel="Try Again"
        onAction={() => dispatch(fetchPastTrips())}
      />
    );
  }
  
  if (pastTrips.length === 0) {
    return (
      <EmptyStateView
        icon="airplane"
        title="No Past Trips"
        message="Your completed trips will appear here."
        actionLabel="Go to Destinations"
        onAction={() => navigation.navigate('Profile')}
      />
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pastTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Travel Memories</Text>
            <Text style={styles.headerSubtitle}>Look back at all the amazing places you've explored</Text>
          </View>
        }
      />
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
    color: '#666666',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingBottom: 20,
  },
  tripCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  tripImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tripOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  tripContent: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tripCountry: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timePassedContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timePassedText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tripDates: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tripStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
});

export default PastTripsScreen;