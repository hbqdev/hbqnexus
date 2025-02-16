import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');

export async function editPost(slug) {
  try {
    // If no slug provided, let user select from list
    if (!slug) {
      const registry = JSON.parse(
        await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
      );
      
      const choices = registry.posts.map(post => ({
        name: `${post.title} (${post.status})`,
        value: post.slug
      }));

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'slug',
          message: 'Select post to edit:',
          choices
        }
      ]);
      
      slug = answer.slug;
    }

    // Find post location (draft or published)
    const draftPath = path.join(POSTS_DIR, 'drafts', slug);
    const publishedPath = path.join(POSTS_DIR, 'published', slug);
    
    let postPath;
    if (await pathExists(draftPath)) {
      postPath = draftPath;
    } else if (await pathExists(publishedPath)) {
      postPath = publishedPath;
    } else {
      throw new Error(`Post "${slug}" not found`);
    }

    // Get metadata
    const metadata = JSON.parse(
      await fs.readFile(path.join(postPath, 'metadata.json'), 'utf-8')
    );

    // Open content.md in default editor
    const contentPath = path.join(postPath, 'content.md');
    const editor = process.env.EDITOR || 'code'; // Defaults to VS Code
    
    console.log(chalk.blue('\nOpening post in editor...'));
    console.log(chalk.gray('----------------'));
    console.log(chalk.white(`Title: ${metadata.title}`));
    console.log(chalk.white(`Status: ${metadata.status}`));
    console.log(chalk.white(`Version: ${metadata.version}`));
    console.log(chalk.gray('----------------\n'));

    await new Promise((resolve, reject) => {
      const proc = spawn(editor, [contentPath], {
        stdio: 'inherit',
        shell: true
      });

      proc.on('exit', code => {
        if (code === 0) resolve();
        else reject(new Error(`Editor exited with code ${code}`));
      });
    });

    // Update metadata with current timestamp
    metadata.lastModified = getCurrentDate();  // Only update lastModified, keep original date
    metadata.version += 1;
    metadata.history.push({
      version: metadata.version,
      date: getCurrentDate(),                 // Use current time
      description: 'Content updated'
    });

    await fs.writeFile(
      path.join(postPath, 'metadata.json'),
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
        modified: metadata.modified,
        version: metadata.version
      };
      
      await fs.writeFile(
        path.join(POSTS_DIR, 'registry.json'),
        JSON.stringify(registry, null, 2)
      );
    }

    console.log(chalk.green('\n✨ Post updated successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white(`1. Preview your changes: npm run post preview ${slug}`));
    if (metadata.status === 'draft') {
      console.log(chalk.white(`2. Publish when ready: npm run post publish ${slug}`));
    }

  } catch (error) {
    console.error(chalk.red('Error editing post:'), error);
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