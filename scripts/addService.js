#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const servicesPath = path.join(__dirname, '../src/data/services.json');
const svgPath = path.join(__dirname, '../public/assets/services');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function selectCategory(categories) {
  console.log('\nSelect a category:');
  console.log('0. Create new category');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat}`);
  });

  const answer = await question('\nEnter number (or type new category name): ');
  
  // If it's a number and valid selection, return the category
  const num = parseInt(answer);
  if (!isNaN(num)) {
    if (num === 0) {
      const newCategory = await question('Enter new category name: ');
      return newCategory.trim();
    }
    if (num > 0 && num <= categories.length) {
      return categories[num - 1];
    }
  }
  
  // If not a number or invalid selection, treat as new category name
  return answer.trim();
}

function generatePlaceholderSVG(name) {
  const initials = name
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    '#E50914', // Netflix Red
    '#1DB954', // Spotify Green
    '#FF9900', // Amazon Orange
    '#0070E0', // Dropbox Blue
    '#6441A5', // Twitch Purple
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="${randomColor}"/>
  <text x="32" y="32" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="system-ui" font-size="24" font-weight="bold">${initials}</text>
</svg>`;
}

function validateAndFormatUrl(url) {
  // Remove any whitespace
  url = url.trim();

  // Check if it starts with http:// or https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Default to https:// if no protocol specified
    url = 'https://' + url;
  }

  try {
    // Try to construct a URL object to validate
    const urlObject = new URL(url);
    return urlObject.href;
  } catch (error) {
    throw new Error('Invalid URL format. Please enter a valid URL (e.g., tinflix.win or https://tinflix.win)');
  }
}

async function getValidUrl() {
  while (true) {
    try {
      const rawUrl = await question('Service URL: ');
      return validateAndFormatUrl(rawUrl);
    } catch (error) {
      console.error('\n❌ ' + error.message);
      console.log('Please try again.\n');
    }
  }
}

async function addService() {
  try {
    // Read existing services
    const servicesData = JSON.parse(await fs.readFile(servicesPath, 'utf8'));

    // Get categories and show selection
    const categories = servicesData.categories.map(cat => cat.name);
    const category = await selectCategory(categories);

    // Get service details with validation
    console.log('\nEnter service details:');
    const name = await question('Service name: ');
    const url = await getValidUrl();  // Using the new validation function
    const description = await question('Service description: ');
    const useCustomIcon = (await question('Do you have a custom icon? (y/n): ')).toLowerCase() === 'y';

    // Generate or use custom icon
    const iconFileName = name.toLowerCase().replace(/\s+/g, '-') + '.svg';
    const iconPath = path.join(svgPath, iconFileName);
    const iconRelativePath = `/assets/services/${iconFileName}`;

    if (useCustomIcon) {
      console.log(`\nPlease add your icon to: ${iconPath}`);
    } else {
      // Generate placeholder SVG
      await fs.mkdir(svgPath, { recursive: true });
      await fs.writeFile(iconPath, generatePlaceholderSVG(name));
      console.log(`\nGenerated placeholder icon at: ${iconPath}`);
    }

    // Update services.json
    let categoryObj = servicesData.categories.find(cat => cat.name === category);
    if (!categoryObj) {
      categoryObj = {
        name: category,
        services: []
      };
      servicesData.categories.push(categoryObj);
    }

    categoryObj.services.push({
      name,
      url,
      icon: iconRelativePath,
      description
    });

    // Sort categories and services alphabetically
    servicesData.categories.sort((a, b) => a.name.localeCompare(b.name));
    servicesData.categories.forEach(cat => {
      cat.services.sort((a, b) => a.name.localeCompare(b.name));
    });

    // Write back to file
    await fs.writeFile(servicesPath, JSON.stringify(servicesData, null, 2));
    console.log('\nService added successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

addService(); 