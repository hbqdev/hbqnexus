export function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Load saved theme or use system preference
  const savedTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
  setTheme(savedTheme);
  
  // Update toggle button text
  updateToggleButton(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateToggleButton(newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateToggleButton(theme) {
  const toggle = document.getElementById('theme-toggle');
  toggle.textContent = theme === 'dark' ? '🌞' : '🌙';
} 