# Development Setup Guide

## npm Permission Issues

If you're experiencing npm permission issues, follow these steps:

### Option 1: Fix npm Permissions (Recommended)
Run the provided script:
```bash
./fix-npm.sh
```

### Option 2: Manual Fix
```bash
# Remove npm cache completely
sudo rm -rf ~/.npm

# Fix npm permissions  
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Create npm global directory
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to your PATH (add this line to ~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Then install dependencies
npm install
```

### Option 3: Use Different Package Manager
Install yarn as alternative:
```bash
# Install yarn
npm install -g yarn

# Install dependencies with yarn
yarn install

# Run dev server
yarn dev
```

## Full Dependencies
Once npm is working, restore the full package.json dependencies:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.1",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0", 
    "@dnd-kit/utilities": "^3.2.2",
    "lucide-react": "^0.263.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

## Alternative: Use CDN for Quick Demo
You can also run a quick demo by adding these to index.html:
```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
```

## Next Steps After npm Fix
1. Run `npm install` to install all dependencies
2. Copy `.env.example` to `.env.local` and add Supabase credentials
3. Run `npm run dev` to start development server
4. Set up Supabase database using the SQL in README.md

## Project Status
✅ Professional React + TypeScript setup complete
✅ Component architecture and state management ready
✅ Supabase integration configured
✅ UI components and routing implemented
🔧 Waiting for npm permissions fix to install dependencies