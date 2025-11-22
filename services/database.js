
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
        status: barcodeData.status,
        location: barcodeData.location,
        room: barcodeData.room,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        found: result.found,
        alreadyMarked: result.alreadyMarked || false,
        alreadyInOther: result.alreadyInOther || false,
        notInInventory: result.notInInventory || false,
        lValue: result.lValue,
        markedCount: result.markedCount,
        totalCount: result.totalCount,
        message: result.message,
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
