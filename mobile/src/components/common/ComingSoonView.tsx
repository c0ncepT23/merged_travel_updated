// mobile/src/components/common/ComingSoonView.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComingSoonViewProps {
  destination: string;
  message?: string;
  onClose?: () => void;
}

const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  destination,
  message,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="time-outline" size={64} color="#0066CC" />
        <Text style={styles.title}>Coming Soon!</Text>
        <Text style={styles.destinationText}>{destination}</Text>
        <Text style={styles.message}>
          {message || `Travel groups for ${destination} will be available soon. We'll notify you when they're ready!`}
        </Text>
        
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#0066CC" />
          <Text style={styles.infoText}>
            Currently, we support Thailand and Japan. More destinations will be added soon!
          </Text>
        </View>
        
        {onClose && (
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ComingSoonView;