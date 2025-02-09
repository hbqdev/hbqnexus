import marked from 'marked';
import hljs from 'highlight.js';

class BlogRenderer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    marked.setOptions({
      highlight: (code, language) => hljs.highlight(code, { language }).value,
      langPrefix: 'hljs '
    });
  }

  async connectedCallback() {
    const posts = await this.fetchPosts();
    this.renderPosts(posts);
  }

  async fetchPosts() {
    const response = await fetch('/posts/manifest.json');
    const { posts } = await response.json();
    return Promise.all(posts.map(async post => ({
      ...post,
      content: marked(await (await fetch(`/posts/${post.file}`)).text())
    })));
  }

  renderPosts(posts) {
    this.shadowRoot.innerHTML = `
      <style>
        .post-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .post-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
      </style>
      <div class="blog-posts">
        ${posts.map((post, index) => `
          <article class="post-card" style="transition-delay: ${index * 50}ms">
            <h2>${post.title}</h2>
            <time>${new Date(post.date).toLocaleDateString()}</time>
            <div class="post-content">${post.content}</div>
          </article>
        `).join('')}
      </div>
    `;
    
    // Add staggered animation
    setTimeout(() => {
      this.shadowRoot.querySelectorAll('.post-card').forEach(card => {
        card.classList.add('visible');
      });
    }, 100);
  }
}

customElements.define('blog-renderer', BlogRenderer);