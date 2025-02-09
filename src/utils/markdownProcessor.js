import { marked } from 'marked';
import hljs from 'highlight.js';

function getYouTubeEmbedUrl(url) {
  // Extract video ID from various YouTube URL formats
  let videoId = '';
  
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1];
  }

  // Clean up video ID (remove any extra parameters)
  videoId = videoId.split('?')[0];
  videoId = videoId.split('&')[0];
  
  // Add parameters for better player experience
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0&modestbranding=1&playsinline=1`;
}

const renderer = new marked.Renderer();

// Handle images with captions
renderer.image = (href, title, text) => {
  return `
    <figure class="blog-image">
      <img src="${href}" alt="${text}" loading="lazy">
      ${title ? `<figcaption>${title}</figcaption>` : ''}
    </figure>
  `;
};

// Override the link renderer to handle video links
renderer.link = (href, title, text) => {
  if (text === '@video') {
    const embedUrl = getYouTubeEmbedUrl(href);
    return `
      <div class="video-container">
        <iframe
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
        <div class="video-resizer"></div>
      </div>
    `;
  }
  return `<a href="${href}" ${title ? `title="${title}"` : ''}>${text}</a>`;
};

// Configure marked
marked.use({ 
  renderer,
  breaks: true,
  gfm: true,
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  }
});

// Process markdown with media support
export function processMarkdown(content) {
  return marked(content);
} 