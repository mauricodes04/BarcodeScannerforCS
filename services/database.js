// Server configuration
// Update this IP address to your computer's local IP when testing on a physical device
// For emulator/simulator, use localhost or 10.0.2.2 (Android) or localhost (iOS)
const SERVER_URL = 'http://172.20.6.117:3000/api';

// Save a barcode to the server
export const saveBarcode = async (barcodeData) => {
  console.log('[DATABASE] Starting saveBarcode request');
  console.log('[DATABASE] Barcode data:', barcodeData.data);
  console.log('[DATABASE] Server URL:', SERVER_URL);
  try {
    console.log('[DATABASE] Sending POST request...');
    const response = await fetch(`${SERVER_URL}/barcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: barcodeData.data,
      }),
    });

    console.log('[DATABASE] Response status:', response.status);
    console.log('[DATABASE] Parsing JSON response...');
    const result = await response.json();
    console.log('[DATABASE] Response result:', result);
    
    if (result.success) {
      console.log('[DATABASE] Success! Found:', result.found, 'Already marked:', result.alreadyMarked);
      return { 
        success: true, 
        found: result.found,
        alreadyMarked: result.alreadyMarked || false,
        message: result.message,
        barcode: {
          ...barcodeData,
          savedAt: new Date().toISOString(),
          id: `${barcodeData.data}_${Date.now()}`,
        }
      };
    } else {
      console.log('[DATABASE] Server returned error:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('[DATABASE] Exception caught:', error.name);
    console.error('[DATABASE] Error message:', error.message);
    console.error('[DATABASE] Stack:', error.stack);
    return { success: false, error: error.message };
  }
};

// Get all saved barcodes from the server
export const getAllBarcodes = async () => {
  console.log('[DATABASE] Getting all barcodes from:', SERVER_URL);
  try {
    const response = await fetch(`${SERVER_URL}/barcodes`);
    console.log('[DATABASE] Response status:', response.status);
    const data = await response.json();
    console.log('[DATABASE] Received', data?.length || 0, 'barcodes');
    return data || [];
  } catch (error) {
    console.error('[DATABASE] Error getting barcodes:', error.message);
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
