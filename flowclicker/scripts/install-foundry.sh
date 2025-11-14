#!/bin/bash
set -e

echo "🔍 Checking for Foundry installation..."

# Check if forge is already installed
if command -v forge &> /dev/null; then
    echo "✅ Foundry is already installed"
    forge --version
    exit 0
fi

echo "📦 Installing Foundry..."

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Add foundry to PATH for this session
export PATH="$HOME/.foundry/bin:$PATH"

# Run foundryup to install forge, cast, anvil, and chisel
if [ -f "$HOME/.foundry/bin/foundryup" ]; then
    $HOME/.foundry/bin/foundryup
else
    bash ~/.foundry/foundryup/foundryup
fi

echo "✅ Foundry installed successfully!"
forge --version
