@echo off
echo ============================================================
echo Barcode Scanner Configuration Window
echo ============================================================
echo.
echo This will launch the configuration window to set up
echo Excel column mappings for the barcode scanner.
echo.
echo Press any key to continue...
pause > nul

python config_window.py

echo.
echo Configuration window closed.
echo.
echo If you saved a configuration, restart server.js to apply changes.
echo.
pause
