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
      Alert.alert(
        'Success!',
        `Barcode saved to database:\n${barcode.data}`,
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
      Alert.alert('Error', `Failed to save barcode: ${result.error}`);
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
