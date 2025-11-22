import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import BarcodeScanner from './components/BarcodeScanner';
import MultiBarcodeList from './components/MultiBarcodeList';
import { saveBarcode } from './services/database';

export default function App() {
  const [scannedBarcodes, setScannedBarcodes] = useState([]);

  const handleBarcodeScanned = (barcodeData) => {
    setScannedBarcodes(prev => [...prev, barcodeData]);
  };

  const handleSelectBarcode = async (barcode) => {
    // Save to local storage
    const result = await saveBarcode(barcode);
    
    if (result.success) {
      let title = '';
      let message = '';
      
      if (result.alreadyMarked) {
        title = 'Already Verified';
        message = `ASSET ID: ${barcode.data}\n\n${result.message}`;
      } else if (result.found) {
        title = 'Success - Found!';
        message = `ASSET ID: ${barcode.data}\n\n✓ Found in inventory and marked with "F"`;
      } else {
        title = 'Not Found';
        message = `ASSET ID: ${barcode.data}\n\n⚠ Not found in inventory\nAdded to "Other" sheet for review`;
      }
      
      Alert.alert(
        title,
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              // Remove the saved barcode from the list
              setScannedBarcodes(prev => 
                prev.filter(b => b.timestamp !== barcode.timestamp)
              );
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', `Failed to process barcode: ${result.error}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BarcodeScanner 
        onBarcodeScanned={handleBarcodeScanned}
        scannedBarcodes={scannedBarcodes}
      />
      <MultiBarcodeList 
        barcodes={scannedBarcodes}
        onSelectBarcode={handleSelectBarcode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
