# Barcode Scanner for CS

Mobile barcode scanning app for asset inventory management.

Scan barcodes → Select status → Choose building → Enter room → Submit. Data automatically syncs to Excel (Sheet1 for inventory, Other for non-inventory items).

## Screenshots

<div align="center">
  <img src="assets/1.png" width="200" alt="Camera Scanner" />
  <img src="assets/2.png" width="200" alt="Status Selection" />
  <img src="assets/3.png" width="200" alt="Building Selection" />
  <img src="assets/4.png" width="200" alt="Room Entry" />
  <img src="assets/5.png" width="200" alt="Success Alert" />
</div>

## Setup

Each command on seperate terminals
npm run server
ngrok http 3000
Update database.js with url provided by ngrok
npx expo start --tunnel