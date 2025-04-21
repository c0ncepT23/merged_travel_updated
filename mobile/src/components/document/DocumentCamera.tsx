// src/components/document/DocumentCamera.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';


interface DocumentCameraProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

const DocumentCamera: React.FC<DocumentCameraProps> = ({ onCapture, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [flash, setFlash] = useState(Camera.Constants?.FlashMode?.off || 0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      setIsCaptured(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        onCapture(photo.uri);
      } catch (error) {
        console.error('Error capturing image:', error);
        setIsCaptured(false);
      }
    }
  };

  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera access denied</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flash}
        ratio="4:3"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Ionicons
                name={flash === (Camera.Constants?.FlashMode?.on || 1) ? "flash" : "flash-off"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.documentFrame}>
            <View style={styles.frameBorder} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.guideText}>
              Position your document within the frame
            </Text>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={handleCapture}
              disabled={isCaptured}
            >
              {isCaptured ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.captureIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const DOCUMENT_RATIO = 4 / 3; // Standard document ratio (portrait A4)
const frameWidth = width * 0.8;
const frameHeight = frameWidth / DOCUMENT_RATIO;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 24,
  },
  closeButton: {
    padding: 8,
  },
  flashButton: {
    padding: 8,
  },
  documentFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBorder: {
    width: frameWidth,
    height: frameHeight,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DocumentCamera;