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

# dist/ is the public web root. Only things safe to serve to the world
# belong here: never .env, never server code, never anything from .git.
echo "Setting up directory structure..."
mkdir -p dist/src/posts

# Posts are fetched at runtime from /src/posts/, so they must ship.
echo "Copying posts..."
cp -r src/posts/* dist/src/posts/

# BlogView fetches /src/data/shared-content.json at runtime; the rest of
# src/data is bundled by Vite via ESM imports, but copying the dir is cheap.
echo "Copying data..."
mkdir -p dist/src/data
cp -r src/data/* dist/src/data/

# Note: public/ is NOT copied here. Vite already emits publicDir contents to
# the dist root, so copying it again just duplicated 15MB of images.
# server/ and .env are NOT copied here either - the API server runs from the
# repo root, and staging its files in the web root published them.

echo "Build completed successfully!"