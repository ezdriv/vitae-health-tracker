#!/bin/bash
# Serve Vitae locally for PWA install and offline support
cd "$(dirname "$0")"
echo "Vitae Health Tracker → http://localhost:8080"
echo "Press Ctrl+C to stop"
python3 -m http.server 8080