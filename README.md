# Barcode Scanner for CS

Mobile barcode scanning app for asset inventory management at UTRGV Computer Science department.

## Features

- Real-time barcode scanning (5-6 digit codes)
- Multi-step status workflow (Found/Transfer/Surplus/Stolen)
- Building and room location tracking
- Excel integration for inventory management
- Dark mode UI with visual feedback

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update Excel file path in `server.js`:
   ```javascript
   const EXCEL_FILE = 'path/to/your/excel/file.xlsx';
   ```

3. Start the server:
   ```bash
   npm run server
   ```

4. Start the app:
   ```bash
   npm start
   ```

## Tech Stack

- React Native (Expo)
- Express.js backend
- xlsx for Excel file handling
- expo-camera for barcode scanning

## Usage

Scan barcodes → Select status → Choose building → Enter room → Submit. Data automatically syncs to Excel (Sheet1 for inventory, Other for non-inventory items).
