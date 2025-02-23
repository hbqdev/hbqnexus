import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { marked } from 'marked';
import open from 'open';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../../../src/posts');

export async function previewPost(slug) {
  try {
    if (!slug) {
      const registry = JSON.parse(
        await fs.readFile(path.join(POSTS_DIR, 'registry.json'), 'utf-8')
      );
      
      const choices = registry.posts.map(post => ({
        name: post.title,
        value: post.slug
      }));

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'slug',
          message: 'Select post to preview:',
          choices
        }
      ]);
      
      slug = answer.slug;
    }

    const postPath = path.join(POSTS_DIR, 'posts', slug);
    
    if (!await pathExists(postPath)) {
      throw new Error(`Post "${slug}" not found`);
    }

    // Get post content and metadata
    const [content, metadata] = await Promise.all([
      fs.readFile(path.join(postPath, 'content.md'), 'utf-8'),
      fs.readFile(path.join(postPath, 'metadata.json'), 'utf-8').then(JSON.parse)
    ]);

    // Start preview server
    const app = express();
    const port = 3333;

    // Serve assets
    app.use('/assets', express.static(path.join(postPath, 'assets')));

    // Serve preview page
    app.get('/', (req, res) => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview: ${metadata.title}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.2.0/github-markdown.min.css">
          <style>
            :root { color-scheme: dark light; }
            body {
              box-sizing: border-box;
              min-width: 200px;
              max-width: 980px;
              margin: 0 auto;
              padding: 45px;
            }
            @media (max-width: 767px) {
              body { padding: 15px; }
            }
            .preview-banner {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #24292e;
              color: white;
              text-align: center;
              padding: 8px;
              font-family: -apple-system, system-ui, sans-serif;
            }
            .preview-banner span {
              margin: 0 10px;
            }
            .markdown-body {
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="preview-banner">
            <span>Preview Mode</span>
            <span>|</span>
            <span>${metadata.status}</span>
            <span>|</span>
            <span>v${metadata.version}</span>
          </div>
          <article class="markdown-body">
            ${marked(content)}
          </article>
        </body>
        </html>
      `;
      res.send(html);
    });

    // Start server and open browser
    const server = app.listen(port, async () => {
      console.log(chalk.green('\n✨ Preview server started!'));
      console.log(chalk.blue('\nPost details:'));
      console.log(chalk.gray('----------------'));
      console.log(chalk.white(`Title: ${metadata.title}`));
      console.log(chalk.white(`Status: ${metadata.status}`));
      console.log(chalk.white(`Version: ${metadata.version}`));
      console.log(chalk.gray('----------------\n'));
      
      console.log(chalk.yellow('Opening preview in browser...'));
      await open(`http://localhost:${port}`);
      
      console.log(chalk.white('\nPress Ctrl+C to stop preview server'));
    });

    // Handle server shutdown
    process.on('SIGINT', () => {
      server.close(() => {
        console.log(chalk.yellow('\nPreview server stopped'));
        process.exit(0);
      });
    });

  } catch (error) {
    console.error(chalk.red('Error previewing post:'), error);
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