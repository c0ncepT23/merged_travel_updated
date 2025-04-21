import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Import components and types
import { DestinationsStackParamList } from '../../navigation/DestinationsNavigator';
import { RootState } from '../../store/reducers';
import { Attraction } from '../../store/reducers/destinationReducer';
import EmptyStateView from '../../components/common/EmptyStateView';

type ThingsToSeeRouteProp = RouteProp<DestinationsStackParamList, 'ThingsToSee'>;
type ThingsToSeeNavigationProp = StackNavigationProp<DestinationsStackParamList, 'ThingsToSee'>;

// Mock action for fetching attractions
const fetchAttractions = (destinationId: string, subDestinationId?: string) => {
  return (dispatch: any) => {
    dispatch({ type: 'FETCH_THINGS_TO_SEE_REQUEST' });

    // Simulate API call
    setTimeout(() => {
      // This would be an API call in a real app
      const mockAttractions: Attraction[] = [
        {
          id: '1',
          name: 'Grand Palace',
          description: 'Former residence of the Kings of Thailand. The Grand Palace is the most famous landmark in Bangkok.',
          category: 'Historical',
          location: {
            latitude: 13.7500,
            longitude: 100.4910,
          },
          imageUrl: 'https://example.com/grand-palace.jpg',
          rating: 4.7,
          openingHours: '8:30 AM - 3:30 PM',
          price: '500 THB',
          tags: ['Temple', 'Palace', 'Must See']
        },
        {
          id: '2',
          name: 'Chatuchak Weekend Market',
          description: 'One of the world\'s largest weekend markets covering 35 acres with over 8,000 stalls.',
          category: 'Shopping',
          location: {
            latitude: 13.7999,
            longitude: 100.5500,
          },
          imageUrl: 'https://example.com/chatuchak.jpg',
          rating: 4.5,
          openingHours: 'Saturday-Sunday 9:00 AM - 6:00 PM',
          price: 'Free',
          tags: ['Market', 'Shopping', 'Food']
        },
        {
          id: '3',
          name: 'Wat Arun',
          description: 'Temple of Dawn is a Buddhist temple on the west bank of the Chao Phraya River.',
          category: 'Religious',
          location: {
            latitude: 13.7437,
            longitude: 100.4888,
          },
          imageUrl: 'https://example.com/wat-arun.jpg',
          rating: 4.6,
          openingHours: '8:00 AM - 6:00 PM',
          price: '50 THB',
          tags: ['Temple', 'Historical', 'Riverside']
        },
        {
          id: '4',
          name: 'Jim Thompson House',
          description: 'Museum housing the art collection of American businessman Jim Thompson.',
          category: 'Museum',
          location: {
            latitude: 13.7501,
            longitude: 100.5001,
          },
          imageUrl: 'https://example.com/jim-thompson.jpg',
          rating: 4.3,
          openingHours: '9:00 AM - 6:00 PM',
          price: '200 THB',
          tags: ['Museum', 'Culture', 'Architecture']
        },
        {
          id: '5',
          name: 'Lumpini Park',
          description: 'Inner-city park covering 142 acres with lakes and recreation areas.',
          category: 'Nature',
          location: {
            latitude: 13.7314,
            longitude: 100.5420,
          },
          imageUrl: 'https://example.com/lumpini.jpg',
          rating: 4.4,
          openingHours: '4:30 AM - 9:00 PM',
          price: 'Free',
          tags: ['Park', 'Nature', 'Recreation']
        },
      ];

      dispatch({
        type: 'FETCH_THINGS_TO_SEE_SUCCESS',
        payload: {
          destinationId,
          attractions: mockAttractions,
        },
      });
    }, 1000);
  };
};

const categories = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'Historical', name: 'Historical', icon: 'business-outline' },
  { id: 'Religious', name: 'Religious', icon: 'home-outline' },
  { id: 'Shopping', name: 'Shopping', icon: 'cart-outline' },
  { id: 'Museum', name: 'Museums', icon: 'school-outline' },
  { id: 'Nature', name: 'Nature', icon: 'leaf-outline' },
  { id: 'Food', name: 'Food', icon: 'restaurant-outline' },
];

const ThingsToSeeScreen: React.FC = () => {
  const route = useRoute<ThingsToSeeRouteProp>();
  const navigation = useNavigation<ThingsToSeeNavigationProp>();
  const dispatch = useDispatch();
  const { destinationId, subDestinationId, title } = route.params;

  const [selectedCategory, setSelectedCategory] = useState('all');

  const { attractions, loading, error } = useSelector((state: RootState) => {
    return {
      attractions: state.destinations.attractions[destinationId] || [],
      loading: state.destinations.loading,
      error: state.destinations.error,
    };
  });

  useEffect(() => {
    dispatch(fetchAttractions(destinationId, subDestinationId) as any);
  }, [dispatch, destinationId, subDestinationId]);

  const handleAttractionPress = (attraction: Attraction) => {
    navigation.navigate('AttractionDetail', {
      attractionId: attraction.id,
      destinationId,
    });
  };

  const filteredAttractions = selectedCategory === 'all'
    ? attractions
    : attractions.filter(attraction => attraction.category === selectedCategory ||
        attraction.tags.includes(selectedCategory));

  const renderCategoryItem = ({ item }: { item: { id: string, name: string, icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categorySelected,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={20}
        color={selectedCategory === item.id ? '#FFFFFF' : '#666666'}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAttractionItem = ({ item }: { item: Attraction }) => (
    <TouchableOpacity
      style={styles.attractionCard}
      onPress={() => handleAttractionPress(item)}
    >
      <View style={styles.attractionImageContainer}>
        {/* In a real app, load actual images */}
        <View style={styles.placeholderImage}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={40}
            color="#CCCCCC"
          />
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Ionicons name="star" size={12} color="#FFD700" />
        </View>
      </View>
      <View style={styles.attractionContent}>
        <Text style={styles.attractionName}>{item.name}</Text>
        <View style={styles.attractionMeta}>
          <Text style={styles.categoryLabel}>{item.category}</Text>
          {item.price && (
            <View style={styles.priceContainer}>
              <Ionicons name="pricetag-outline" size={12} color="#666666" />
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          )}
        </View>
        <Text style={styles.attractionDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category: string): string => {
    const found = categories.find(cat => cat.id === category);
    return found ? (found.icon as string) : 'pin-outline';
  };

  if (loading && attractions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading attractions...</Text>
      </View>
    );
  }

  if (error && attractions.length === 0) {
    return (
      <EmptyStateView
        icon="alert-circle"
        title="Oops!"
        message={`Something went wrong: ${error}`}
        actionLabel="Try Again"
        onAction={() => dispatch(fetchAttractions(destinationId, subDestinationId) as any)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {filteredAttractions.length === 0 ? (
        <EmptyStateView
          icon="search"
          title="No Attractions Found"
          message={`There are no ${selectedCategory !== 'all' ? selectedCategory : ''} attractions available for this destination.`}
          actionLabel="Show All"
          onAction={() => setSelectedCategory('all')}
        />
      ) : (
        <FlatList
          data={filteredAttractions}
          renderItem={renderAttractionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.attractionsList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categorySelected: {
    backgroundColor: '#0066CC',
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 6,
    color: '#666666',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  attractionsList: {
    padding: 16,
  },
  attractionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attractionImageContainer: {
    height: 150,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  placeholderImage: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  attractionContent: {
    padding: 16,
  },
  attractionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  attractionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  attractionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#E0F0FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0066CC',
  },
});

export default ThingsToSeeScreen;