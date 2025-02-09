import services from '/services.json';

class ServiceGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 2rem;
        }

        .category-group {
          margin-bottom: 2rem;
        }

        .category-title {
          color: var(--text-color, #ffffff);
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .category-services {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        
        .service-card {
          background: var(--card-bg, #2a2a2a);
          border-radius: 12px;
          padding: 1.5rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          color: var(--text-color, #ffffff);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .service-icon {
          width: 64px;
          height: 64px;
        }

        .service-title {
          margin: 0;
          font-size: 1.2rem;
        }

        .service-description {
          margin: 0;
          text-align: center;
          opacity: 0.8;
        }
      </style>
      <div class="service-grid"></div>
    `;
  }

  connectedCallback() {
    const grid = this.shadowRoot.querySelector('.service-grid');
    services.categories.forEach(category => {
      const categoryHTML = `
        <div class="category-group">
          <h2 class="category-title">${category.name}</h2>
          <div class="category-services">
            ${category.services.map(service => this.createServiceCard(service)).join('')}
          </div>
        </div>
      `;
      grid.innerHTML += categoryHTML;
    });
  }

  createServiceCard(service) {
    return `
      <a href="${service.url}" class="service-card">
        <img src="${service.icon}" alt="${service.name}" class="service-icon">
        <h3 class="service-title">${service.name}</h3>
        <p class="service-description">${service.description}</p>
      </a>
    `;
  }
}

customElements.define('service-grid', ServiceGrid);