import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScanResult({ barcodeData, onScanAgain }) {
  const { type, data } = barcodeData;

  // Placeholder for future API validation
  const validateBarcode = async () => {
    // TODO: Implement API lookup/validation
    console.log('Validating barcode:', data);
    // Example:
    // const response = await fetch(`https://api.example.com/validate/${data}`);
    // const result = await response.json();
    // return result;
  };

  React.useEffect(() => {
    // Call validation placeholder when component mounts
    validateBarcode();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        <Text style={styles.title}>Barcode Scanned!</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Barcode Type:</Text>
          <Text style={styles.value}>{type}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Barcode Data:</Text>
          <Text style={styles.valueData}>{data}</Text>
        </View>

        <View style={styles.placeholderCard}>
          <Ionicons name="information-circle-outline" size={24} color="#FF9800" />
          <Text style={styles.placeholderText}>
            API validation placeholder - barcode data can be validated here in future implementation
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={onScanAgain}
        >
          <Ionicons name="scan" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan Another Barcode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  valueData: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  placeholderCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  scanButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
