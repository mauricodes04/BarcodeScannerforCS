// Server configuration
// Update this IP address to your computer's local IP when testing on a physical device
// For emulator/simulator, use localhost or 10.0.2.2 (Android) or localhost (iOS)
const SERVER_URL = 'http://172.20.18.81:3000/api';

// Save a barcode to the server
export const saveBarcode = async (barcodeData) => {
  try {
    const response = await fetch(`${SERVER_URL}/barcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: barcodeData.data,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        barcode: {
          ...barcodeData,
          savedAt: new Date().toISOString(),
          id: `${barcodeData.data}_${Date.now()}`,
        }
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error saving barcode:', error);
    return { success: false, error: error.message };
  }
};

// Get all saved barcodes from the server
export const getAllBarcodes = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/barcodes`);
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error getting barcodes:', error);
    return [];
  }
};

// Delete a specific barcode from the server
export const deleteBarcode = async (barcodeData) => {
  try {
    const response = await fetch(`${SERVER_URL}/barcode`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: barcodeData,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting barcode:', error);
    return { success: false, error: error.message };
  }
};

// Clear all barcodes from the server
export const clearAllBarcodes = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/barcodes`, {
      method: 'DELETE',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error clearing barcodes:', error);
    return { success: false, error: error.message };
  }
};

// Check if a barcode already exists on the server
export const barcodeExists = async (barcodeData) => {
  try {
    const barcodes = await getAllBarcodes();
    return barcodes.some(b => b.data === barcodeData);
  } catch (error) {
    console.error('Error checking barcode:', error);
    return false;
  }
};
