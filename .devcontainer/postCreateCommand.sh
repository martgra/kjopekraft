#!/bin/bash

set -e

# Fix node_modules permissions if it exists
if [ -d "/workspace/node_modules" ]; then
    echo "Fixing node_modules permissions..."
    sudo chown -R vscode:vscode /workspace/node_modules
fi

# Install Playwright browsers
echo "Installing Playwright browsers..."
bunx playwright install chromium --with-deps