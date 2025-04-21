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

// Import types
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import EmptyStateView from '../../components/common/EmptyStateView';

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

const PastTripsScreen: React.FC = () => {
  const navigation = useNavigation<PastTripsNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [pastTrips, setPastTrips] = useState<PastTrip[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call
    const loadPastTrips = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data
        const mockPastTrips: PastTrip[] = [
          {
            id: '1',
            destination: 'Paris',
            country: 'France',
            startDate: '2024-02-10',
            endDate: '2024-02-17',
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            companions: 34,
            places: 12
          },
          {
            id: '2',
            destination: 'Rome',
            country: 'Italy',
            startDate: '2023-10-05',
            endDate: '2023-10-12',
            imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
            companions: 42,
            places: 15
          },
          {
            id: '3',
            destination: 'Barcelona',
            country: 'Spain',
            startDate: '2023-07-18',
            endDate: '2023-07-25',
            imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
            companions: 28,
            places: 9
          },
          {
            id: '4',
            destination: 'Tokyo',
            country: 'Japan',
            startDate: '2023-04-02',
            endDate: '2023-04-10',
            imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
            companions: 51,
            places: 17
          },
          {
            id: '5',
            destination: 'New York',
            country: 'USA',
            startDate: '2023-01-14',
            endDate: '2023-01-21',
            imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
            companions: 47,
            places: 14
          }
        ];
        
        setPastTrips(mockPastTrips);
        setLoading(false);
      } catch (error) {
        console.error('Error loading past trips:', error);
        setLoading(false);
      }
    };
    
    loadPastTrips();
  }, []);
  
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