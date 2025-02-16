import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');

export async function publishPost(slug) {
  try {
    // If no slug provided, let user select from list
    if (!slug) {
      const registry = JSON.parse(
        await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
      );
      
      // Filter to show only draft posts
      const draftPosts = registry.posts.filter(post => post.status === 'draft');
      
      if (draftPosts.length === 0) {
        console.log(chalk.yellow('\nNo draft posts available to publish.'));
        return;
      }

      const { selectedSlug } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedSlug',
          message: 'Select post to publish:',
          choices: draftPosts.map(post => ({
            name: `${post.title} (draft)`,
            value: post.slug
          }))
        }
      ]);
      
      slug = selectedSlug;
    }

    const draftPath = path.join(POSTS_DIR, 'drafts', slug);
    const publishedPath = path.join(POSTS_DIR, 'published', slug);

    // Verify draft exists
    if (!await pathExists(draftPath)) {
      throw new Error(`Draft "${slug}" not found`);
    }

    // Get confirmation
    const metadata = JSON.parse(
      await fs.readFile(path.join(draftPath, 'metadata.json'), 'utf-8')
    );

    console.log(chalk.blue('\nPublishing post:'));
    console.log(chalk.gray('----------------'));
    console.log(chalk.white(`Title: ${metadata.title}`));
    console.log(chalk.white(`Version: ${metadata.version}`));
    console.log(chalk.gray('----------------\n'));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to publish this post?',
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nPublication cancelled'));
      return;
    }

    // Move draft to published
    await fs.mkdir(publishedPath, { recursive: true });
    await fs.rename(draftPath, publishedPath);

    // Update metadata
    metadata.status = 'published';
    metadata.lastModified = getCurrentDate();  // Use the same date format as create
    
    await fs.writeFile(
      path.join(publishedPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Update registry
    const registry = JSON.parse(
      await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
    );
    
    const postIndex = registry.posts.findIndex(p => p.slug === slug);
    if (postIndex !== -1) {
      registry.posts[postIndex] = {
        ...registry.posts[postIndex],
        status: 'published',
        lastModified: metadata.lastModified
      };
      
      await fs.writeFile(
        path.join(POSTS_DIR, 'registry.json'),
        JSON.stringify(registry, null, 2)
      );
    }

    console.log(chalk.green('\n✨ Post published successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white(`1. View your published post: npm run post preview ${slug}`));

  } catch (error) {
    console.error(chalk.red('Error publishing post:'), error);
    process.exit(1);
  }
}

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

function getCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
} 