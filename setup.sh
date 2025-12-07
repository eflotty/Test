#!/bin/bash

echo "🏌️ Austin Golf Booking Bot Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Install Playwright browser
echo "🌐 Installing Chromium browser..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Chromium"
    exit 1
fi

echo "✓ Chromium installed"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit austin-golf-bot.js and add your USERNAME and PASSWORD"
echo "2. Set your TARGET_HOUR and TARGET_MINUTE"
echo "3. Test with: node austin-golf-bot.js --now"
echo "4. Schedule real booking: node austin-golf-bot.js --schedule"
echo ""
