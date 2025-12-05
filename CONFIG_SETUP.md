# Configuration Window Setup and Usage

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

Or with Conda:
```bash
conda install --file requirements.txt
```

## First-Time Setup

### Step 1: Create Configuration

1. Run the configuration window:
```bash
python config_window.py
```

2. Configure the following settings:
   - **Excel File**: Browse to select your Excel file
   - **Sheet Names**: Select which sheets to use for Inventory and Other items
   - **Column Mappings**:
     - Asset ID Columns (1-3): Select columns containing asset IDs (e.g., C, D, E)
     - Asset Name Column: Column with asset name/description (e.g., F)
     - Asset Description Column: Column with full asset description (e.g., G)
     - Status Column: Where to write status (F/T/S/ST) (e.g., P)
     - Building/Location Column: Where to write building code (e.g., Q)
     - Room Column: Where to write room number (e.g., R)
     - Marked Check Column: Column to check if already marked (e.g., S)
   - **Row Range**: Start and end rows for counting marked items (e.g., 6-357)
   - **ngrok URL**: Your current ngrok tunnel URL

3. Click "Test Configuration" to validate settings and preview data

4. Click "Save Configuration" to create `config.json`

### Step 2: Start the Server

```bash
node server.js
```

**Important**: The server will NOT start without a valid `config.json` file. You must run the configuration window first.

## Updating Configuration

### When to Update

- Excel file location changes
- Column structure changes in your spreadsheet
- Sheet names change
- ngrok URL changes (happens on each ngrok restart)
- Row range needs adjustment

### How to Update

1. Run the configuration window again:
```bash
python config_window.py
```

2. Make your changes

3. Click "Save Configuration"
   - Previous config is automatically backed up to `config.json.backup.YYYY-MM-DD-HHMMSS`

4. **Manually restart** the server:
   - Stop the server (Ctrl+C)
   - Start it again: `node server.js`

## Configuration Details

### Column Selection

- **Asset ID Columns**: Select 1-3 columns where asset IDs might appear
  - Duplicates are allowed (e.g., C, C, C to search only column C)
  - Set unused columns to "None"
  - Server searches all non-None columns

- **Column Letters**: A-ZZ supported (indices 0-701)
  - A = index 0
  - Z = index 25
  - AA = index 26
  - AZ = index 51
  - ZZ = index 701

### Real-Time Validation

The configuration window validates settings as you select them:
- ✅ Green checkmark = Configuration valid
- ⚠️ Yellow warning = Configuration works but has warnings (e.g., overlapping columns)
- ❌ Red X = Configuration has errors (e.g., invalid file path)

### Configuration Summary

A live summary shows your current configuration in human-readable format:
```
Asset ID Columns: C, D, E (indices: 2, 3, 4)
Asset Name: F (index: 5)
Asset Description: G (index: 6)
Status: P (index: 15)
Location: Q (index: 16)
Room: R (index: 17)
Marked Check: S (index: 18)
Row Range: 6-357 (Total: 352 items)
ngrok URL: https://example.ngrok-free.dev/api
```

## File Structure

```
BarcodeScannerforCS/
├── config_window.py          # PyQt6 configuration GUI
├── requirements.txt           # Python dependencies
├── config.json               # Generated configuration (required for server)
├── config.json.backup.*      # Automatic backups of previous configs
├── server.js                 # Node.js server (requires config.json)
├── services/
│   └── database.js          # API client (updated with ngrok URL)
└── ...
```

## Troubleshooting

### Server won't start

**Error**: `❌ FATAL ERROR: config.json not found or invalid.`

**Solution**: Run `python config_window.py` to create the configuration file

### ngrok URL not updating in mobile app

The configuration window updates `services/database.js` automatically. If it fails:
1. Open `services/database.js`
2. Manually update line 3: `const SERVER_URL = 'your-ngrok-url/api';`

### Excel file not found

1. Verify the file path is correct in the configuration window
2. Make sure you have read/write permissions
3. Close Excel if the file is open (may cause locking issues)

### Column validation errors

- Ensure selected columns exist in your Excel file
- Check that column letters are within A-ZZ range
- Verify no critical overlaps (e.g., Asset ID using same column as Status)

## Default Configuration

If you're migrating from the old hardcoded setup, these were the previous defaults:
- Asset ID Columns: C, D, E (indices 2, 3, 4)
- Asset Name: F (index 5)
- Asset Description: G (index 6)
- Status: P (index 15)
- Location: Q (index 16) - was hardcoded as T
- Room: R (index 17) - was hardcoded as U
- Marked Check: S (index 18)
- Row Range: 6-357 (352 items)
