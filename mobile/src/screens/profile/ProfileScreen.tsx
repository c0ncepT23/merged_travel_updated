import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebase/firebaseConfig';

// Import components and types
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { RootState } from '../../store/reducers';
import { useAuth } from '../../hooks/useAuth';

// Import services and actions
import { fetchUserProfile } from '../../store/actions/profileActions';

type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Profile'
>;

// Mock action to fetch profile
const fetchProfile = () => {
  return (dispatch: any) => {
    dispatch({ type: 'FETCH_PROFILE_REQUEST' });
    
    // Simulate API call
    setTimeout(() => {
      const mockProfile = {
        id: 'user123',
        name: 'John Smith',
        email: 'john@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        coverPhoto: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
        bio: 'Travel enthusiast and food lover. Always looking for new adventures and authentic experiences around the world!',
        country: 'United States',
        languages: ['English', 'Spanish', 'French'],
        travelPreferences: ['Food', 'Culture', 'Nature', 'Adventure', 'Photography'],
        tripCount: 12,
        documents: 5,
        photos: 124,
        followers: 85,
        following: 112
      };
      
      dispatch({
        type: 'FETCH_PROFILE_SUCCESS',
        payload: mockProfile,
      });
    }, 1000);
  };
};

const { width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 84;
const PROFILE_IMAGE_MAX_SIZE = 100;
const PROFILE_IMAGE_MIN_SIZE = 40;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const { signOut } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const scrollY = new Animated.Value(0);
  
  const { profile, error } = useSelector(
    (state: RootState) => state.profile
  );
  
  const { destinations } = useSelector(
    (state: RootState) => state.destinations
  );
  
  useEffect(() => {
    // Fetch the user profile from Firestore
    dispatch(fetchUserProfile() as any);
  }, [dispatch]);
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const profileImageSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [PROFILE_IMAGE_MAX_SIZE, PROFILE_IMAGE_MIN_SIZE],
    extrapolate: 'clamp',
  });
  
  const profileImageMarginTop = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT - PROFILE_IMAGE_MAX_SIZE / 2, HEADER_MIN_HEIGHT - PROFILE_IMAGE_MIN_SIZE / 2],
    extrapolate: 'clamp',
  });
  
  const headerZIndex = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT + 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - 20, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };
  
  const handleSettings = () => {
    navigation.navigate('Settings');
  };
  
  const handlePastTrips = () => {
    navigation.navigate('PastTrips');
  };

  // Use this helper function to get initials if no avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error signing out:', error);
    }
  };
  
  const activeTrips = destinations.filter(dest => dest.isActive).length;
  const upcomingTrips = destinations.filter(dest => !dest.isActive).length;
  
  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>Error loading profile</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchProfile() as any)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight, 
            zIndex: headerZIndex,
          }
        ]}
      >
        <ImageBackground
          source={{ uri: profile.coverPhoto }}
          style={styles.coverPhoto}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSettings}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Animated.View 
            style={[
              styles.headerTitle,
              { opacity: headerTitleOpacity }
            ]}
          >
            <Text style={styles.headerTitleText}>{profile.name}</Text>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
      
      {/* Profile Image */}
      <Animated.View
        style={[
          styles.profileImageContainer,
          {
            width: profileImageSize,
            height: profileImageSize,
            borderRadius: profileImageSize,
            marginTop: profileImageMarginTop,
            borderWidth: 3,
          },
        ]}
      >
        {profile.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {profile.name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()}
            </Text>
          </View>
        )}
      </Animated.View>
      
      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{profile.name}</Text>
          <Text style={styles.emailText}>{profile.email}</Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#666666" />
            <Text style={styles.locationText}>{profile.country}</Text>
          </View>
          
          <Text style={styles.bioText}>{profile.bio}</Text>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color="#0066CC" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeTrips}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{upcomingTrips}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.tripCount}</Text>
            <Text style={styles.statLabel}>Past Trips</Text>
          </View>
        </View>
        
        {/* Languages */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.tagsContainer}>
            {profile.languages.map((language) => (
              <View key={language} style={styles.tag}>
                <Text style={styles.tagText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Travel Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          <View style={styles.tagsContainer}>
            {profile.travelPreferences.map((preference) => (
              <View key={preference} style={styles.tag}>
                <Text style={styles.tagText}>{preference}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePastTrips}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="airplane" size={20} color="#00ACC1" />
              </View>
              <Text style={styles.menuItemText}>Past Trips</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSettings}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="settings" size={20} color="#43A047" />
              </View>
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSignOut}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="log-out" size={20} color="#E53935" />
              </View>
              <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#999999" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Travel Together v1.0.0</Text>
        </View>
      </ScrollView>
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
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0066CC',
    overflow: 'hidden',
    zIndex: 1,
  },
  coverPhoto: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 56, // Space for profile image
  },
  profileImageContainer: {
    position: 'absolute',
    zIndex: 2,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: PROFILE_IMAGE_MAX_SIZE,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: PROFILE_IMAGE_MAX_SIZE,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: HEADER_MAX_HEIGHT + 20,
    paddingBottom: 20,
  },
  profileInfo: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginTop: PROFILE_IMAGE_MAX_SIZE / 2 + 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  bioText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F0FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#0066CC',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#EEEEEE',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E0F0FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  signOutText: {
    color: '#E53935',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
});

export default ProfileScreen;