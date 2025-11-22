import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function BarcodeScanner({ onBarcodeScanned, scannedBarcodes }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [torchOn, setTorchOn] = useState(false);

  React.useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      Alert.alert('Error', 'Failed to request camera permission');
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    // Check if barcode is 5-6 digits and numbers only
    const isValid = /^\d{5,6}$/.test(data);
    
    if (!isValid) {
      return; // Ignore barcodes that don't match the pattern
    }
    
    // Check if this barcode is already in the list
    const isDuplicate = scannedBarcodes.some(barcode => barcode.data === data);
    if (!isDuplicate) {
      onBarcodeScanned({ type, data, timestamp: Date.now() });
    }
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'codabar',
            'code39',
            'code93',
            'code128',
            'ean13',
            'ean8',
            'itf14',
            'upc_a',
            'upc_e',
          ],
        }}
        enableTorch={torchOn}
      />
      
      {/* Viewfinder Overlay */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}>
          <View style={styles.topOverlay} />
        </View>
        
        <View style={styles.middleContainer}>
          <View style={styles.sideOverlay} />
          <View style={styles.focusedContainer}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>

        <View style={styles.unfocusedContainer}>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Position barcode within the frame
            </Text>
          </View>
        </View>
      </View>

      {/* Torch Toggle Button */}
      <TouchableOpacity
        style={styles.torchButton}
        onPress={toggleTorch}
      >
        <Ionicons
          name={torchOn ? 'flash' : 'flash-off'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  message: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'transparent',
  },
  unfocusedContainer: {
    flex: 3,
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideOverlay: {
    flex: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  focusedContainer: {
    flex: 6,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4A90E2',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  torchButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
});
