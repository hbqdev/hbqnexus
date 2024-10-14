document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card');
    const modal = document.getElementById('modal-container');
    const modalIframe = document.getElementById('modal-iframe');
    const closeButton = document.querySelector('.close-button');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        observer.observe(card);
    });

    // Prevent default behavior for service URLs and open in modal instead
    document.querySelectorAll('.service-card .url').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modalIframe.src = e.target.href;
            modal.style.display = 'block';
        });
    });

    // Close modal when clicking the close button
    closeButton.onclick = () => {
        modal.style.display = 'none';
        modalIframe.src = '';
    };

    // Close modal when clicking outside of it
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            modalIframe.src = '';
        }
    };
});
