#!/usr/bin/env node
// Suppress punycode warning
process.removeAllListeners('warning');

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fetch } from 'undici';
import { v4 as uuidv4 } from 'uuid';
import { extract } from '@extractus/article-extractor';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import metascraper from 'metascraper';
import metascraperDate from 'metascraper-date';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_FILE = path.join(__dirname, '../src/data/shared-content.json');

const scraper = metascraper([
  metascraperDate()
]);

async function extractContent(url) {
  try {
    // Fetch the page HTML first
    const response = await fetch(url);
    const html = await response.text();

    // Extract metadata including date using metascraper
    const metadata = await scraper({ html, url });

    // Extract article content and metadata
    const article = await extract(url);
    
    if (!article) {
      throw new Error('Failed to extract article content');
    }

    // Try different date sources in order of reliability
    let publishDate;
    try {
      // 1. Try metascraper date first
      if (metadata.date) {
        publishDate = new Date(metadata.date);
      } 
      // 2. Try article's published date
      else if (article.published) {
        publishDate = new Date(article.published);
      } 
      // 3. Try to find date in content (between title and first paragraph)
      else {
        const titleToFirstPara = article.content.substring(
          0, 
          article.content.indexOf('</p>')
        );
        
        // Look for common date patterns
        const datePatterns = [
          // August 2013
          /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i,
          // 08/2013 or 08-2013
          /\d{1,2}[\/-]\d{4}/,
          // 2013-08 or 2013/08
          /\d{4}[\/-]\d{1,2}/,
          // Aug 2013
          /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i
        ];
        
        for (const pattern of datePatterns) {
          const match = titleToFirstPara.match(pattern);
          if (match) {
            publishDate = new Date(match[0]);
            break;
          }
        }
        
        // If still no date found, use current date
        if (!publishDate || isNaN(publishDate.getTime())) {
          publishDate = new Date();
        }
      }
      
      // Validate the date
      if (isNaN(publishDate.getTime())) {
        publishDate = new Date();
      }
    } catch (e) {
      console.log(chalk.yellow(`Warning: Failed to parse date for ${url}. Using current date.`));
      publishDate = new Date();
    }
    
    // Clean the content and ensure images are preserved
    const cleanContent = DOMPurify.sanitize(article.content, {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['src', 'alt'],
      KEEP_CONTENT: true,
      RETURN_DOM: true
    });
    
    // Remove any duplicate images that are also in the media section
    if (article.image) {
      const heroImageSrc = article.image;
      const images = cleanContent.getElementsByTagName('img');
      for (let i = images.length - 1; i >= 0; i--) {
        if (images[i].src === heroImageSrc) {
          images[i].remove();
        }
      }
    }
    
    // Find YouTube URLs in the content
    const videoUrls = article.content.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s"'<>]+)/g) || [];
    
    // Extract video IDs
    const videoIds = videoUrls.map(url => 
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s"'<>]+)/)?.[1]
    ).filter(Boolean);
    
    const media = {
      images: article.image ? [{ 
        url: article.image, 
        alt: article.title,
        isHero: true
      }] : [],
      videos: videoIds.map(id => ({
        type: 'youtube',
        id,
        url: `https://www.youtube.com/watch?v=${id}`
      }))
    }
    
    return {
      title: article.title,
      content: cleanContent.innerHTML,
      author: article.author,
      dateAdded: publishDate.toISOString(),
      description: article.description,
      media
    };
  } catch (error) {
    console.error('Failed to extract content:', error);
    return null;
  }
}

async function getYouTubeInfo(url) {
  // Extract video ID and fetch basic info using YouTube API
  // (You'll need to add YouTube API key for this)
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/)[1];
  return {
    type: 'video',
    videoId,
    // Add other YouTube metadata as needed
  };
}

async function addNewContent() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter content URL:',
      validate: input => input.startsWith('http')
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter your thoughts/description (optional):',
    }
  ]);

  let content;
  let type = 'article';

  if (answers.url.includes('youtube.com') || answers.url.includes('youtu.be')) {
    content = await getYouTubeInfo(answers.url);
    type = 'video';
  } else {
    content = await extractContent(answers.url);
    
    if (!content) {
      const manualContent = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Enter content title:',
          validate: input => input.length > 0
        },
        {
          type: 'editor',
          name: 'content',
          message: 'Paste the article content:',
        }
      ]);
      content = manualContent;
    }
  }

  // Load existing content
  let sharedContent = { items: [] };
  try {
    sharedContent = JSON.parse(await fs.readFile(CONTENT_FILE, 'utf8'));
  } catch (error) {
    // File doesn't exist yet, use default empty structure
  }

  // Add new content
  sharedContent.items.unshift({
    id: uuidv4(),
    url: answers.url,
    type,
    title: content.title,
    content: type === 'article' ? content.content : null,
    author: content.author,
    siteName: content.siteName,
    description: answers.description,
    dateAdded: content.dateAdded,
    media: content.media || { images: [], videos: [] }
  });

  // Save updated content
  await fs.writeFile(
    CONTENT_FILE,
    JSON.stringify(sharedContent, null, 2)
  );

  console.log(chalk.green('✓ Content added successfully!'));
}

async function listContent() {
  try {
    const sharedContent = JSON.parse(await fs.readFile(CONTENT_FILE, 'utf8'));
    if (sharedContent.items.length === 0) {
      console.log(chalk.yellow('No content found.'));
      return;
    }

    console.log(chalk.blue('\nCurrent content:'));
    sharedContent.items.forEach((item, index) => {
      console.log(chalk.white(`\n${index + 1}. ${item.title}`));
      console.log(chalk.gray(`   Type: ${item.type}`));
      console.log(chalk.gray(`   Added: ${new Date(item.dateAdded).toLocaleDateString()}`));
      console.log(chalk.gray(`   URL: ${item.url}`));
    });
  } catch (error) {
    console.error(chalk.red('Error listing content:'), error);
  }
}

async function removeContent() {
  try {
    const sharedContent = JSON.parse(await fs.readFile(CONTENT_FILE, 'utf8'));
    if (sharedContent.items.length === 0) {
      console.log(chalk.yellow('No content to remove.'));
      return;
    }

    // List all content with numbers
    console.log(chalk.blue('\nSelect content to remove:'));
    const choices = sharedContent.items.map((item, index) => ({
      name: `${index + 1}. ${item.title} (${item.type}) - ${new Date(item.dateAdded).toLocaleDateString()}`,
      value: index
    }));
    choices.push({ name: 'Cancel', value: -1 });

    const { selectedIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedIndex',
        message: 'Which content would you like to remove?',
        choices
      }
    ]);

    if (selectedIndex === -1) {
      console.log(chalk.yellow('Operation cancelled.'));
      return;
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove "${sharedContent.items[selectedIndex].title}"?`,
        default: false
      }
    ]);

    if (confirm) {
      sharedContent.items.splice(selectedIndex, 1);
      await fs.writeFile(CONTENT_FILE, JSON.stringify(sharedContent, null, 2));
      console.log(chalk.green('✓ Content removed successfully!'));
    } else {
      console.log(chalk.yellow('Operation cancelled.'));
    }
  } catch (error) {
    console.error(chalk.red('Error removing content:'), error);
  }
}

async function resetContent() {
  try {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.red('⚠️ Are you sure you want to remove ALL content? This cannot be undone!'),
        default: false
      }
    ]);

    if (confirm) {
      const { doubleConfirm } = await inquirer.prompt([
        {
          type: 'input',
          name: 'doubleConfirm',
          message: 'Type "RESET" to confirm:',
          validate: input => input === 'RESET' || 'Please type RESET to confirm'
        }
      ]);

      if (doubleConfirm === 'RESET') {
        await fs.writeFile(CONTENT_FILE, JSON.stringify({ items: [] }, null, 2));
        console.log(chalk.green('✓ All content has been removed.'));
      }
    } else {
      console.log(chalk.yellow('Operation cancelled.'));
    }
  } catch (error) {
    console.error(chalk.red('Error resetting content:'), error);
  }
}

async function updateExistingContent() {
  try {
    const sharedContent = JSON.parse(await fs.readFile(CONTENT_FILE, 'utf8'));
    if (sharedContent.items.length === 0) {
      console.log(chalk.yellow('No content to update.'));
      return;
    }

    console.log(chalk.blue('\nUpdating content metadata...'));
    let updatedCount = 0;

    // Process each item
    for (const item of sharedContent.items) {
      if (item.type === 'article') {
        console.log(chalk.gray(`Processing: ${item.title}`));
        
        try {
          // Keep only the essential properties
          const { url, id, description } = item;
          
          // Re-extract content using the same logic as adding new content
          const newContent = await extractContent(url);
          
          if (newContent) {
            // Update the item with fresh content while preserving id and description
            Object.assign(item, {
              id,
              url,
              type: 'article',
              title: newContent.title,
              content: newContent.content,
              author: newContent.author,
              dateAdded: newContent.dateAdded,
              description,
              media: newContent.media
            });
            
            updatedCount++;
            console.log(chalk.green(`✓ Updated: ${item.title}`));
            console.log(chalk.gray(`   Date: ${new Date(newContent.dateAdded).toLocaleDateString()}`));
            console.log(chalk.gray(`   Author: ${newContent.author || 'none'}`));
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠ Failed to update: ${item.title}`));
          console.log(chalk.gray(`   Error: ${error.message}`));
        }
      }
    }

    if (updatedCount > 0) {
      await fs.writeFile(CONTENT_FILE, JSON.stringify(sharedContent, null, 2));
      console.log(chalk.green(`\n✓ Updated ${updatedCount} items successfully!`));
    } else {
      console.log(chalk.blue('\nNo updates needed.'));
    }
  } catch (error) {
    console.error(chalk.red('Error updating content:'), error);
  }
}

async function main() {
  while (true) {
    try {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'What would you like to do?',
          choices: [
            { name: 'Add new content', value: 'add' },
            { name: 'List all content', value: 'list' },
            { name: 'Remove content', value: 'remove' },
            { name: 'Update existing content metadata', value: 'update' },
            { name: 'Reset all content', value: 'reset' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      switch (choice) {
        case 'add':
          await addNewContent();
          break;
        case 'list':
          await listContent();
          break;
        case 'remove':
          await removeContent();
          break;
        case 'update':
          await updateExistingContent();
          break;
        case 'reset':
          await resetContent();
          break;
        case 'exit':
          console.log(chalk.blue('\nGoodbye! 👋'));
          process.exit(0);
      }

      // Ask if user wants to perform another action
      const { continue: shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Would you like to perform another action?',
          default: true
        }
      ]);

      if (!shouldContinue) {
        console.log(chalk.blue('\nGoodbye! 👋'));
        break;
      }
      console.log('\n'); // Add spacing between operations
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  }
}

main(); 