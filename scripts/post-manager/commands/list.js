import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');

export async function listPosts(options) {
  try {
    const registry = JSON.parse(
      await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
    );

    let posts = registry.posts;

    // Filter based on options
    if (options.drafts) {
      posts = posts.filter(post => post.status === 'draft');
    } else if (options.published) {
      posts = posts.filter(post => post.status === 'published');
    }

    // Sort by modified date
    posts.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    console.log(chalk.blue('\nPosts:'));
    console.log(chalk.gray('----------------'));

    if (posts.length === 0) {
      console.log(chalk.yellow('No posts found'));
    } else {
      posts.forEach(post => {
        const status = post.status === 'published' 
          ? chalk.green('published')
          : chalk.yellow('draft');
        
        console.log(chalk.white(`\n${post.title}`));
        console.log(chalk.gray(`Slug: ${post.slug}`));
        console.log(chalk.gray(`Status: ${status}`));
        console.log(chalk.gray(`Version: ${post.version}`));
        console.log(chalk.gray(`Modified: ${new Date(post.modified).toLocaleString()}`));
      });
    }

    console.log(chalk.gray('\n----------------'));

  } catch (error) {
    console.error(chalk.red('Error listing posts:'), error);
    process.exit(1);
  }
} 