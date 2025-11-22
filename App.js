import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, Vibration } from 'react-native';
import BarcodeScanner from './components/BarcodeScanner';
import MultiBarcodeList from './components/MultiBarcodeList';
import StatusSelectionModal from './components/StatusSelectionModal';
import { saveBarcode } from './services/database';

export default function App() {
  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);

  const handleBarcodeScanned = (barcodeData) => {
    Vibration.vibrate(100);
    setScannedBarcodes(prev => [...prev, barcodeData]);
    setSelectedBarcode(barcodeData);
    setModalVisible(true);
  };

  const handleSelectBarcode = (barcode) => {
    setSelectedBarcode(barcode);
    setModalVisible(true);
  };

  const handleModalSubmit = async (formData) => {
    const result = await saveBarcode({
      ...selectedBarcode,
      status: formData.status,
      location: formData.location,
      room: formData.room,
    });
    
    if (result.success) {
      let title = '';
      let message = '';
      
      if (result.alreadyMarked) {
        title = '✓ Already Verified';
        message = result.message || `${result.lValue || ''} Exists`;
      } else if (result.found) {
        Vibration.vibrate([0, 200, 100, 200]);
        title = '🎉 Success!';
        const lValue = result.lValue || '';
        const count = result.markedCount || 0;
        const total = result.totalCount || 258;
        message = `${lValue}\n\nFound! ${count}/${total}`;
      } else if (result.alreadyInOther) {
        title = '⚠️ Duplicate';
        message = result.message;
      } else if (result.notInInventory) {
        title = '⚠️ Not in Inventory';
        message = result.message;
      } else {
        title = 'Not Found';
        message = 'Item not found in inventory';
      }
      
      Alert.alert(
        title,
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              setScannedBarcodes([]);
            },
          },
        ]
      );
    } else {
      Alert.alert('❌ Error', `Failed to process barcode:\n${result.error}`);
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
      <StatusSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        barcodeData={selectedBarcode}
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
