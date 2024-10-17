function generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 30) + 60; // 60-90%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function generateComplementaryColor(baseColor) {
    const hue = parseInt(baseColor.match(/\d+/)[0]);
    const complementaryHue = (hue + 180) % 360;
    return `hsl(${complementaryHue}, 80%, 60%)`;
}

function getContrastColor(bgColor) {
    const rgb = bgColor.match(/\d+/g);
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

function applyColors() {
    const backgroundColor = generateRandomColor();
    document.body.style.backgroundColor = backgroundColor;

    const headerText = document.querySelector('h1');
    headerText.style.color = getContrastColor(backgroundColor);

    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        const cardColor = generateRandomColor();
        card.style.backgroundColor = cardColor;
        card.style.color = getContrastColor(cardColor);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyColors();
    window.addEventListener('resize', applyColors);
    const cards = document.querySelectorAll('.service-card');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

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

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Add a subtle parallax effect to the header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        header.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    });
});
