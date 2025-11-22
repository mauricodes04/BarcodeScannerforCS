const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CSV_FILE = path.join(DATA_DIR, 'barcodes.csv');

// Middleware
app.use(express.json());

// CORS middleware to allow requests from React Native app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize CSV file with header if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'barcode_data\n', 'utf8');
}

// Save barcode to CSV
app.post('/api/barcode', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ success: false, error: 'Barcode data is required' });
    }

    // Append to CSV file
    fs.appendFileSync(CSV_FILE, `${data}\n`, 'utf8');
    
    console.log(`Barcode saved: ${data}`);
    res.json({ success: true, barcode: { data } });
  } catch (error) {
    console.error('Error saving barcode:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all barcodes
app.get('/api/barcodes', (req, res) => {
  try {
    if (!fs.existsSync(CSV_FILE)) {
      return res.json([]);
    }

    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '' && line !== 'barcode_data');
    const barcodes = lines.map(line => ({ data: line.trim() }));
    
    res.json(barcodes);
  } catch (error) {
    console.error('Error reading barcodes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a specific barcode
app.delete('/api/barcode', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ success: false, error: 'Barcode data is required' });
    }

    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.split('\n');
    const filteredLines = lines.filter(line => line.trim() !== data);
    
    fs.writeFileSync(CSV_FILE, filteredLines.join('\n'), 'utf8');
    
    console.log(`Barcode deleted: ${data}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting barcode:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all barcodes
app.delete('/api/barcodes', (req, res) => {
  try {
    fs.writeFileSync(CSV_FILE, 'barcode_data\n', 'utf8');
    
    console.log('All barcodes cleared');
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing barcodes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Barcode server is running' });
});

app.listen(PORT, () => {
  console.log(`Barcode server running on http://localhost:${PORT}`);
  console.log(`CSV file location: ${CSV_FILE}`);
});
