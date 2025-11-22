import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MultiBarcodeList({ barcodes, onSelectBarcode }) {
  if (barcodes.length === 0) {
    return null;
  }

  const renderBarcodeItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.barcodeItem}
      onPress={() => onSelectBarcode(item)}
      activeOpacity={0.7}
    >
      <View style={styles.barcodeContent}>
        <View style={styles.barcodeInfo}>
          <Text style={styles.barcodeType}>{item.type}</Text>
          <Text style={styles.barcodeData}>{item.data}</Text>
        </View>
        <Ionicons name="add-circle" size={32} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="barcode-outline" size={20} color="#fff" />
        <Text style={styles.headerText}>
          {barcodes.length} Barcode{barcodes.length !== 1 ? 's' : ''} Detected
        </Text>
      </View>
      <FlatList
        data={barcodes}
        renderItem={renderBarcodeItem}
        keyExtractor={(item, index) => `${item.data}-${item.timestamp}-${index}`}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2,
    borderTopColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  barcodeItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  barcodeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barcodeInfo: {
    flex: 1,
    marginRight: 10,
  },
  barcodeType: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  barcodeData: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
});
