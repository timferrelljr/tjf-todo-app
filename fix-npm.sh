#!/bin/bash

echo "🔧 Fixing npm permissions and installing dependencies..."

# Remove npm cache completely
echo "Removing npm cache..."
sudo rm -rf ~/.npm

# Fix npm permissions
echo "Fixing npm permissions..."
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Create npm directories with correct permissions
echo "Creating npm directories..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH (you may need to add this to your ~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Install dependencies
echo "Installing dependencies..."
npm install

echo "✅ Setup complete! You may need to restart your terminal or run 'source ~/.bashrc' (or ~/.zshrc)"
echo "Then try: npm run dev"