import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

// YouTube video IDs are 11 chars of [A-Za-z0-9_-]. Anything else is not a
// video link, and we must not build an embed URL out of it.
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function getYouTubeEmbedUrl(url) {
  // Extract video ID from various YouTube URL formats
  let videoId = '';

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1];
  }

  // Clean up video ID (remove any extra parameters)
  videoId = videoId.split('?')[0];
  videoId = videoId.split('&')[0];
  videoId = videoId.split('/')[0];

  // Previously an unparseable URL produced ".../embed/?autoplay=0" - a broken
  // player with no video. Signal failure instead so the caller can fall back
  // to rendering an ordinary link.
  if (!YOUTUBE_ID.test(videoId)) return null;

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
    if (!embedUrl) {
      return `<a href="${href}" rel="noopener noreferrer" target="_blank">${href}</a>`;
    }
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

// Rendered post HTML goes into v-html, so it must be sanitized. DOMPurify
// drops <iframe> by default, which would silently delete every @video embed -
// so iframes are allowed as a tag, and then narrowed by the hook below to
// YouTube embed URLs only. A stray or injected iframe pointing anywhere else
// is removed.
const EMBED_SRC = /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[A-Za-z0-9_-]{11}(\?|$)/;

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return;
  const src = node.getAttribute?.('src') || '';
  if (!EMBED_SRC.test(src)) node.remove();
});

// Links leaving the site get noopener/noreferrer so the target page cannot
// reach back through window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const PURIFY_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'target'],
};

// Process markdown with media support
export function processMarkdown(content) {
  return DOMPurify.sanitize(marked(content), PURIFY_CONFIG);
}
