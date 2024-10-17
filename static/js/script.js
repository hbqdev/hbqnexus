document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        observer.observe(card);
        
        card.addEventListener('mouseenter', () => {
            card.style.backgroundColor = '#0f3460';
        });

        card.addEventListener('mouseleave', () => {
            card.style.backgroundColor = '#16213e';
        });

        const url = card.querySelector('.url');
        url.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = card.querySelector('h2').textContent;
            const confirmNavigation = confirm(`You are about to visit ${serviceName}. Do you want to continue?`);
            if (confirmNavigation) {
                window.open(url.href, '_blank');
            }
        });
    });

    // Add a subtle parallax effect to the header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        header.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    });
});
