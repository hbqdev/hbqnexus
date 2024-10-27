document.addEventListener('DOMContentLoaded', () => {
    const serviceTiles = document.querySelectorAll('.service-tile');
    const previewFrame = document.querySelector('.preview-frame');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const aboutButton = document.querySelector('[data-tab="about"]');
    const aboutModal = document.querySelector('#about-modal');
    const closeModal = document.querySelector('.close-modal');

    // Category filtering
    const categories = [...new Set(Array.from(serviceTiles)
        .map(tile => tile.dataset.category))];

    // Service tile click handler
    serviceTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            // Get the URL from the tile's data attribute
            const url = tile.dataset.url;
            console.log('Clicked URL:', url); // Debug log
            
            // Get the tile's position and dimensions
            const rect = tile.getBoundingClientRect();
            
            // Create flying clone
            const clone = tile.cloneNode(true);
            Object.assign(clone.style, {
                position: 'fixed',
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                zIndex: '1000',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transform: 'scale(1)'
            });
            
            document.body.appendChild(clone);

            // Animate to preview side
            requestAnimationFrame(() => {
                Object.assign(clone.style, {
                    transform: 'translate(-50%, -50%) scale(1.5)',
                    top: '50%',
                    left: '75%',
                    opacity: '0'
                });
            });

            // Show preview in iframe
            setTimeout(() => {
                previewPlaceholder.style.display = 'none';
                previewFrame.style.display = 'block';
                previewFrame.innerHTML = `
                    <iframe 
                        src="https://${url}"
                        style="width:100%;height:100vh;border:none;"
                        allow="fullscreen"
                    ></iframe>
                `;
                clone.remove();
            }, 500);
        });

        // Add hover effects
        tile.addEventListener('mouseenter', () => {
            tile.style.transform = 'translateY(-5px) scale(1.02)';
        });

        tile.addEventListener('mouseleave', () => {
            tile.style.transform = 'translateY(0) scale(1)';
        });
    });

    // About modal functionality
    if (aboutButton && aboutModal && closeModal) {
        aboutButton.addEventListener('click', () => {
            aboutModal.style.display = 'flex';
        });

        closeModal.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    }

    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
});
