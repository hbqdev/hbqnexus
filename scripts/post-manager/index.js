#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { createPost } from './commands/create.js';
import { editPost } from './commands/edit.js';
import { publishPost } from './commands/publish.js';
import { previewPost } from './commands/preview.js';
import { listPosts } from './commands/list.js';
import { deletePost } from './commands/delete.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../src/posts');

async function main() {
  while (true) {
    console.clear();
    console.log(chalk.blue('\n=== Post Manager ==='));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📝 Create new post', value: 'create' },
          { name: '✏️ Edit post', value: 'edit' },
          { name: '👀 Preview post', value: 'preview' },
          { name: '🚀 Publish post', value: 'publish' },
          { name: '📋 List all posts', value: 'list' },
          { name: '🗑️ Delete post', value: 'delete' },
          { name: '👋 Exit', value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      console.log(chalk.yellow('\nGoodbye! 👋'));
      process.exit(0);
    }

    try {
      switch (action) {
        case 'create':
          await createPost();
          break;
        case 'edit':
          await editPost();
          break;
        case 'preview':
          await previewPost();
          break;
        case 'publish':
          await publishPost();
          break;
        case 'list':
          await listPosts({});
          break;
        case 'delete':
          // Get list of posts for selection
          const registry = JSON.parse(
            await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
          );
          
          const { postToDelete } = await inquirer.prompt([
            {
              type: 'list',
              name: 'postToDelete',
              message: 'Select post to delete:',
              choices: registry.posts.map(post => ({
                name: `${post.title} (${post.status})`,
                value: post.slug
              }))
            }
          ]);

          await deletePost(postToDelete);
          
          // Hard delete files
          const draftPath = path.join(POSTS_DIR, 'drafts', postToDelete);
          const publishedPath = path.join(POSTS_DIR, 'published', postToDelete);
          
          try {
            await fs.rm(draftPath, { recursive: true, force: true });
            await fs.rm(publishedPath, { recursive: true, force: true });
          } catch (error) {
            // Ignore errors if files don't exist
          }
          break;
      }

      // Pause to show results
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: 'Press Enter to continue...'
        }
      ]);

    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: 'Press Enter to continue...'
        }
      ]);
    }
  }
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
}); 