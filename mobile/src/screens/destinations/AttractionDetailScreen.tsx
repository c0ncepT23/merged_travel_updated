import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Import types
import { DestinationsStackParamList } from '../../navigation/DestinationsNavigator';
import { RootState } from '../../store/reducers';
import { Attraction } from '../../store/reducers/destinationReducer';

type AttractionDetailRouteProp = RouteProp<
  DestinationsStackParamList,
  'AttractionDetail'
>;

type AttractionDetailNavigationProp = StackNavigationProp<
  DestinationsStackParamList,
  'AttractionDetail'
>;

const AttractionDetailScreen: React.FC = () => {
  const route = useRoute<AttractionDetailRouteProp>();
  const navigation = useNavigation<AttractionDetailNavigationProp>();
  const { attractionId, destinationId } = route.params;
  
  const [loading, setLoading] = useState(true);
  
  // Get attraction from Redux store
  const attraction = useSelector((state: RootState) => {
    const attractions = state.destinations.attractions[destinationId] || [];
    return attractions.find(a => a.id === attractionId);
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
    if (attraction) {
      navigation.setOptions({
        title: attraction.name,
      });
    }
  }, [navigation, attraction]);
  
  const handleOpenMaps = () => {
    if (!attraction) return;
    
    const { latitude, longitude } = attraction.location;
    const url = Platform.select({
      ios: `maps:0,0?q=${attraction.name}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${attraction.name})`,
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
      });
    }
  };
  
  if (loading || !attraction) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading attraction details...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          {/* In a real app, load actual image from attraction.imageUrl */}
          <View style={styles.placeholderImage}>
            <Ionicons
              name={getCategoryIcon(attraction.category)}
              size={80}
              color="#CCCCCC"
            />
          </View>
          
          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingValue}>{attraction.rating.toFixed(1)}</Text>
              <Ionicons name="star" size={16} color="#FFD700" />
            </View>
            <Text style={styles.ratingLabel}>Rating</Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{attraction.name}</Text>
          
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Ionicons name={getCategoryIcon(attraction.category)} size={16} color="#0066CC" />
              <Text style={styles.categoryText}>{attraction.category}</Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {attraction.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{attraction.description}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practical Information</Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666666" />
              <Text style={styles.infoText}>
                {attraction.openingHours || 'Opening hours not available'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="pricetag-outline" size={20} color="#666666" />
              <Text style={styles.infoText}>
                {attraction.price || 'Price information not available'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#666666" />
              <Text style={styles.infoText}>
                Tap to view on map
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={handleOpenMaps}
        >
          <Ionicons name="map" size={20} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Historical':
      return 'business';
    case 'Religious':
      return 'home';
    case 'Shopping':
      return 'cart';
    case 'Museum':
      return 'school';
    case 'Nature':
      return 'leaf';
    case 'Food':
      return 'restaurant';
    default:
      return 'pin';
  }
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
  imageContainer: {
    height: 250,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra space for the footer
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F0FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tagChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  mapButton: {
    backgroundColor: '#0066CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AttractionDetailScreen;