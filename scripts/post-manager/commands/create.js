import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');
const DRAFTS_DIR = path.join(POSTS_DIR, 'drafts');

function getCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function createPost() {
  try {
    const { title } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter post title:',
        validate: input => input.trim().length > 0
      }
    ]);

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create post directory structure
    const postDir = path.join(POSTS_DIR, 'posts', slug);
    const assetsDir = path.join(postDir, 'assets');
    
    await fs.mkdir(postDir, { recursive: true });
    await fs.mkdir(assetsDir);
    await fs.mkdir(path.join(assetsDir, 'images'));
    await fs.mkdir(path.join(assetsDir, 'videos'));
    await fs.mkdir(path.join(assetsDir, 'attachments'));

    // Create metadata.json with minimal info
    const metadata = {
      title,
      slug,
      description: 'To be added',
      tags: [],
      date: getCurrentDate(),
      lastModified: getCurrentDate(),
      author: 'Tin Tran (HBQ)',
      version: 1
    };

    await fs.writeFile(
      path.join(postDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Create initial content.md
    const initialContent = `# ${title}\n\n[Start writing your post here...]\n`;
    await fs.writeFile(path.join(postDir, 'content.md'), initialContent);

    // Update registry
    const registryPath = path.join(POSTS_DIR, 'registry.json');
    let registry = { posts: [] };
    
    try {
      const registryContent = await fs.readFile(registryPath, 'utf-8');
      registry = JSON.parse(registryContent);
    } catch (error) {
      // Registry doesn't exist yet, will create new
    }

    registry.posts.push(metadata);

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));

    console.log(chalk.green('\n✨ Post created successfully!'));
    console.log(chalk.blue('\nPost details:'));
    console.log(chalk.gray('----------------'));
    console.log(chalk.white(`Title: ${title}`));
    console.log(chalk.white(`Location: ${path.join(postDir, 'content.md')}`));
    console.log(chalk.gray('----------------'));

  } catch (error) {
    console.error(chalk.red('Error creating post:'), error);
    process.exit(1);
  }
} 