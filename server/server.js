// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const pdfParse = require('pdf-parse');

// Set up CORS
app.use(cors());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize the Vision API client
const client = new vision.ImageAnnotatorClient({
  keyFilename: './serviceAccountKey.json', // Path to your service account key
});

// Endpoint to receive and process images
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  console.log('Received document upload request');
  
  if (req.file) {
    console.log('File received:', req.file.originalname, req.file.size, 'bytes');
  } else {
    console.log('No file received in the request');
    return res.status(400).json({ success: false, error: 'No file provided' });
  }
  
  try {
    const filePath = req.file.path;
    let extractedText = '';
    
    // Check if the file is a PDF
    const isPdf = req.file.mimetype === 'application/pdf' || 
             req.file.originalname.toLowerCase().endsWith('.pdf');
 
      if (isPdf) {
        console.log('Processing PDF document');
        // Extract text from PDF
        const dataBuffer = fs.readFileSync(filePath);
        try {
          const pdfData = await pdfParse(dataBuffer);
          extractedText = pdfData.text;
          console.log('PDF text extracted, length:', extractedText.length);
        } catch (pdfError) {
          console.error('Error parsing PDF:', pdfError);
          // If pdf-parse fails, still return success but with empty text
          extractedText = "Unable to extract text from this PDF.";
        }
      } else {
      // Process image with Google Cloud Vision API
      console.log('Processing image with OCR');
      console.log('PDF extraction result:', pdfData ? 'Success' : 'Failed');
      console.log('Extracted text length:', extractedText.length);
      console.log('First 100 chars:', extractedText.substring(0, 100));
      const [result] = await client.textDetection(filePath);
      const detections = result.textAnnotations;
      extractedText = detections.length > 0 ? detections[0].description : '';
      console.log('Image text extracted, length:', extractedText.length);
    }
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    
    // Return the extracted text
    res.json({ 
      success: true, 
      text: extractedText 
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process document',
      details: error.message 
    });
  }
});

app.get('/', (req, res) => {
    res.send('OCR server is running');
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});