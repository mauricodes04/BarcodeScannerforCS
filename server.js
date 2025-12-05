const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// ============================================================================
// CONFIGURATION LOADER
// ============================================================================
let config;
try {
  const configData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
  config = JSON.parse(configData);
  console.log('✅ Configuration loaded from config.json');
} catch (error) {
  console.error('\n' + '='.repeat(60));
  console.error('❌ FATAL ERROR: config.json not found or invalid.');
  console.error('='.repeat(60));
  console.error('\nRun: python config_window.py');
  console.error('\nTo create the configuration file.\n');
  console.error('Error details:', error.message);
  console.error('='.repeat(60) + '\n');
  process.exit(1);
}

// Extract configuration constants
const EXCEL_FILE = config.excel.filePath;
const INVENTORY_SHEET = config.excel.sheets.inventory;
const OTHER_SHEET = config.excel.sheets.other;
const ASSET_ID_COLS = config.excel.columns.assetIdSearch.filter(x => x !== null && x !== undefined);
const ASSET_NAME_COL = config.excel.columns.assetName;
const ASSET_DESC_COL = config.excel.columns.assetDescription;
const STATUS_COL = config.excel.columns.status;
const LOCATION_COL = config.excel.columns.location;
const ROOM_COL = config.excel.columns.room;
const MARKED_CHECK_COL = config.excel.columns.markedCheck;
const COUNT_START_ROW = config.excel.counting.startRow;
const COUNT_END_ROW = config.excel.counting.endRow;
const TOTAL_COUNT = config.excel.counting.totalCount;

// ============================================================================
// EXPRESS SERVER SETUP
// ============================================================================
const app = express();
const PORT = 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  next();
});

// Process barcode and update Excel file
app.post('/api/barcode', (req, res) => {
  try {
    const { data, status, location, room } = req.body;
    
    if (!data) {
      return res.status(400).json({ success: false, error: 'Barcode data is required' });
    }

    if (!fs.existsSync(EXCEL_FILE)) {
      return res.status(500).json({ 
        success: false, 
        error: 'Excel file not found at specified location' 
      });
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet1Name = INVENTORY_SHEET;
    const otherSheetName = OTHER_SHEET;
    
    if (!workbook.Sheets[sheet1Name]) {
      return res.status(500).json({ 
        success: false, 
        error: 'Sheet1 not found in Excel file' 
      });
    }

    const sheet1 = workbook.Sheets[sheet1Name];
    const sheet1Data = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });
    
    let found = false;

    // Search for ASSET ID in configured columns
    for (let i = 0; i < sheet1Data.length; i++) {
      const row = sheet1Data[i];
      
      // Check all configured Asset ID columns
      let assetFound = false;
      for (const colIdx of ASSET_ID_COLS) {
        const cellValue = row[colIdx];
        const match = cellValue !== undefined && cellValue !== null && String(cellValue).trim() === String(data).trim();
        if (match) {
          assetFound = true;
          break;
        }
      }
      
      if (assetFound) {
        // Get Asset Name value from configured column
        const assetNameValue = row[ASSET_NAME_COL];
        const lValue = assetNameValue ? String(assetNameValue).trim() : '';
        
        // Check if Status column is empty
        const statusValue = row[STATUS_COL];
        
        if (!statusValue || String(statusValue).trim() === '') {
          // Mark status in configured column
          const cellAddressS = XLSX.utils.encode_cell({ r: i, c: STATUS_COL });
          sheet1[cellAddressS] = { t: 's', v: status || 'F' };
          
          // Write location to configured column
          if (location) {
            const cellAddressT = XLSX.utils.encode_cell({ r: i, c: LOCATION_COL });
            sheet1[cellAddressT] = { t: 's', v: location };
          }
          
          // Write room number to configured column
          if (room) {
            const cellAddressU = XLSX.utils.encode_cell({ r: i, c: ROOM_COL });
            sheet1[cellAddressU] = { t: 's', v: room };
          }
          
          found = true;
          
          // Count marked items in configured column and row range
          // Count AFTER marking to include current item
          let markedCount = 0;
          for (let j = COUNT_START_ROW - 1; j <= COUNT_END_ROW - 1; j++) {
            const markedValue = sheet1Data[j] ? sheet1Data[j][MARKED_CHECK_COL] : null;
            if (markedValue && String(markedValue).trim() !== '') {
              markedCount++;
            }
          }
          
          XLSX.writeFile(workbook, EXCEL_FILE);
          
          return res.json({ 
            success: true, 
            found: true,
            lValue: lValue,
            markedCount: markedCount,
            totalCount: TOTAL_COUNT,
            message: `${lValue} Found! ${markedCount}/${TOTAL_COUNT}`,
            barcode: { data }
          });
        } else {
          // Already marked
          found = true;
          return res.json({ 
            success: true, 
            found: true,
            alreadyMarked: true,
            lValue: lValue,
            message: `${lValue} Exists`,
            barcode: { data }
          });
        }
      }
    }

    if (!found) {
      // Not found in Sheet1, check Other sheet
      let otherSheet = workbook.Sheets[otherSheetName];
      
      if (!otherSheet) {
        otherSheet = XLSX.utils.aoa_to_sheet([]);
        workbook.Sheets[otherSheetName] = otherSheet;
        workbook.SheetNames.push(otherSheetName);
      }
      
      const otherSheetData = XLSX.utils.sheet_to_json(otherSheet, { header: 1, defval: '' });
      
      // Check if barcode already exists in Other sheet (Column A)
      const existsInOther = otherSheetData.some((row) => {
        const cellValue = row[0];
        return cellValue !== undefined && cellValue !== null && String(cellValue).trim() === String(data).trim();
      });
      
      if (existsInOther) {
        return res.json({ 
          success: true, 
          found: false,
          alreadyInOther: true,
          message: `Already in 'Other' sheet (duplicate prevented)`,
          barcode: { data }
        });
      }
      
      // Add to Other sheet
      let nextRow = otherSheetData.length;
      const cellAddressA = XLSX.utils.encode_cell({ r: nextRow, c: 0 });
      otherSheet[cellAddressA] = { t: 's', v: data };
      
      // Add location to Column B
      if (location) {
        const cellAddressB = XLSX.utils.encode_cell({ r: nextRow, c: 1 });
        otherSheet[cellAddressB] = { t: 's', v: location };
      }
      
      // Add room to Column C
      if (room) {
        const cellAddressC = XLSX.utils.encode_cell({ r: nextRow, c: 2 });
        otherSheet[cellAddressC] = { t: 's', v: room };
      }
      
      const range = XLSX.utils.decode_range(otherSheet['!ref'] || 'A1');
      if (nextRow > range.e.r) {
        range.e.r = nextRow;
      }
      if (range.e.c < 2) {
        range.e.c = 2;
      }
      otherSheet['!ref'] = XLSX.utils.encode_range(range);
      
      XLSX.writeFile(workbook, EXCEL_FILE);
      
      res.json({ 
        success: true, 
        found: false,
        notInInventory: true,
        message: `Found! But not what we're looking for. Added to 'Other' sheet`,
        barcode: { data }
      });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all scanned barcodes from the "Other" sheet
app.get('/api/barcodes', (req, res) => {
  try {
    if (!fs.existsSync(EXCEL_FILE)) {
      return res.json([]);
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const otherSheetName = OTHER_SHEET;
    
    if (!workbook.Sheets[otherSheetName]) {
      return res.json([]);
    }

    const otherSheet = workbook.Sheets[otherSheetName];
    const otherSheetData = XLSX.utils.sheet_to_json(otherSheet, { header: 1, defval: '' });
    
    const barcodes = otherSheetData
      .map(row => row[0])
      .filter(value => value && String(value).trim() !== '')
      .map(data => ({ data: String(data).trim() }));
    
    res.json(barcodes);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lookup barcode without modifying the file
app.get('/api/barcode/lookup/:barcode', (req, res) => {
  console.log('\n📡 Lookup request received');
  try {
    const { barcode } = req.params;
    console.log('Barcode to lookup:', barcode);
    
    if (!barcode) {
      console.error('❌ No barcode provided');
      return res.status(400).json({ success: false, error: 'Barcode is required' });
    }

    if (!fs.existsSync(EXCEL_FILE)) {
      console.error('❌ Excel file not found');
      return res.status(500).json({ 
        success: false, 
        error: 'Excel file not found at specified location' 
      });
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet1Name = INVENTORY_SHEET;
    
    if (!workbook.Sheets[sheet1Name]) {
      console.error('❌ Sheet1 not found');
      return res.status(500).json({ 
        success: false, 
        error: 'Sheet1 not found in Excel file' 
      });
    }

    const sheet1 = workbook.Sheets[sheet1Name];
    const sheet1Data = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });
    
    // Search for ASSET ID in configured columns
    for (let i = 0; i < sheet1Data.length; i++) {
      const row = sheet1Data[i];
      
      // Check all configured Asset ID columns
      let assetFound = false;
      for (const colIdx of ASSET_ID_COLS) {
        const cellValue = row[colIdx];
        const match = cellValue !== undefined && cellValue !== null && String(cellValue).trim() === String(barcode).trim();
        if (match) {
          assetFound = true;
          break;
        }
      }
      
      if (assetFound) {
        // Get Column G value (Asset Description) - index 6
        const columnG = row[6];
        const assetDescription = columnG ? String(columnG).trim() : '';
        
        // Check if already marked (Column S - index 18)
        const columnS = row[18];
        const isMarked = columnS && String(columnS).trim() !== '';
        
        console.log('✅ Barcode found in inventory');
        console.log('Asset Description:', assetDescription);
        
        return res.json({ 
          success: true, 
          found: true,
          assetDescription: assetDescription,
          assetId: barcode,
          isMarked: isMarked
        });
      }
    }

    // Not found in inventory
    console.log('⚠️ Barcode not found in inventory');
    res.json({ 
      success: true, 
      found: false,
      assetDescription: null,
      assetId: barcode,
      isMarked: false
    });
    
  } catch (error) {
    console.error('❌ Lookup error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const fileExists = fs.existsSync(EXCEL_FILE);
  res.json({ 
    status: 'OK', 
    message: 'Barcode server is running',
    excelFileAccessible: fileExists
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('BARCODE SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Excel file: ${EXCEL_FILE}`);
  console.log(`File exists: ${fs.existsSync(EXCEL_FILE)}`);
  console.log('='.repeat(60));
  console.log('CONFIGURATION:');
  console.log(`  Inventory Sheet: ${INVENTORY_SHEET}`);
  console.log(`  Other Sheet: ${OTHER_SHEET}`);
  console.log(`  Asset ID Columns: ${ASSET_ID_COLS.join(', ')}`);
  console.log(`  Asset Name Col: ${ASSET_NAME_COL}`);
  console.log(`  Asset Desc Col: ${ASSET_DESC_COL}`);
  console.log(`  Status Col: ${STATUS_COL}`);
  console.log(`  Location Col: ${LOCATION_COL}`);
  console.log(`  Room Col: ${ROOM_COL}`);
  console.log(`  Marked Check Col: ${MARKED_CHECK_COL}`);
  console.log(`  Count Range: Rows ${COUNT_START_ROW}-${COUNT_END_ROW} (${TOTAL_COUNT} items)`);
  console.log('='.repeat(60) + '\n');
});
