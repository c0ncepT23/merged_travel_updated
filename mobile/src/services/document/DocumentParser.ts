// src/services/document/DocumentParser.ts
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { TravelDocument } from '../../store/reducers/profileReducer';
import { Alert, Platform } from 'react-native';
import axios from 'axios';

// Backend API URL
const API_URL = 'https://91b7-2406-b400-b4-a2de-f8a0-ba6f-f34f-98d4.ngrok-free.app/api/ocr';

/**
 * This implementation uses a backend service with Google Cloud Vision API for OCR
 */

interface ExtractedDocumentInfo {
  type: 'flight' | 'hotel' | 'other';
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  details?: {
    flightNumber?: string;
    airline?: string;
    hotelName?: string;
    bookingReference?: string;
  };
}

export interface ParseResult {
  success: boolean;
  data?: ExtractedDocumentInfo;
  error?: string;
}

/**
 * Calls backend service to perform OCR on a document (image or PDF)
 */
const performDocumentOCR = async (fileUri: string, fileType: string): Promise<string> => {
  try {
    console.log(`Preparing to send ${fileType} to server:`, API_URL);
    
    // Create form data for file upload
    const formData = new FormData();
    
    // Get the filename from the URI
    const filename = fileUri.split('/').pop() || 'document';
    console.log('Document filename:', filename);
    
    // Add the file to form data
    formData.append('image', {
      uri: fileUri,
      name: filename,
      type: fileType
    } as any);
    
    console.log('Sending document to OCR server...');
    
    // Send the document to backend for processing
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Server response received:', response.status);
    
    // Check if the request was successful
    if (response.data.success) {
      console.log('OCR successful, text length:', response.data.text.length);
      return response.data.text;
    } else {
      console.error('OCR failed:', response.data.error);
      throw new Error(response.data.error || 'Failed to extract text');
    }
    
  } catch (error) {
    console.error('OCR Error:', error);
    if (error.response) {
      console.error('Server responded with status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    }
    throw new Error('Failed to perform OCR on the document');
  }
};

/**
 * Extract dates from text using various formats
 */
const extractDates = (text: string): string[] => {
  const dates: string[] = [];
  
  // Match common date formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.
  const dateRegexes = [
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})\b/gi,
    /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/g,
  ];

  dateRegexes.forEach(regex => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        let day, month, year;
        
        if (regex.source.startsWith('\\b(Jan|Feb')) {
          // Handle month name format
          const monthMap: {[key: string]: number} = {
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
            'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
          };
          month = monthMap[match[1].toLowerCase().substring(0, 3)];
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        } else if (regex.source.startsWith('\\b(\\d{4})')) {
          // Handle YYYY-MM-DD format
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          // Handle DD/MM/YYYY or MM/DD/YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
          
          // Handle 2-digit years
          if (year < 100) {
            year += 2000;
          }
          
          // Validate and fix swapped day/month if needed
          if (month > 12) {
            [day, month] = [month, day];
          }
        }
        
        // Format as YYYY-MM-DD
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        dates.push(formattedDate);
      } catch (error) {
        console.warn('Error parsing date:', match[0]);
      }
    }
  });
  
  // Sort dates to get chronological order
  return [...new Set(dates)].sort();
};

/**
 * Extract flight information from text
 */
const extractFlightInfo = (text: string): {airline?: string, flightNumber?: string} => {
  const result: {airline?: string, flightNumber?: string} = {};
  
  // Common airlines
  const airlines = [
    'Thai Airways', 'Japan Airlines', 'ANA', 'Delta', 'United',
    'American Airlines', 'British Airways', 'Air France', 'Lufthansa',
    'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Cathay Pacific',
    'Air Canada', 'Turkish Airlines', 'Etihad Airways', 'KLM',
    'Air China', 'Korean Air', 'Southwest', 'JetBlue', 'Virgin Atlantic'
  ];
  
  // Check for airline names
  for (const airline of airlines) {
    if (text.toLowerCase().includes(airline.toLowerCase())) {
      result.airline = airline;
      break;
    }
  }
  
  // Extract flight number - Format: 2 or 3 letters followed by 1-4 digits
  const flightNumberRegex = /\b([A-Za-z]{2,3})\s*(\d{1,4})\b/g;
  const flightMatches = [...text.matchAll(flightNumberRegex)];
  
  if (flightMatches.length > 0) {
    result.flightNumber = `${flightMatches[0][1].toUpperCase()}${flightMatches[0][2]}`;
  }
  
  return result;
};

/**
 * Extract hotel information from text
 */
const extractHotelInfo = (text: string): {hotelName?: string, bookingReference?: string} => {
  const result: {hotelName?: string, bookingReference?: string} = {};
  
  // Hotel keywords to look for
  const hotelKeywords = [
    'hotel', 'resort', 'inn', 'suites', 'plaza', 'palace',
    'grand', 'hyatt', 'hilton', 'marriott', 'sheraton', 'westin',
    'intercontinental', 'radisson', 'novotel'
  ];
  
  // Try to extract hotel name
  for (const keyword of hotelKeywords) {
    const regex = new RegExp(`(\\w+\\s+${keyword}|${keyword}\\s+\\w+)`, 'i');
    const match = text.match(regex);
    if (match) {
      result.hotelName = match[0].split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      break;
    }
  }
  
  // Extract booking reference
  const bookingRefRegex = /\b(?:confirmation|booking|reservation|ref|reference|number):?\s*([a-z0-9]{5,10})\b/i;
  const bookingRefMatch = text.match(bookingRefRegex);
  if (bookingRefMatch) {
    result.bookingReference = bookingRefMatch[1].toUpperCase();
  }
  
  return result;
};

/**
 * Extract destination from text
 */
const extractDestination = (text: string): string => {
  // Common destinations
  const destinations = [
    'bangkok', 'tokyo', 'new york', 'paris', 'london', 'rome', 'sydney',
    'hong kong', 'singapore', 'dubai', 'los angeles', 'bali', 'phuket',
    'seoul', 'barcelona', 'istanbul', 'amsterdam', 'miami', 'shanghai',
    'las vegas', 'milan', 'madrid', 'berlin', 'vienna', 'prague', 'moscow',
    'athens', 'cairo', 'marrakesh', 'johannesburg', 'rio de janeiro',
    'toronto', 'vancouver', 'san francisco', 'chicago', 'boston', 'orlando',
    'kyoto', 'osaka', 'taipei', 'kuala lumpur', 'delhi', 'mumbai',
    'melbourne', 'auckland', 'fiji', 'hawaii', 'cancun', 'mexico city',
    'bangkok', 'chiang mai', 'pattaya', 'thailand', 'japan'
  ];
  
  const normalizedText = text.toLowerCase();
  
  for (const place of destinations) {
    if (normalizedText.includes(place)) {
      return place.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
  
  return 'Unknown';
};

/**
 * Determine document type based on content
 */
const determineDocumentType = (text: string): 'flight' | 'hotel' | 'other' => {
  const normalizedText = text.toLowerCase();
  
  // Check for flight indicators
  if (
    normalizedText.includes('flight') ||
    normalizedText.includes('airline') ||
    normalizedText.includes('boarding') ||
    normalizedText.includes('reservation') ||
    normalizedText.includes('confirmation') ||
    normalizedText.includes('e-ticket') ||
    normalizedText.includes('passenger')
  ) {
    return 'flight';
  }
  
  // Check for hotel indicators
  if (
    normalizedText.includes('hotel') ||
    normalizedText.includes('reservation') ||
    normalizedText.includes('booking') ||
    normalizedText.includes('stay') ||
    normalizedText.includes('accommodation') ||
    normalizedText.includes('check-in') ||
    normalizedText.includes('check in') ||
    normalizedText.includes('check-out') ||
    normalizedText.includes('check out') ||
    normalizedText.includes('guest')
  ) {
    return 'hotel';
  }
  
  return 'other';
};

/**
 * Extracts travel information from OCR-processed text
 */
export const extractTravelInfo = (text: string): ParseResult => {
  try {
    const normalizedText = text.toLowerCase();
    console.log('Extracted text:', text.substring(0, 200) + '...');
    
    // Determine document type
    const documentType = determineDocumentType(normalizedText);
    console.log('Document type determined:', documentType);
    
    // Extract dates
    const dates = extractDates(text);
    console.log('Extracted dates:', dates);
    
    // If we don't have at least two dates, use fallbacks
    const startDate = dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0];
    const endDate = dates.length > 1 ? dates[1] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Extract destination
    const destination = extractDestination(text);
    console.log('Extracted destination:', destination);
    
    // Extract additional details based on document type
    let details: any = {};
    let title = '';
    
    if (documentType === 'flight') {
      const flightInfo = extractFlightInfo(text);
      details = flightInfo;
      console.log('Flight details:', details);
      
      // Generate title
      if (details.airline) {
        title = `${details.airline} to ${destination}`;
      } else {
        title = `Flight to ${destination}`;
      }
    } else if (documentType === 'hotel') {
      const hotelInfo = extractHotelInfo(text);
      details = hotelInfo;
      console.log('Hotel details:', details);
      
      // Generate title
      if (details.hotelName) {
        title = `${details.hotelName} in ${destination}`;
      } else {
        title = `Hotel in ${destination}`;
      }
    } else {
      title = `Travel to ${destination}`;
    }
    
    return {
      success: true,
      data: {
        type: documentType,
        title,
        destination,
        startDate,
        endDate,
        details
      }
    };
  } catch (error) {
    console.error('Error parsing document:', error);
    return {
      success: false,
      error: 'Failed to extract travel information from document'
    };
  }
};

/**
 * Main function to parse a document file using backend OCR service
 */
export const parseDocument = async (
  fileUri: string,
  fileType: string
): Promise<ParseResult> => {
  try {
    console.log('Parsing document:', fileUri, fileType);
    
    // Check file type
    const isImage = fileType.toLowerCase().includes('image') || 
                    fileUri.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
    const isPdf = fileType.toLowerCase().includes('pdf') ||
                  fileUri.toLowerCase().endsWith('.pdf');
    
    if (!isImage && !isPdf) {
      Alert.alert(
        'Unsupported File Type',
        'Currently only images and PDFs can be processed. Please upload an image or PDF document.'
      );
      return {
        success: false,
        error: 'Unsupported file type. Please use an image or PDF.'
      };
    }
    
    let extractedText = '';
    
    // Configure your actual server URL (replace with your production URL)
    const serverUrl = "https://0a53-2406-b400-b4-a2de-c45e-60e0-70c0-6e40.ngrok-free.app";
    
    // Create form data for file upload
    const formData = new FormData();
    
    // Get the filename from the URI
    const filename = fileUri.split('/').pop() || 'document';
    
    // Add the file to form data
    formData.append('image', {
      uri: fileUri,
      name: filename,
      type: isPdf ? 'application/pdf' : 'image/jpeg'
    } as any);
    
    console.log('Sending document to OCR server...');
    
    // Send the document to backend for processing
    const response = await fetch(`${serverUrl}/api/ocr`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.success) {
      console.log('OCR successful, text length:', responseData.text.length);
      extractedText = responseData.text;
    } else {
      console.error('OCR failed:', responseData.error);
      throw new Error(responseData.error || 'Failed to extract text');
    }
    
    // If we couldn't extract text, inform the user
    if (!extractedText || extractedText.trim().length < 20) {
      console.log('Insufficient text extracted');
      return {
        success: false,
        error: 'Could not extract sufficient text from the document. Please try a clearer document.'
      };
    }
    
    // Process the extracted text
    return extractTravelInfo(extractedText);
  } catch (error) {
    console.error('Error parsing document:', error);
    return {
      success: false,
      error: 'Failed to parse document'
    };
  }
};