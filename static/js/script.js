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
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        const cardColor = generateRandomColor();
        card.style.backgroundColor = cardColor;
        
        const textColor = getContrastColor(cardColor);
        card.style.color = textColor;
        
        const urlElement = card.querySelector('.url');
        if (urlElement) {
            urlElement.style.color = textColor;
        }
        
        // Add a semi-transparent overlay for better text visibility
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        overlay.style.backgroundColor = `${textColor}22`; // 22 is the hex value for 13% opacity
        card.insertBefore(overlay, card.firstChild);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyColors();
    const cards = document.querySelectorAll('.service-card');
    const nexusCenter = document.querySelector('.nexus-center');
    const aboutButton = document.querySelector('[data-tab="about"]');
    const aboutModal = document.querySelector('#about-modal');
    const closeModal = document.querySelector('.close-modal');

    let isDragging = false;
    let startX, startY;

    nexusCenter.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function positionCards(centerX, centerY) {
        const totalCards = cards.length;
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;

        nexusCenter.style.left = `${centerX}px`;
        nexusCenter.style.top = `${centerY}px`;

        cards.forEach((card, index) => {
            const angle = (index / totalCards) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle) - card.offsetWidth / 2;
            const y = centerY + radius * Math.sin(angle) - card.offsetHeight / 2;
            
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
    }

    const containerRect = document.querySelector('.nexus-container').getBoundingClientRect();
    const initialX = containerRect.width / 2;
    const initialY = containerRect.height / 2;
    nexusCenter.style.left = `${initialX}px`;
    nexusCenter.style.top = `${initialY}px`;
    positionCards(initialX, initialY);
    window.addEventListener('resize', () => {
        positionCards(window.innerWidth / 2, window.innerHeight / 2);
    });

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

    function startDragging(e) {
        isDragging = true;
        startX = e.clientX - nexusCenter.offsetLeft;
        startY = e.clientY - nexusCenter.offsetTop;
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        
        moveNexusAndCards(newX, newY);
    }

    function stopDragging() {
        isDragging = false;
    }

    function moveNexusAndCards(newX, newY) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = newX - centerX;
        const offsetY = newY - centerY;
        
        positionCards(centerX + offsetX, centerY + offsetY);
    }
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

let rotationAngle = 0;
let rotationInterval;

function startRotation() {
    rotationInterval = setInterval(() => {
        rotationAngle += Math.PI / 50; // Adjust speed here (currently 1/10 circle per second)
        const nexusCenterRect = nexusCenter.getBoundingClientRect();
        const centerX = nexusCenterRect.left + nexusCenterRect.width / 2;
        const centerY = nexusCenterRect.top + nexusCenterRect.height / 2;
        positionCards(centerX, centerY, rotationAngle);
    }, 20);
}

function stopRotation() {
    clearInterval(rotationInterval);
}

startRotation();

cards.forEach(card => {
    card.addEventListener('mouseenter', stopRotation);
    card.addEventListener('mouseleave', startRotation);
});

function updatePosition() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    positionCards(centerX, centerY);
}

updatePosition();
window.addEventListener('resize', updatePosition);
