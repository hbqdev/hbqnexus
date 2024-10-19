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

    const aboutContainer = document.querySelector('.about-container');
    if (aboutContainer) {
        aboutContainer.style.backgroundColor = backgroundColor;
    }

    const bioText = document.querySelectorAll('.bio h2, .bio h3, .bio p');
    bioText.forEach(element => {
        element.style.color = getContrastColor(backgroundColor);
    });

    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.style.backgroundColor = generateComplementaryColor(backgroundColor);
        link.style.color = getContrastColor(link.style.backgroundColor);
    });

    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        const cardColor = generateRandomColor();
        card.style.backgroundColor = cardColor;
        card.style.color = getContrastColor(cardColor);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyColors();
    const cards = document.querySelectorAll('.service-card');
    const nexusCenter = document.querySelector('.nexus-center');
    const aboutButton = document.querySelector('[data-tab="about"]');
    const aboutModal = document.querySelector('#about-modal');
    const closeModal = document.querySelector('.close-modal');

    function positionCards() {
        const totalCards = cards.length;
        const containerRect = document.querySelector('.nexus-container').getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const radius = Math.min(containerRect.width, containerRect.height) * 0.35;

        cards.forEach((card, index) => {
            const angle = (index / totalCards) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle) - card.offsetWidth / 2;
            const y = centerY + radius * Math.sin(angle) - card.offsetHeight / 2;
            
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
    }

    positionCards();
    window.addEventListener('resize', positionCards);

    // Nexus center click functionality
    nexusCenter.addEventListener('click', () => {
        const randomService = services[Math.floor(Math.random() * services.length)];
        openIframe(`https://${randomService.url}`);
    });

    // About modal functionality
    aboutButton.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    // Generate SVG background
    generateSVGBackground();

    function setupCardHoverEffects() {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.zIndex = '100';
            });
            card.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    card.style.zIndex = '1';
                }, 300); // Delay to match the transition duration
            });
        });
    }

    setupCardHoverEffects();
});

function generateSVGBackground() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "fixed";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.zIndex = "-1";

    for (let i = 0; i < 50; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", Math.random() * 100 + "%");
        line.setAttribute("y1", Math.random() * 100 + "%");
        line.setAttribute("x2", Math.random() * 100 + "%");
        line.setAttribute("y2", Math.random() * 100 + "%");
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);
    }

    document.body.appendChild(svg);
}
