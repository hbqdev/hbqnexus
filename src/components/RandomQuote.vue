<template>
  <div class="quote-container">
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading inspiration...</p>
    </div>
    <div v-else-if="quote" class="quote-content">
      <div class="quote-text">
        <span class="quote-mark">"</span>{{ quote.q }}<span class="quote-mark">"</span>
      </div>
      <div class="quote-author">— {{ quote.a }}</div>
    </div>
    <div v-else class="quote-content">
      <div class="quote-text">
        <span class="quote-mark">"</span>The best way to predict the future is to create it.<span class="quote-mark">"</span>
      </div>
      <div class="quote-author">— Abraham Lincoln</div>
    </div>
    <div class="refresh-button" @click="fetchRandomQuote" title="Get a new quote">
      🔄
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Start with a default quote so something is always displayed
const quote = ref({ 
  q: "The best way to predict the future is to create it.", 
  a: "Abraham Lincoln" 
});
const isLoading = ref(false);

// Fallback quotes in case the API fails
const fallbackQuotes = [
  { q: "The best way to predict the future is to create it.", a: "Abraham Lincoln" },
  { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
  { q: "The only limit to our realization of tomorrow is our doubts of today.", a: "Franklin D. Roosevelt" },
  { q: "In the middle of difficulty lies opportunity.", a: "Albert Einstein" },
  { q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu" }
];

const getRandomFallbackQuote = () => {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  return fallbackQuotes[randomIndex];
};

const fetchRandomQuote = async () => {
  isLoading.value = true;
  try {
    // Try the backup API endpoint directly
    const backupResponse = await fetch('https://api.quotable.io/random');
    
    if (!backupResponse.ok) {
      throw new Error(`Backup API responded with status: ${backupResponse.status}`);
    }
    
    const backupData = await backupResponse.json();
    if (backupData) {
      // Map the backup API response to match our expected format
      quote.value = {
        q: backupData.content,
        a: backupData.author
      };
      console.log("Quote fetched from backup API:", quote.value);
    } else {
      throw new Error('No quote data received from backup API');
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Use a fallback quote if the API fails
    quote.value = getRandomFallbackQuote();
  } finally {
    isLoading.value = false;
  }
};

// Function to handle page visibility changes
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchRandomQuote();
  }
};

onMounted(() => {
  console.log("RandomQuote component mounted");
  fetchRandomQuote();
  
  // Add event listener for page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Add event listener for page refresh
  window.addEventListener('beforeunload', fetchRandomQuote);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('beforeunload', fetchRandomQuote);
});
</script>

<style scoped>
.quote-container {
  max-width: 800px;
  margin: 0 auto 2rem;
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  animation: fadeIn 1s ease-in-out;
  position: relative;
  border-left: 3px solid var(--accent-color);
}

.quote-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.quote-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  animation: fadeIn 1s ease-in-out;
}

.quote-mark {
  color: var(--accent-color);
  font-weight: bold;
}

.quote-author {
  font-style: italic;
  color: var(--accent-color);
  animation: fadeIn 1s ease-in-out;
  font-size: 0.9rem;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: var(--accent-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.refresh-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s ease;
  font-size: 0.9rem;
}

.refresh-button:hover {
  opacity: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 