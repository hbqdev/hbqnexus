import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');

export async function editPublished(slug) {
  try {
    // If no slug provided, let user select from published posts
    if (!slug) {
      const registry = JSON.parse(
        await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
      );
      
      const publishedPosts = registry.posts.filter(post => post.status === 'published');
      
      if (publishedPosts.length === 0) {
        console.log(chalk.yellow('\nNo published posts available to edit.'));
        return;
      }

      const { selectedSlug } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedSlug',
          message: 'Select published post to edit:',
          choices: publishedPosts.map(post => ({
            name: `${post.title} (${post.date})`,
            value: post.slug
          }))
        }
      ]);
      
      slug = selectedSlug;
    }

    const postPath = path.join(POSTS_DIR, 'published', slug);
    const metadataPath = path.join(postPath, 'metadata.json');
    const contentPath = path.join(postPath, 'content.md');

    // Load current metadata
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    // Get what to edit
    const { editType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'editType',
        message: 'What would you like to edit?',
        choices: [
          { name: 'Quick Edit (Title, Description, Tags)', value: 'quick' },
          { name: 'Full Edit (Content and Metadata)', value: 'full' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);

    if (editType === 'cancel') {
      console.log(chalk.yellow('\nEdit cancelled'));
      return;
    }

    if (editType === 'quick') {
      // Quick edit form
      const updates = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Title:',
          default: metadata.title
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          default: metadata.description
        },
        {
          type: 'input',
          name: 'tags',
          message: 'Tags (comma-separated):',
          default: metadata.tags.join(', '),
          filter: input => input.split(',').map(tag => tag.trim()).filter(Boolean)
        },
        {
          type: 'input',
          name: 'author',
          message: 'Author:',
          default: metadata.author || 'Tin Tran (HBQ)'
        }
      ]);

      // Update metadata
      Object.assign(metadata, updates);
      metadata.lastModified = new Date().toISOString().split('T')[0];
      metadata.version += 1;
      metadata.history.push({
        version: metadata.version,
        date: metadata.lastModified,
        description: 'Quick edit: Updated metadata'
      });

    } else {
      // Full edit - open in VS Code
      const editor = process.env.EDITOR || 'code';
      
      console.log(chalk.blue('\nOpening files in editor...'));
      console.log(chalk.gray('----------------'));
      console.log(chalk.white(`Content: ${contentPath}`));
      console.log(chalk.white(`Metadata: ${metadataPath}`));
      console.log(chalk.gray('----------------\n'));

      // Open both files
      await new Promise((resolve, reject) => {
        const proc = require('child_process').spawn(editor, [postPath], {
          stdio: 'inherit',
          shell: true
        });

        proc.on('exit', code => {
          if (code === 0) resolve();
          else reject(new Error(`Editor exited with code ${code}`));
        });
      });

      // Reload metadata in case it was edited
      const updatedMetadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
      
      // Update version and history
      updatedMetadata.version += 1;
      updatedMetadata.lastModified = new Date().toISOString().split('T')[0];
      updatedMetadata.history.push({
        version: updatedMetadata.version,
        date: updatedMetadata.lastModified,
        description: 'Full edit: Updated content and metadata'
      });

      metadata = updatedMetadata;
    }

    // Save updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Update registry
    const registry = JSON.parse(
      await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
    );
    
    const postIndex = registry.posts.findIndex(p => p.slug === slug);
    if (postIndex !== -1) {
      registry.posts[postIndex] = {
        ...registry.posts[postIndex],
        ...metadata
      };
      
      await fs.writeFile(
        path.join(POSTS_DIR, 'registry.json'),
        JSON.stringify(registry, null, 2)
      );
    }

    console.log(chalk.green('\n✨ Post updated successfully!'));

  } catch (error) {
    console.error(chalk.red('Error editing published post:'), error);
    process.exit(1);
  }
} 