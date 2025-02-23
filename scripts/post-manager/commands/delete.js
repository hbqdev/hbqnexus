import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');

export async function deletePost(slug) {
  try {
    const postPath = path.join(POSTS_DIR, 'posts', slug);
    
    if (!await pathExists(postPath)) {
      throw new Error(`Post "${slug}" not found`);
    }

    const metadata = JSON.parse(
      await fs.readFile(path.join(postPath, 'metadata.json'), 'utf-8')
    );

    // Get confirmation
    console.log(chalk.red('\nDeleting post:'));
    console.log(chalk.gray('----------------'));
    console.log(chalk.white(`Title: ${metadata.title}`));
    console.log(chalk.white(`Version: ${metadata.version}`));
    console.log(chalk.gray('----------------\n'));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.red('Are you sure you want to delete this post? This action cannot be undone.'),
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nDeletion cancelled'));
      return;
    }

    // Remove post directory
    await fs.rm(postPath, { recursive: true });

    // Update registry
    const registry = JSON.parse(
      await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
    );
    
    registry.posts = registry.posts.filter(p => p.slug !== slug);
    
    await fs.writeFile(
      path.join(POSTS_DIR, 'registry.json'),
      JSON.stringify(registry, null, 2)
    );

    console.log(chalk.green('\n✨ Post deleted successfully!'));

  } catch (error) {
    console.error(chalk.red('Error deleting post:'), error);
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