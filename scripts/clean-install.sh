#!/bin/bash

echo "Cleaning node_modules and lock files..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Installing Vite globally..."
sudo npm install -g vite

echo "Installing additional dependencies for Couchbase..."
npm install couchbase dotenv express cors

echo "Installation complete!"
echo "You can now run: npm run dev" 