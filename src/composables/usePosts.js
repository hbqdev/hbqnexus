import { ref } from 'vue';
import { processMarkdown } from '../utils/markdownProcessor';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  },
  breaks: true,
  gfm: true
});

export function usePosts() {
  const posts = ref([]);
  const currentPost = ref(null);

  async function loadPosts() {
    try {
      const response = await fetch('/src/posts/registry.json');
      if (!response.ok) throw new Error('Failed to fetch posts registry');
      const data = await response.json();
      posts.value = data.posts.filter(post => post.status === 'published');
      return posts.value;
    } catch (error) {
      console.error('Error loading posts:', error);
      throw error;
    }
  }

  async function loadPost(slug) {
    try {
      // Load posts if not already loaded
      if (posts.value.length === 0) {
        await loadPosts();
      }

      const post = posts.value.find(p => p.slug === slug);
      if (!post) throw new Error('Post not found');

      const response = await fetch(`/src/posts/published/${slug}/content.md`);
      if (!response.ok) throw new Error('Failed to fetch post content');
      
      const markdown = await response.text();
      return {
        ...post,
        content: processMarkdown(markdown)
      };
    } catch (error) {
      console.error('Error loading post:', error);
      throw error;
    }
  }

  return {
    posts,
    currentPost,
    loadPosts,
    loadPost
  };
} 