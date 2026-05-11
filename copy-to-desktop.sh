#!/bin/bash

# Get the Windows Desktop path dynamically
DESKTOP_PATH=$(powershell.exe -Command "Write-Output ([Environment]::GetFolderPath('Desktop'))" | tr -d '\r' | xargs -0 wslpath)
DESTINATION="$DESKTOP_PATH/ks4gt-dist"

echo "Building project..."
npm run build

echo "Copying /dist to $DESTINATION..."
# Create destination directory if it doesn't exist
mkdir -p "$DESTINATION"

# Use rsync to sync the folders (cleaner than cp for repeated runs)
rsync -av --delete dist/ "$DESTINATION/"

echo "Done! The extension is ready at: $DESTINATION"
echo "In Chrome/Firefox, load the folder: C:\\Users\\$(cmd.exe /c "echo %USERNAME%" | tr -d '\r')\\Desktop\\ks4gt-dist"
