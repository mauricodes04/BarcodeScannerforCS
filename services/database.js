import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@barcode_storage';

// Save a barcode to local storage
export const saveBarcode = async (barcodeData) => {
  try {
    // Get existing barcodes
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const barcodes = existingData ? JSON.parse(existingData) : [];
    
    // Add new barcode with metadata
    const newBarcode = {
      ...barcodeData,
      savedAt: new Date().toISOString(),
      id: `${barcodeData.data}_${Date.now()}`,
    };
    
    barcodes.push(newBarcode);
    
    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(barcodes));
    
    return { success: true, barcode: newBarcode };
  } catch (error) {
    console.error('Error saving barcode:', error);
    return { success: false, error: error.message };
  }
};

// Get all saved barcodes
export const getAllBarcodes = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting barcodes:', error);
    return [];
  }
};

// Delete a specific barcode
export const deleteBarcode = async (barcodeId) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const barcodes = existingData ? JSON.parse(existingData) : [];
    
    const filteredBarcodes = barcodes.filter(b => b.id !== barcodeId);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBarcodes));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting barcode:', error);
    return { success: false, error: error.message };
  }
};

// Clear all barcodes
export const clearAllBarcodes = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error clearing barcodes:', error);
    return { success: false, error: error.message };
  }
};

// Check if a barcode already exists
export const barcodeExists = async (barcodeData) => {
  try {
    const barcodes = await getAllBarcodes();
    return barcodes.some(b => b.data === barcodeData);
  } catch (error) {
    console.error('Error checking barcode:', error);
    return false;
  }
};
