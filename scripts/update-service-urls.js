#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const servicesPath = path.join(__dirname, '../src/data/services.json');

async function addCacheBustingToIcons() {
  try {
    console.log('Reading services.json...');
    const servicesData = JSON.parse(await fs.readFile(servicesPath, 'utf8'));
    
    // Generate a timestamp for cache busting
    const timestamp = Date.now();
    
    // Update each service icon URL with a cache-busting parameter
    let updateCount = 0;
    
    servicesData.categories.forEach(category => {
      category.services.forEach(service => {
        // Only modify SVG icon URLs
        if (service.icon && service.icon.endsWith('.svg')) {
          // Add or update the cache-busting parameter
          service.icon = service.icon.split('?')[0] + `?v=${timestamp}`;
          updateCount++;
        }
      });
    });
    
    // Write the updated data back to the file
    await fs.writeFile(servicesPath, JSON.stringify(servicesData, null, 2));
    
    console.log(`✅ Updated ${updateCount} icon URLs with cache-busting parameters`);
    console.log(`Timestamp used: ${timestamp}`);
  } catch (error) {
    console.error('Error updating icon URLs:', error);
  }
}

// Run the function
addCacheBustingToIcons(); 