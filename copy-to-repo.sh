#!/bin/bash

# Quick file copy script for mins-mini-games
echo "📁 Copying game files to mins-mini-games repository..."

# Check if the destination exists
if [ ! -d "/Users/Hibikisori/Documents/python-projects/mins-mini-games" ]; then
    echo "❌ Error: mins-mini-games directory not found!"
    echo "Please clone the repository first using GitHub Desktop"
    exit 1
fi

# Copy all files
echo "Copying files..."
cp -r /Users/Hibikisori/Documents/python-projects/web-browser-games/* /Users/Hibikisori/Documents/python-projects/mins-mini-games/

echo "✅ Files copied successfully!"
echo ""
echo "Next steps:"
echo "1. Open GitHub Desktop"
echo "2. Select the mins-mini-games repository"
echo "3. You should see all your game files as changes"
echo "4. Add commit message: 'Add Min's Mini Games collection'"
echo "5. Click 'Commit to main'"
echo "6. Click 'Push origin'"
echo ""
echo "Then enable GitHub Pages at:"
echo "https://github.com/hibikisori/mins-mini-games/settings/pages"
