import { ref, onMounted, watch } from 'vue';

export function useTheme() {
  const theme = ref(localStorage.getItem('theme') || 'system');
  
  const systemTheme = ref(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const currentTheme = ref(theme.value === 'system' ? systemTheme.value : theme.value);

  function setTheme(newTheme) {
    theme.value = newTheme;
    currentTheme.value = newTheme === 'system' ? systemTheme.value : newTheme;
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', currentTheme.value);
  }

  onMounted(() => {
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light';
      if (theme.value === 'system') {
        currentTheme.value = systemTheme.value;
        document.documentElement.setAttribute('data-theme', currentTheme.value);
      }
    });

    // Set initial theme
    setTheme(theme.value);
  });

  return {
    theme,
    currentTheme,
    setTheme
  };
} 