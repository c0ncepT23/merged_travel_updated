import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import types and components
import { DestinationsStackParamList } from '../../navigation/DestinationsNavigator';
import { RootState } from '../../store/reducers';
import { Destination, SubDestination } from '../../store/reducers/destinationReducer';
import { joinDestinationGroup, leaveDestinationGroup } from '../../store/actions/destinationActions';

type DestinationDetailRouteProp = RouteProp<
  DestinationsStackParamList,
  'DestinationDetail'
>;

type DestinationDetailNavigationProp = StackNavigationProp<
  DestinationsStackParamList,
  'DestinationDetail'
>;

// Mock action for fetching destination details
const fetchDestinationDetails = (destinationId: string) => {
  return (dispatch: any, getState: any) => {
    // In a real app, this would fetch from an API
    // For now, we'll just filter from our mock data
    const { destinations } = getState().destinations;
    const destination = destinations.find(
      (dest: Destination) => dest.id === destinationId
    );
    
    // Set this destination as the current one
    if (destination) {
      dispatch({
        type: 'SET_CURRENT_DESTINATION',
        payload: destination,
      });
    }
  };
};

// Mock action for joining a sub-destination
const joinSubDestination = (
  destinationId: string,
  subDestinationId: string
) => {
  return {
    type: 'JOIN_DESTINATION_GROUP',
    payload: {
      destinationId,
      subDestinationId,
    },
  };
};

// Mock action for leaving a sub-destination
const leaveSubDestination = (
  destinationId: string,
  subDestinationId: string
) => {
  return {
    type: 'LEAVE_DESTINATION_GROUP',
    payload: {
      destinationId,
      subDestinationId,
      leaveMainGroup: false,
    },
  };
};

const DestinationDetailScreen: React.FC = () => {
  const route = useRoute<DestinationDetailRouteProp>();
  const navigation = useNavigation<DestinationDetailNavigationProp>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const { destinationId } = route.params;
  
  // Find the destination from the Redux store
  const destination = useSelector((state: RootState) =>
    state.destinations.destinations.find(dest => dest.id === destinationId)
  );

  useEffect(() => {
    if (destinationId) {
      // In a real app, we'd fetch detailed data here
      dispatch(fetchDestinationDetails(destinationId) as any);
    }
    
    // Set the navigation header title
    if (destination) {
      navigation.setOptions({
        title: destination.name,
        headerStyle: {
          backgroundColor: '#0066CC',
          elevation: 0,
          shadowOpacity: 0,
        },
      });
    }
  }, [destinationId, dispatch, navigation, destination?.name]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'MMMM d, yyyy');
    const end = format(new Date(endDate), 'MMMM d, yyyy');
    return `${start} - ${end}`;
  };

  const handleJoinSubDestination = (subDestination: SubDestination) => {
    setLoading(true);
    
    try {
      if (subDestination.isJoined) {
        dispatch(leaveDestinationGroup(destinationId, subDestination.id) as any)
          .finally(() => setLoading(false));
      } else {
        dispatch(joinDestinationGroup(destinationId, subDestination.id) as any)
          .finally(() => setLoading(false));
      }
    } catch (error) {
      console.error('Error toggling group membership:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to update group membership. Please try again.');
    }
  };

  const navigateToSubDestination = (subDestination: SubDestination) => {
    if (!destination) return;
    
    if (subDestination.isJoined) {
      // Navigate directly to chat if already joined
      navigateToChat(subDestination);
    } else {
      // Show join confirmation if not joined
      handleJoinSubDestination(subDestination);
    }
  };

  const navigateToChat = (subDestination: SubDestination) => {
    if (!destination) return;
    
    navigation.navigate('Chat', {
      destinationId,
      subDestinationId: subDestination.id,
      title: subDestination.name,
    });
  };

  const getRandomImageForDestination = (name: string): string => {
    // In a real app, you would have real images for each destination
    const destinations: {[key: string]: string} = {
      'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
      'Phuket': 'https://images.unsplash.com/photo-1589394815804-964ed0c6db0b',
      'Chiang Mai': 'https://images.unsplash.com/photo-1558005530-a7958896ec60',
      'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526',
      'Tokyo': 'https://images.unsplash.com/photo-1532236204992-f5e85c024202',
      'Kyoto': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9',
      'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549',
      'Japan': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989',
    };
    
    return destinations[name] || 'https://images.unsplash.com/photo-1528181304800-259b08848526';
  };

  if (!destination) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading destination details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ uri: getRandomImageForDestination(destination.name) }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>{destination.name}</Text>
            <Text style={styles.dates}>
              {formatDateRange(destination.startDate, destination.endDate)}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color="#FFFFFF" />
                <Text style={styles.statText}>{destination.memberCount} travelers</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
                <Text style={styles.statText}>
                  {destination.subDestinations.length} locations
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sub-Destinations</Text>
          <Text style={styles.sectionSubtitle}>
            Tap on a location to join the conversation
          </Text>
        </View>

        {destination.subDestinations.map(subDest => (
          <TouchableOpacity
            key={subDest.id}
            style={styles.subDestinationCard}
            onPress={() => navigateToSubDestination(subDest)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: getRandomImageForDestination(subDest.name) }} 
              style={styles.subDestImage}
            />
            <View style={styles.subDestContent}>
              <View style={styles.subDestMainInfo}>
                <Text style={styles.subDestName}>{subDest.name}</Text>
                <Text style={styles.subDestMemberCount}>
                  <Ionicons name="people" size={14} color="#666666" /> {subDest.memberCount} travelers
                </Text>
              </View>
              
              <View style={styles.subDestActions}>
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    subDest.isJoined ? styles.leaveButton : styles.joinButtonActive
                  ]}
                  onPress={() => handleJoinSubDestination(subDest)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={subDest.isJoined ? "#666666" : "#FFFFFF"} />
                  ) : (
                    <>
                      <Ionicons
                        name={subDest.isJoined ? 'exit-outline' : 'enter-outline'}
                        size={16}
                        color={subDest.isJoined ? '#666666' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          styles.joinButtonText,
                          subDest.isJoined ? styles.leaveButtonText : styles.joinButtonTextActive
                        ]}
                      >
                        {subDest.isJoined ? 'Leave' : 'Join'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {subDest.isJoined && (
              <View style={styles.joinedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.joinedBadgeText}>Joined</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You will automatically leave this group on{' '}
            {format(new Date(destination.endDate), 'MMMM d, yyyy')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
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
  header: {
    height: 220,
    backgroundColor: '#0066CC',
    position: 'relative',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    width: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 102, 204, 0.7)',
  },
  headerContent: {
    padding: 20,
    paddingTop: 50,
    height: '100%',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dates: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  subDestinationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  subDestImage: {
    width: 80,
    height: 80,
  },
  subDestContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subDestMainInfo: {
    flex: 1,
  },
  subDestName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  subDestMemberCount: {
    fontSize: 14,
    color: '#666666',
  },
  subDestActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 80,
  },
  joinButtonActive: {
    backgroundColor: '#0066CC',
  },
  leaveButton: {
    backgroundColor: '#F0F0F0',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  joinButtonTextActive: {
    color: '#FFFFFF',
  },
  leaveButtonText: {
    color: '#666666',
  },
  joinedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  joinedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 2,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default DestinationDetailScreen;