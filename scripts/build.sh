#!/bin/bash

# Run vite build
vite build

# Create src/posts directory in dist
mkdir -p dist/src/posts
mkdir -p dist/public

# Copy posts directory structure to dist/src/posts
cp -r src/posts/* dist/src/posts/

# Copy data directory
mkdir -p dist/src/data
cp -r src/data/* dist/src/data/

# Copy public assets to dist root
cp -r public/* dist/public/