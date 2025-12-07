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

Setup environment:

```bash
cd THIS_DIRECTORY
conda create -n barcode-scanner python=3.11 pip -y
conda activate barcode-scanner
pip install -r requirements.txt
```

Each command on separate terminals:

```bash
ngrok http 3000
python config_window.py
# make sure to add the excel sheet & ngrok url from the terminal running ngrok
npm run server
npx expo start --tunnel
```