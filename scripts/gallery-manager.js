#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import sharp from 'sharp';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { parseYouTubeId, posterUrl } from '../src/utils/youtube.js';

const execFileAsync = promisify(execFile);
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GALLERY_ROOT = path.join(__dirname, '../public/assets/gallery');
const GALLERY_DATA = path.join(__dirname, '../src/data/gallery.json');
const INPUT_DIR = path.join(GALLERY_ROOT, 'input');
const IMAGES_DIR = path.join(GALLERY_ROOT, 'images');
const THUMBNAILS_DIR = path.join(GALLERY_ROOT, 'thumbnails');
const ANIMATIONS_DIR = path.join(GALLERY_ROOT, 'animations');
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

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
      message: 'Enter image description (optional):',
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
    description: answers.description || '',
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


// Pull a poster frame from a video with ffmpeg, then run it through the same
// sharp path an image uses, so animation thumbnails match painting thumbnails
// exactly (400x400, same crop, same quality).
async function generateVideoThumbnail(videoPath, outputPath) {
  const frame = outputPath.replace(/\.[^.]+$/, '_frame.png');
  // -ss before -i seeks fast; 1s in avoids a black first frame.
  await execFileAsync('ffmpeg', ['-y', '-ss', '1', '-i', videoPath, '-vframes', '1', frame]);
  await generateThumbnail(frame, outputPath);
  await fs.unlink(frame).catch(() => {});
}

// Download the YouTube poster ONCE, at add-time, and store it locally. The
// rendered grid then makes no third-party request - visitors only reach Google
// if they actually open the piece.
async function downloadYouTubePoster(id, outputPath) {
  const url = posterUrl(id);
  const res = await fetch(url);
  // maxresdefault does not exist for every video; hqdefault always does.
  const ok = res.ok ? res : await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
  if (!ok.ok) throw new Error(`Could not fetch a poster for ${id} (HTTP ${ok.status})`);
  const buf = Buffer.from(await ok.arrayBuffer());
  const tmp = outputPath.replace(/\.[^.]+$/, '_src.jpg');
  await fs.writeFile(tmp, buf);
  await generateThumbnail(tmp, outputPath);
  await fs.unlink(tmp).catch(() => {});
}

async function appendItem(item) {
  const galleryData = JSON.parse(await fs.readFile(GALLERY_DATA, 'utf8'));
  galleryData.items.push(item);
  await fs.writeFile(GALLERY_DATA, JSON.stringify(galleryData, null, 2));
}

// Process a local video file into an animation entry.
async function processVideo(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const id = uuidv4();
  const ext = path.extname(filename);

  const answers = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter animation title:', validate: (i) => i.length > 0 },
    { type: 'input', name: 'description', message: 'Enter description (optional):' },
  ]);

  await fs.mkdir(ANIMATIONS_DIR, { recursive: true });
  const videoName = `${id}${ext}`;
  const thumbName = `${id}_thumb.jpg`;

  await fs.copyFile(inputPath, path.join(ANIMATIONS_DIR, videoName));
  await generateVideoThumbnail(inputPath, path.join(THUMBNAILS_DIR, thumbName));

  await appendItem({
    id,
    type: 'animation',
    source: 'file',
    title: answers.title,
    description: answers.description || '',
    thumbnail: `/assets/gallery/thumbnails/${thumbName}`,
    video: `/assets/gallery/animations/${videoName}`,
    dateAdded: new Date().toISOString(),
  });

  await fs.unlink(inputPath);
  console.log(chalk.green(`✓ Added animation ${answers.title}`));
}

// Add a YouTube-hosted animation. Nothing is downloaded except the poster.
async function addYouTube() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'YouTube URL or video id:',
      validate: (i) => (parseYouTubeId(i) ? true : 'Not a YouTube URL or 11-character id'),
    },
    { type: 'input', name: 'title', message: 'Enter animation title:', validate: (i) => i.length > 0 },
    { type: 'input', name: 'description', message: 'Enter description (optional):' },
  ]);

  const youtubeId = parseYouTubeId(answers.url);
  const id = uuidv4();
  const thumbName = `${id}_thumb.jpg`;

  await downloadYouTubePoster(youtubeId, path.join(THUMBNAILS_DIR, thumbName));

  await appendItem({
    id,
    type: 'animation',
    source: 'youtube',
    title: answers.title,
    description: answers.description || '',
    thumbnail: `/assets/gallery/thumbnails/${thumbName}`,
    youtubeId,
    dateAdded: new Date().toISOString(),
  });

  console.log(chalk.green(`✓ Added YouTube animation ${answers.title}`));
}

// Main function
async function main() {
  try {
    await ensureDirectories();
    
    const files = await fs.readdir(INPUT_DIR);
    const mediaFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i.test(file)
    );

    // A YouTube piece has no file to drop in, so offer it whenever the input
    // directory is empty - otherwise there would be no way to add one.
    if (mediaFiles.length === 0) {
      const { addYt } = await inquirer.prompt([{
        type: 'confirm',
        name: 'addYt',
        message: 'No files in the input directory. Add a YouTube animation instead?',
        default: false,
      }]);
      if (addYt) {
        await addYouTube();
        console.log(chalk.green('\n✨ Done!'));
        return;
      }
      console.log(chalk.yellow('Nothing to process.'));
      console.log(chalk.blue(`Place images or videos in: ${INPUT_DIR}`));
      return;
    }

    console.log(chalk.blue(`Found ${mediaFiles.length} file(s) to process\n`));

    for (const file of mediaFiles) {
      console.log(chalk.cyan(`Processing ${file}...`));
      // Videos become animations; everything else stays an image.
      if (VIDEO_EXT.test(file)) {
        await processVideo(file);
      } else {
        await processImage(file);
      }
    }

    const { addYt } = await inquirer.prompt([{
      type: 'confirm',
      name: 'addYt',
      message: 'Also add a YouTube animation?',
      default: false,
    }]);
    if (addYt) await addYouTube();

    console.log(chalk.green('\n✨ All files processed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

main(); 