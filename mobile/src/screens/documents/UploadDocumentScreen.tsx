import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withRepeat,
  runOnJS
} from 'react-native-reanimated';

// Import components and services
import { uploadDocument } from '../../store/actions/profileActions';
import { storageService } from '../../services/firebase/storageService';
import { parseDocument } from '../../services/document/DocumentParser';
import DocumentCamera from '../../components/document/DocumentCamera';
import { Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Import types
import { DocumentsStackParamList } from '../../navigation/DocumentsNavigator';

type UploadDocumentRouteProp = RouteProp<
  DocumentsStackParamList,
  'UploadDocument'
>;

type UploadDocumentNavigationProp = StackNavigationProp<
  DocumentsStackParamList,
  'UploadDocument'
>;

const UploadDocumentScreen: React.FC = () => {
  const route = useRoute<UploadDocumentRouteProp>();
  const navigation = useNavigation<UploadDocumentNavigationProp>();
  const dispatch = useDispatch();
  
  // Get initial document type from route params if available
  const initialDocType = route.params?.documentType || 'flight';
  
  // Form state
  const [documentType, setDocumentType] = useState<'flight' | 'hotel' | 'other'>(
    initialDocType as 'flight' | 'hotel' | 'other'
  );
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week later
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Document details state
  const [flightNumber, setFlightNumber] = useState('');
  const [airline, setAirline] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  
  // File state
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  
  // OCR state
  const [parsedData, setParsedData] = useState<any>(null);
  const [parsingDocument, setParsingDocument] = useState(false);
  const [showOcrPreview, setShowOcrPreview] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<string[]>([]);
  
  // Animation values
  const scannerPosition = useSharedValue(0);
  const scannerOpacity = useSharedValue(0.8);
  
  // Create animated styles
  const scannerAnimStyle = useAnimatedStyle(() => {
    return {
      top: scannerPosition.value,
      opacity: scannerOpacity.value,
    };
  });
  
  // Update header title based on document type
  useEffect(() => {
    navigation.setOptions({
      title: `Upload ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`
    });
  }, [documentType, navigation]);
  
  // Function to animate the scanner during OCR
  const animateScanner = () => {
    setProcessingStage('initializing');
    setTimeout(() => setProcessingStage('scanning'), 500);
    
    // Start scanner animation
    scannerPosition.value = 0;
    scannerOpacity.value = 0.8;
    
    // Animated scanner passing over the document
    scannerPosition.value = withSequence(
      withTiming(0),
      withRepeat(
        withTiming(200, { duration: 1500 }), 
        3, 
        true
      ),
      withTiming(0, { duration: 500 }, () => {
        // When animation completes, start showing extracted fields
        runOnJS(simulateFieldExtraction)();
      })
    );
  };
  
  // Simulate the field extraction with a visual sequence
  const simulateFieldExtraction = () => {
    setProcessingStage('extracting');
    
    // Simulate fields being extracted one by one with delays
    const fields = ['type', 'title', 'destination', 'dates', 'details'];
    let currentIndex = 0;
    
    const extractInterval = setInterval(() => {
      if (currentIndex < fields.length) {
        setExtractedFields(prev => [...prev, fields[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(extractInterval);
        setProcessingStage('complete');
        
        // After showing all fields extraction, show the real data
        setTimeout(() => {
          setProcessingStage(null);
          setExtractedFields([]);
          setParsingDocument(false);
          setShowOcrPreview(true);
        }, 500);
      }
    }, 400);
  };
  
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setParsingDocument(true);
        
        // Start the animation sequence
        animateScanner();
        
        try {
          const fileType = result.assets[0].mimeType || 
                          (result.assets[0].name ? result.assets[0].name.split('.').pop() || '' : '');
          
          // Parse the document using OCR
          const parseResult = await parseDocument(result.assets[0].uri, fileType);
          
          if (parseResult.success && parseResult.data) {
            setParsedData(parseResult.data);
            
            // Pre-fill the form with extracted data
            // This happens after animation completes in simulateFieldExtraction()
            setDocumentType(parseResult.data.type);
            setTitle(parseResult.data.title);
            setDestination(parseResult.data.destination);
            
            if (parseResult.data.startDate) {
              setStartDate(new Date(parseResult.data.startDate));
            }
            
            if (parseResult.data.endDate) {
              setEndDate(new Date(parseResult.data.endDate));
            }
            
            // If flight details were extracted
            if (parseResult.data.type === 'flight' && parseResult.data.details) {
              if (parseResult.data.details.airline) {
                setAirline(parseResult.data.details.airline);
              }
              if (parseResult.data.details.flightNumber) {
                setFlightNumber(parseResult.data.details.flightNumber);
              }
            }
            
            // If hotel details were extracted
            if (parseResult.data.type === 'hotel' && parseResult.data.details) {
              if (parseResult.data.details.hotelName) {
                setHotelName(parseResult.data.details.hotelName);
              }
              if (parseResult.data.details.bookingReference) {
                setBookingReference(parseResult.data.details.bookingReference);
              }
            }
            
            // Show the OCR preview happens after animation in simulateFieldExtraction()
          } else {
            setProcessingStage('failed');
            setTimeout(() => {
              setProcessingStage(null);
              setParsingDocument(false);
              // If OCR failed, just let the user fill in the data manually
              Alert.alert(
                'Document Processing',
                'We couldn\'t automatically extract all the information. Please fill in the details manually.'
              );
            }, 1000);
          }
        } catch (error) {
          console.error('Error parsing document:', error);
          setProcessingStage('failed');
          setTimeout(() => {
            setProcessingStage(null);
            setParsingDocument(false);
            Alert.alert(
              'Document Processing Error',
              'There was an error processing your document. Please fill in the details manually.'
            );
          }, 1000);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Error picking document:', error);
    }
  };
  
  const handleCameraCapture = async (imageUri: string) => {
    setShowCamera(false);
    setParsingDocument(true);
    
    // Start the animation sequence
    animateScanner();
    
    try {
      // Create a file object similar to what DocumentPicker returns
      const filename = `document_${Date.now()}.jpg`;
      const file = {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
        size: 0, // We don't know the size, but it's not critical
      };
      
      setSelectedFile(file as any);
      
      // Parse the document using OCR
      const parseResult = await parseDocument(imageUri, 'image/jpeg');
      
      if (parseResult.success && parseResult.data) {
        setParsedData(parseResult.data);
        
        // Pre-fill occurs after animation completes in simulateFieldExtraction()
        setDocumentType(parseResult.data.type);
        setTitle(parseResult.data.title);
        setDestination(parseResult.data.destination);
        
        if (parseResult.data.startDate) {
          setStartDate(new Date(parseResult.data.startDate));
        }
        
        if (parseResult.data.endDate) {
          setEndDate(new Date(parseResult.data.endDate));
        }
        
        if (parseResult.data.type === 'flight' && parseResult.data.details) {
          if (parseResult.data.details.airline) {
            setAirline(parseResult.data.details.airline);
          }
          if (parseResult.data.details.flightNumber) {
            setFlightNumber(parseResult.data.details.flightNumber);
          }
        }
        
        if (parseResult.data.type === 'hotel' && parseResult.data.details) {
          if (parseResult.data.details.hotelName) {
            setHotelName(parseResult.data.details.hotelName);
          }
          if (parseResult.data.details.bookingReference) {
            setBookingReference(parseResult.data.details.bookingReference);
          }
        }
        
        // Show preview after animation
      } else {
        setProcessingStage('failed');
        setTimeout(() => {
          setProcessingStage(null);
          setParsingDocument(false);
          Alert.alert(
            'Document Processing',
            'We couldn\'t automatically extract all the information. Please fill in the details manually.'
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing captured image:', error);
      setProcessingStage('failed');
      setTimeout(() => {
        setProcessingStage(null);
        setParsingDocument(false);
        Alert.alert(
          'Processing Error',
          'There was an error processing your document. Please try again or fill in the details manually.'
        );
      }, 1000);
    }
  };
  
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // If end date is before start date, update it
      if (endDate < selectedDate) {
        setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)); // One day later
      }
    }
  };
  
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return false;
    }
    
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a document to upload');
      return false;
    }
    
    if (documentType === 'flight') {
      if (!flightNumber.trim() || !airline.trim()) {
        Alert.alert('Error', 'Please enter flight details');
        return false;
      }
    } else if (documentType === 'hotel') {
      if (!hotelName.trim()) {
        Alert.alert('Error', 'Please enter hotel name');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    const fileUri = selectedFile?.uri;
    const fileType = selectedFile?.type || '';

    if (!fileUri) {
      Alert.alert('Error', 'Please select a document to upload');
      return;
    }
  
    setUploading(true);
    
    try {
      console.log('Processing document:', fileUri, fileType);
      
      // Check if it's an image
      const isImage = fileType.toLowerCase().includes('image') || 
                      fileUri.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      
      if (!isImage) {
        Alert.alert('Unsupported File Type', 'Currently only images can be processed. Please upload an image document.');
        setUploading(false);
        return;
      }
      
      // Process the document using our DocumentParser service
      const result = await parseDocument(fileUri, fileType);
      
      if (result.success && result.data) {
        // Create the document data
        const documentData = {
          type: result.data.type,
          title: result.data.title,
          destination: result.data.destination,
          startDate: result.data.startDate,
          endDate: result.data.endDate,
          fileUrl: fileUri,
          details: result.data.details,
        };
        
        // Add document to Firestore via Redux action
        const documentId = await dispatch(uploadDocument(documentData) as any);
        
        setUploading(false);
        Alert.alert(
          'Success',
          'Document uploaded and processed successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        setUploading(false);
        Alert.alert('Error', result.error || 'Failed to process document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };
  
  const renderDocumentTypeSelector = () => (
    <View style={styles.documentTypeContainer}>
      <TouchableOpacity
        style={[
          styles.documentTypeButton,
          documentType === 'flight' && styles.selectedDocumentType,
        ]}
        onPress={() => setDocumentType('flight')}
      >
        <Ionicons
          name="airplane"
          size={24}
          color={documentType === 'flight' ? '#FFFFFF' : '#0066CC'}
        />
        <Text
          style={[
            styles.documentTypeText,
            documentType === 'flight' && styles.selectedDocumentTypeText,
          ]}
        >
          Flight
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.documentTypeButton,
          documentType === 'hotel' && styles.selectedDocumentType,
        ]}
        onPress={() => setDocumentType('hotel')}
      >
        <Ionicons
          name="bed"
          size={24}
          color={documentType === 'hotel' ? '#FFFFFF' : '#0066CC'}
        />
        <Text
          style={[
            styles.documentTypeText,
            documentType === 'hotel' && styles.selectedDocumentTypeText,
          ]}
        >
          Hotel
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.documentTypeButton,
          documentType === 'other' && styles.selectedDocumentType,
        ]}
        onPress={() => setDocumentType('other')}
      >
        <Ionicons
          name="document-text"
          size={24}
          color={documentType === 'other' ? '#FFFFFF' : '#0066CC'}
        />
        <Text
          style={[
            styles.documentTypeText,
            documentType === 'other' && styles.selectedDocumentTypeText,
          ]}
        >
          Other
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderFlightDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Flight Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Airline</Text>
        <TextInput
          style={styles.input}
          value={airline}
          onChangeText={setAirline}
          placeholder="e.g. Thai Airways"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Flight Number</Text>
        <TextInput
          style={styles.input}
          value={flightNumber}
          onChangeText={setFlightNumber}
          placeholder="e.g. TG315"
        />
      </View>
    </View>
  );
  
  const renderHotelDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Hotel Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Hotel Name</Text>
        <TextInput
          style={styles.input}
          value={hotelName}
          onChangeText={setHotelName}
          placeholder="e.g. Bangkok Marriott"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Booking Reference (optional)</Text>
        <TextInput
          style={styles.input}
          value={bookingReference}
          onChangeText={setBookingReference}
          placeholder="e.g. BKK12345"
        />
      </View>
    </View>
  );

  const testUpload = async () => {
    try {
      // Use the ngrok URL
      const ngrokUrl = "https://0a53-2406-b400-b4-a2de-c45e-60e0-70c0-6e40.ngrok-free.app";
      
      // Pick an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (result.canceled) {
        console.log('Image selection canceled');
        return;
      }
      
      const uri = result.assets[0].uri;
      console.log('Selected image URI:', uri);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: 'test.jpg',
        type: 'image/jpeg'
      });
      
      console.log('Sending test upload to server...');
      const uploadResponse = await fetch(`${ngrokUrl}/api/ocr`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      Alert.alert('Upload Result', JSON.stringify(uploadResult));
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', error.toString());
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Upload Travel Document
          </Text>
          <Text style={styles.subtitle}>
            We'll automatically extract information from your document
          </Text>
        </View>

        <Button title="Test OCR Server" onPress={testUpload} />
        
        {/* Document upload section - moved to the top */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Select Document</Text>
          <Text style={styles.sectionDescription}>
            Upload a flight ticket, hotel booking, or other travel document
          </Text>
          
          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={handleDocumentPick}
            >
              <Ionicons name="document-text" size={24} color="#0066CC" />
              <Text style={styles.fileButtonText}>
                {selectedFile ? 'Change File' : 'Select File'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={24} color="#0066CC" />
              <Text style={styles.fileButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
          
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <Ionicons
                name="document"
                size={20}
                color="#0066CC"
                style={styles.fileIcon}
              />
              <Text style={styles.selectedFileText} numberOfLines={1}>
                {selectedFile.name || 'Captured document'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Document form information */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Document Information</Text>
          <Text style={styles.sectionDescription}>
            {selectedFile 
              ? 'We\'ve extracted this information from your document' 
              : 'Upload a document to automatically fill this information'}
          </Text>
          
          {renderDocumentTypeSelector()}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Document Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={
                documentType === 'flight'
                  ? 'e.g. Bangkok Flight'
                  : documentType === 'hotel'
                  ? 'e.g. Bangkok Hotel'
                  : 'e.g. Japan Rail Pass'
              }
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Destination</Text>
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Thailand"
            />
          </View>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {format(startDate, 'MMM d, yyyy')}
                </Text>
                <Ionicons name="calendar" size={18} color="#0066CC" />
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                />
              )}
            </View>
            
            <View style={styles.dateInputGroup}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {format(endDate, 'MMM d, yyyy')}
                </Text>
                <Ionicons name="calendar" size={18} color="#0066CC" />
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                />
              )}
            </View>
          </View>
          
          {documentType === 'flight' && renderFlightDetails()}
          {documentType === 'hotel' && renderHotelDetails()}
        </View>
      </ScrollView>
      
      {/* Action buttons at the bottom */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={uploading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Camera component */}
      {showCamera && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showCamera}
          onRequestClose={() => setShowCamera(false)}
        >
          <DocumentCamera
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        </Modal>
      )}
      
      {/* OCR preview dialog */}
      {showOcrPreview && parsedData && (
        <Modal
          visible={showOcrPreview}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOcrPreview(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Document Information</Text>
              <Text style={styles.modalSubtitle}>
                We've extracted the following information from your document:
              </Text>
              
              <ScrollView style={styles.extractedInfoContainer}>
                <View style={styles.extractedInfoItem}>
                  <Text style={styles.extractedInfoLabel}>Type:</Text>
                  <Text style={styles.extractedInfoValue}>
                    {parsedData.type.charAt(0).toUpperCase() + parsedData.type.slice(1)}
                  </Text>
                </View>
                
                <View style={styles.extractedInfoItem}>
                  <Text style={styles.extractedInfoLabel}>Title:</Text>
                  <Text style={styles.extractedInfoValue}>{parsedData.title}</Text>
                </View>
                
                <View style={styles.extractedInfoItem}>
                  <Text style={styles.extractedInfoLabel}>Destination:</Text>
                  <Text style={styles.extractedInfoValue}>{parsedData.destination}</Text>
                </View>
                
                <View style={styles.extractedInfoItem}>
                  <Text style={styles.extractedInfoLabel}>Date Range:</Text>
                  <Text style={styles.extractedInfoValue}>
                    {format(new Date(parsedData.startDate), 'MMM d, yyyy')} - 
                    {format(new Date(parsedData.endDate), 'MMM d, yyyy')}
                  </Text>
                </View>
                
                {parsedData.type === 'flight' && parsedData.details && (
                  <>
                    {parsedData.details.airline && (
                      <View style={styles.extractedInfoItem}>
                        <Text style={styles.extractedInfoLabel}>Airline:</Text>
                        <Text style={styles.extractedInfoValue}>{parsedData.details.airline}</Text>
                      </View>
                    )}
                    
                    {parsedData.details.flightNumber && (
                      <View style={styles.extractedInfoItem}>
                        <Text style={styles.extractedInfoLabel}>Flight Number:</Text>
                        <Text style={styles.extractedInfoValue}>{parsedData.details.flightNumber}</Text>
                      </View>
                    )}
                  </>
                )}
                
                {parsedData.type === 'hotel' && parsedData.details && (
                  <>
                    {parsedData.details.hotelName && (
                      <View style={styles.extractedInfoItem}>
                        <Text style={styles.extractedInfoLabel}>Hotel:</Text>
                        <Text style={styles.extractedInfoValue}>{parsedData.details.hotelName}</Text>
                      </View>
                    )}
                    
                    {parsedData.details.bookingReference && (
                      <View style={styles.extractedInfoItem}>
                        <Text style={styles.extractedInfoLabel}>Booking Ref:</Text>
                        <Text style={styles.extractedInfoValue}>{parsedData.details.bookingReference}</Text>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
              
              <Text style={styles.modalNote}>
                You can edit this information in the form if needed.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowOcrPreview(false)}
                >
                  <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Processing animation overlay */}
      {parsingDocument && (
        <View style={styles.parsingOverlay}>
          <View style={styles.documentPreviewContainer}>
            {/* Document preview */}
            <View style={styles.documentPreview}>
              <Ionicons 
                name={documentType === 'flight' ? "airplane" : "bed"} 
                size={40} 
                color="#CCCCCC" 
                style={styles.documentIcon}
              />
              
              {/* Animated scanner line */}
              <Animated.View style={[styles.scannerLine, scannerAnimStyle]} />
            </View>
            
            {/* Processing stages */}
            <View style={styles.processingStatusContainer}>
              <Text style={styles.processingTitle}>
                {processingStage === 'initializing' && 'Preparing document...'}
                {processingStage === 'scanning' && 'Scanning document...'}
                {processingStage === 'extracting' && 'Extracting information...'}
                {processingStage === 'complete' && 'Processing complete!'}
                {processingStage === 'failed' && 'Processing failed'}
              </Text>
              
              {processingStage === 'extracting' && (
                <View style={styles.extractionDetails}>
                  {extractedFields.includes('type') && (
                    <View style={styles.extractedField}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.extractedFieldText}>Document type detected</Text>
                    </View>
                  )}
                  
                  {extractedFields.includes('title') && (
                    <View style={styles.extractedField}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.extractedFieldText}>Title extracted</Text>
                    </View>
                  )}
                  
                  {extractedFields.includes('destination') && (
                    <View style={styles.extractedField}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.extractedFieldText}>Destination identified</Text>
                    </View>
                  )}
                  
                  {extractedFields.includes('dates') && (
                    <View style={styles.extractedField}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.extractedFieldText}>Travel dates found</Text>
                    </View>
                  )}
                  
                  {extractedFields.includes('details') && (
                    <View style={styles.extractedField}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.extractedFieldText}>
                        {documentType === 'flight' 
                          ? 'Flight details extracted' 
                          : 'Hotel details extracted'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {processingStage === 'failed' && (
                <View style={styles.extractionDetails}>
                  <Ionicons name="alert-circle" size={24} color="#F44336" />
                  <Text style={[styles.extractedFieldText, styles.errorText]}>
                    Unable to extract document information
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  // Upload section styles
  uploadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F0FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    marginRight: 8,
  },
  cameraButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F0FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0066CC',
    marginLeft: 8,
  },
  fileButtonText: {
    fontSize: 14,
    color: '#0066CC',
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    padding: 8,
  },
  fileIcon: {
    marginRight: 8,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  // Modified form container styles
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 100, // Extra space for the bottom buttons
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  documentTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  selectedDocumentType: {
    backgroundColor: '#0066CC',
  },
  documentTypeText: {
    marginTop: 4,
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  selectedDocumentTypeText: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputGroup: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  detailsContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    height: 20,
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066CC',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#333333',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  // Processing overlay styles
  parsingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  documentPreviewContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  documentPreview: {
    width: 200,
    height: 280,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  documentIcon: {
    opacity: 0.5,
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0066CC',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  processingStatusContainer: {
    width: '100%',
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  extractionDetails: {
    width: '100%',
  },
  extractedField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  extractedFieldText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  errorText: {
    color: '#F44336',
  },
  // OCR preview modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  extractedInfoContainer: {
    maxHeight: 300,
  },
  extractedInfoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  extractedInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    width: 100,
  },
  extractedInfoValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  modalNote: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default UploadDocumentScreen;