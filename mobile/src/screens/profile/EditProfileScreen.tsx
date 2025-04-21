import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../services/firebase/firebaseConfig';

// Import components and types
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { RootState } from '../../store/reducers';

// Import services and actions
import { storageService } from '../../services/firebase/storageService';
import { updateUserProfile } from '../../store/actions/profileActions';

type EditProfileNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

// Mock action to update profile
const updateProfile = (profileData: any) => {
  return (dispatch: any) => {
    dispatch({ type: 'UPDATE_PROFILE_REQUEST' });
    
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_PROFILE_SUCCESS',
          payload: profileData,
        });
        resolve();
      }, 1000);
    });
  };
};

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const dispatch = useDispatch();
  
  const { profile, loading } = useSelector((state: RootState) => state.profile);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [prefInput, setPrefInput] = useState('');
  
  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setCountry(profile.country || '');
      setAvatar(profile.avatar || null);
      setCoverPhoto(profile.coverPhoto || null);
      setLanguages(profile.languages || []);
      setPreferences(profile.travelPreferences || []);
    }
  }, [profile]);
  
  const pickImage = async (type: 'avatar' | 'cover') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'We need access to your photos to update your profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Show loading indicator
        setLoading(true);
        
        try {
          // Upload to Firebase Storage
          const downloadUrl = await storageService.uploadProfileImage(
            selectedImage.uri,
            (progress) => {
              console.log(`Upload progress: ${progress * 100}%`);
            }
          );
          
          // Update local state
          if (type === 'avatar') {
            setAvatar(downloadUrl);
          } else {
            setCoverPhoto(downloadUrl);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const addLanguage = () => {
    if (langInput.trim() && !languages.includes(langInput.trim())) {
      setLanguages([...languages, langInput.trim()]);
      setLangInput('');
    }
  };
  
  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };
  
  const addPreference = () => {
    if (prefInput.trim() && !preferences.includes(prefInput.trim())) {
      setPreferences([...preferences, prefInput.trim()]);
      setPrefInput('');
    }
  };
  
  const removePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref));
  };
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      
      // Update Firebase Auth profile
      await currentUser.updateProfile({
        displayName: name,
        photoURL: avatar,
      });
      
      // If email changed, update it in Firebase Auth
      if (email !== currentUser.email) {
        await currentUser.updateEmail(email);
      }
      
      // Update Firestore profile
      const updatedProfile = {
        name,
        email,
        bio,
        country,
        avatar,
        coverPhoto,
        languages,
        travelPreferences: preferences,
      };
      
      await dispatch(updateUserProfile(updatedProfile) as any);
      
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Authentication Required',
          'Please sign out and sign in again to update your email.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };
  
  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoSection}>
            <View style={styles.coverPhotoContainer}>
              {coverPhoto ? (
                <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
              ) : (
                <View style={[styles.coverPhoto, styles.coverPhotoPlaceholder]} />
              )}
              
              <TouchableOpacity 
                style={styles.editCoverButton}
                onPress={() => pickImage('cover')}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>
                    {name
                      .split(' ')
                      .map(word => word[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => pickImage('avatar')}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Enter your country"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="A short description about yourself"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Languages</Text>
              <View style={styles.tagsContainer}>
                {languages.map((lang) => (
                  <View key={lang} style={styles.tag}>
                    <Text style={styles.tagText}>{lang}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() => removeLanguage(lang)}
                    >
                      <Ionicons name="close-circle" size={16} color="#0066CC" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addTagContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.tagInput]}
                    value={langInput}
                    onChangeText={setLangInput}
                    placeholder="Add a language"
                    onSubmitEditing={addLanguage}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={addLanguage}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Travel Preferences</Text>
              <View style={styles.tagsContainer}>
                {preferences.map((pref) => (
                  <View key={pref} style={styles.tag}>
                    <Text style={styles.tagText}>{pref}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() => removePreference(pref)}
                    >
                      <Ionicons name="close-circle" size={16} color="#0066CC" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addTagContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.tagInput]}
                    value={prefInput}
                    onChangeText={setPrefInput}
                    placeholder="Add a preference"
                    onSubmitEditing={addPreference}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={addPreference}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
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
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  photoSection: {
    position: 'relative',
    marginBottom: 12,
  },
  coverPhotoContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  coverPhoto: {
    height: '100%',
    width: '100%',
  },
  coverPhotoPlaceholder: {
    backgroundColor: '#E0E0E0',
  },
  editCoverButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    left: 20,
    width: 100,
    height: 100,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0066CC',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formContainer: {
    marginTop: 60,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    height: 48,
    fontSize: 16,
    color: '#333333',
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F0FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#0066CC',
    marginRight: 4,
  },
  removeTagButton: {
    marginLeft: 2,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    height: 40,
  },
  addTagButton: {
    backgroundColor: '#0066CC',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default EditProfileScreen;