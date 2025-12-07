#!/bin/bash

# Quick server script for the booking UI
# This starts a local web server and shows you how to access it from your phone

echo "🏌️  Austin Golf Booking UI Server"
echo "=================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python 3."
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    IP="localhost"
fi

echo "📱 Server starting..."
echo ""
echo "📍 Access the UI from your phone:"
echo "   http://$IP:8000/booking-ui.html"
echo ""
echo "💡 Make sure your phone is on the same WiFi network!"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""
echo "=================================="
echo ""

# Start the server
if [ "$PYTHON_CMD" == "python3" ]; then
    $PYTHON_CMD -m http.server 8000
else
    $PYTHON_CMD -m SimpleHTTPServer 8000
fi

