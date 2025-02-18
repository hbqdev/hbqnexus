#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import sharp from 'sharp';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GALLERY_ROOT = path.join(__dirname, '../public/assets/gallery');
const GALLERY_DATA = path.join(__dirname, '../src/data/gallery.json');
const INPUT_DIR = path.join(GALLERY_ROOT, 'input');
const IMAGES_DIR = path.join(GALLERY_ROOT, 'images');
const THUMBNAILS_DIR = path.join(GALLERY_ROOT, 'thumbnails');

// Ensure all required directories exist
async function ensureDirectories() {
  await fs.mkdir(INPUT_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
}

// Generate thumbnail for an image
async function generateThumbnail(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(400, 400, {
      fit: 'cover',
      position: 'attention'
    })
    .toFile(outputPath);
}

// Process a single image
async function processImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const id = uuidv4();
  const ext = path.extname(filename);
  
  // Get image details from user
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter image title:',
      validate: input => input.length > 0
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter image description:',
      validate: input => input.length > 0
    },
    {
      type: 'list',
      name: 'category',
      message: 'Select category:',
      choices: [
        'Digital Art',
        'Paintings',
        'Illustrations',
        'AI Generated',
        'Mixed Media'
      ]
    },
    {
      type: 'list',
      name: 'size',
      message: 'Select display size:',
      choices: [
        { name: 'Normal', value: 'normal' },
        { name: 'Large', value: 'large' }
      ]
    }
  ]);

  // Generate new filenames
  const newImageName = `${id}${ext}`;
  const thumbnailName = `${id}_thumb${ext}`;
  
  // Copy and process files
  await fs.copyFile(
    inputPath,
    path.join(IMAGES_DIR, newImageName)
  );
  
  await generateThumbnail(
    inputPath,
    path.join(THUMBNAILS_DIR, thumbnailName)
  );

  // Update gallery data
  const galleryData = JSON.parse(
    await fs.readFile(GALLERY_DATA, 'utf8')
  );

  galleryData.items.push({
    id,
    title: answers.title,
    description: answers.description,
    category: answers.category,
    size: answers.size,
    thumbnail: `/assets/gallery/thumbnails/${thumbnailName}`,
    fullImage: `/assets/gallery/images/${newImageName}`,
    dateAdded: new Date().toISOString()
  });

  await fs.writeFile(
    GALLERY_DATA,
    JSON.stringify(galleryData, null, 2)
  );

  // Remove the original file from input directory
  await fs.unlink(inputPath);

  console.log(chalk.green(`✓ Successfully processed ${filename}`));
}

// Main function
async function main() {
  try {
    await ensureDirectories();
    
    const files = await fs.readdir(INPUT_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log(chalk.yellow('No images found in input directory.'));
      console.log(chalk.blue(`Place images in: ${INPUT_DIR}`));
      return;
    }

    console.log(chalk.blue(`Found ${imageFiles.length} images to process\n`));

    for (const file of imageFiles) {
      console.log(chalk.cyan(`Processing ${file}...`));
      await processImage(file);
    }

    console.log(chalk.green('\n✨ All images processed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

main(); 