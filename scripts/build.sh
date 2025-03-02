#!/bin/bash

# Clean the dist directory first
echo "Cleaning dist directory..."
rm -rf dist

# Update icon cache-busting parameters
echo "Updating icon cache-busting parameters..."
node scripts/update-service-urls.js

# Run vite build
echo "Building with Vite..."
vite build

# Create src/posts directory in dist
echo "Setting up directory structure..."
mkdir -p dist/src/posts
mkdir -p dist/public

# Copy posts directory structure to dist/src/posts
echo "Copying posts..."
cp -r src/posts/* dist/src/posts/

# Copy data directory
echo "Copying data..."
mkdir -p dist/src/data
cp -r src/data/* dist/src/data/

# Copy public assets to dist root
echo "Copying public assets..."
cp -r public/* dist/public/

echo "Build completed successfully!"