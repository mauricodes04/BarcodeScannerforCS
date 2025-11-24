const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;
const EXCEL_FILE = 'C:\\Users\\cutem\\OneDrive\\Desktop\\OneDrive\\The University of Texas-Rio Grande Valley\\UTRGV_CS Student Workers - General\\TEST_mauricio.xlsx'; //workstation cloud directory

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
    const sheet1Name = 'Sheet1';
    const otherSheetName = 'Other';
    
    if (!workbook.Sheets[sheet1Name]) {
      return res.status(500).json({ 
        success: false, 
        error: 'Sheet1 not found in Excel file' 
      });
    }

    const sheet1 = workbook.Sheets[sheet1Name];
    const sheet1Data = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });
    
    let found = false;

    // Search for ASSET ID in Columns C, D, and E (index 2, 3, 4)
    for (let i = 0; i < sheet1Data.length; i++) {
      const row = sheet1Data[i];
      const cellValueC = row[2];
      const cellValueD = row[3];
      const cellValueE = row[4];
      
      const matchC = cellValueC !== undefined && cellValueC !== null && String(cellValueC).trim() === String(data).trim();
      const matchD = cellValueD !== undefined && cellValueD !== null && String(cellValueD).trim() === String(data).trim();
      const matchE = cellValueE !== undefined && cellValueE !== null && String(cellValueE).trim() === String(data).trim();
      
      if (matchC || matchD || matchE) {
        // Get Column G value (L) - index 6
        const columnG = row[6];
        const lValue = columnG ? String(columnG).trim() : '';
        
        // Check if Column S (index 18) is empty
        const columnS = row[18];
        
        if (!columnS || String(columnS).trim() === '') {
          // Mark status in Column S
          const cellAddressS = XLSX.utils.encode_cell({ r: i, c: 18 }); // Column S
          sheet1[cellAddressS] = { t: 's', v: status || 'F' };
          
          // Write location abbreviation to Column T (index 19)
          if (location) {
            const cellAddressT = XLSX.utils.encode_cell({ r: i, c: 19 }); // Column T
            sheet1[cellAddressT] = { t: 's', v: location };
          }
          
          // Write room number to Column U (index 20)
          if (room) {
            const cellAddressU = XLSX.utils.encode_cell({ r: i, c: 20 }); // Column U
            sheet1[cellAddressU] = { t: 's', v: room };
          }
          
          found = true;
          
          // Count marked items in Column S (rows 6-357, indices 5-356)
          // Count AFTER marking to include current item
          let markedCount = 0;
          for (let j = 5; j <= 356; j++) {
            const sValue = sheet1Data[j] ? sheet1Data[j][18] : null;
            if (sValue && String(sValue).trim() !== '') {
              markedCount++;
            }
          }
          // Add 1 for the current item we just marked
          markedCount++;
          
          XLSX.writeFile(workbook, EXCEL_FILE);
          
          return res.json({ 
            success: true, 
            found: true,
            lValue: lValue,
            markedCount: markedCount,
            totalCount: 258,
            message: `${lValue} Found! ${markedCount}/258`,
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
    const otherSheetName = 'Other';
    
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
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ success: false, error: 'Barcode is required' });
    }

    if (!fs.existsSync(EXCEL_FILE)) {
      return res.status(500).json({ 
        success: false, 
        error: 'Excel file not found at specified location' 
      });
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet1Name = 'Sheet1';
    
    if (!workbook.Sheets[sheet1Name]) {
      return res.status(500).json({ 
        success: false, 
        error: 'Sheet1 not found in Excel file' 
      });
    }

    const sheet1 = workbook.Sheets[sheet1Name];
    const sheet1Data = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });
    
    // Search for ASSET ID in Columns C, D, and E (index 2, 3, 4)
    for (let i = 0; i < sheet1Data.length; i++) {
      const row = sheet1Data[i];
      const cellValueC = row[2];
      const cellValueD = row[3];
      const cellValueE = row[4];
      
      const matchC = cellValueC !== undefined && cellValueC !== null && String(cellValueC).trim() === String(barcode).trim();
      const matchD = cellValueD !== undefined && cellValueD !== null && String(cellValueD).trim() === String(barcode).trim();
      const matchE = cellValueE !== undefined && cellValueE !== null && String(cellValueE).trim() === String(barcode).trim();
      
      if (matchC || matchD || matchE) {
        // Get Column G value (Asset Description) - index 6
        const columnG = row[6];
        const assetDescription = columnG ? String(columnG).trim() : '';
        
        // Check if already marked (Column S - index 18)
        const columnS = row[18];
        const isMarked = columnS && String(columnS).trim() !== '';
        
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
    res.json({ 
      success: true, 
      found: false,
      assetDescription: null,
      assetId: barcode,
      isMarked: false
    });
    
  } catch (error) {
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
  console.log(`Excel file location: ${EXCEL_FILE}`);
  console.log(`Excel file exists: ${fs.existsSync(EXCEL_FILE)}`);
  console.log('='.repeat(60) + '\n');
});
