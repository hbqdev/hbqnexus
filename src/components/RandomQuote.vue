<template>
  <div class="quote-container" :class="{ 'sci-fi': quoteSource === 'scifi' }">
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading inspiration...</p>
    </div>
    <div v-else-if="quote" class="quote-content">
      <div class="quote-text">
        <span class="quote-mark left">❝</span>{{ quote.q }}<span class="quote-mark right">❞</span>
      </div>
      <div class="quote-author">— {{ quote.a }}</div>
    </div>
    <div v-else class="quote-content">
      <div class="quote-text">
        <span class="quote-mark left">❝</span>The best way to predict the future is to create it.<span class="quote-mark right">❞</span>
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
import scifiQuotes from '../data/sci-fi-quotes.json';

// Start with a default quote so something is always displayed
const quote = ref({ 
  q: "The best way to predict the future is to create it.", 
  a: "Abraham Lincoln" 
});
const isLoading = ref(false);
const quoteSource = ref('default'); // Track the source of quotes: 'api', 'ninja', 'scifi'

// Keep track of recently used quotes to avoid repetition
const recentScifiQuotes = ref([]);
const recentApiQuotes = ref([]);
const recentNinjaQuotes = ref([]);

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

const getRandomScifiQuote = () => {
  const quotes = scifiQuotes.quotes;
  
  // Filter out recently used quotes if we have enough quotes to choose from
  let availableQuotes = quotes;
  if (recentScifiQuotes.value.length < quotes.length - 10) {
    availableQuotes = quotes.filter(q => !recentScifiQuotes.value.includes(q.id));
  }
  
  // Get a random quote from available quotes
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const selectedQuote = availableQuotes[randomIndex];
  
  // Add to recent quotes and maintain a reasonable history size
  recentScifiQuotes.value.push(selectedQuote.id);
  if (recentScifiQuotes.value.length > 20) {
    recentScifiQuotes.value.shift(); // Remove oldest quote from history
  }
  
  return {
    q: selectedQuote.line,
    a: `${selectedQuote.name} (${selectedQuote.source})`
  };
};

const fetchNinjaQuote = async () => {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
      method: 'GET',
      headers: { 
        'X-Api-Key': import.meta.env.VITE_NINJA_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ninja API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      // Map the Ninja API response to match our expected format
      const newQuote = {
        q: data[0].quote,
        a: data[0].author
      };
      
      // Check if this quote is a repeat of a recent one
      const quoteKey = `${newQuote.q}-${newQuote.a}`;
      if (recentNinjaQuotes.value.includes(quoteKey)) {
        console.log("Received a repeat quote from Ninja API, trying again...");
        return fetchNinjaQuote(); // Try again if it's a repeat
      }
      
      // Add to recent quotes and maintain a reasonable history size
      recentNinjaQuotes.value.push(quoteKey);
      if (recentNinjaQuotes.value.length > 10) {
        recentNinjaQuotes.value.shift(); // Remove oldest quote from history
      }
      
      return newQuote;
    } else {
      throw new Error('No quote data received from Ninja API');
    }
  } catch (error) {
    console.error('Error fetching quote from Ninja API:', error);
    throw error;
  }
};

const fetchQuotableQuote = async () => {
  try {
    const response = await fetch('https://api.quotable.io/random');
    
    if (!response.ok) {
      throw new Error(`Quotable API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data) {
      const newQuote = {
        q: data.content,
        a: data.author
      };
      
      // Check if this quote is a repeat of a recent one
      const quoteKey = `${newQuote.q}-${newQuote.a}`;
      if (recentApiQuotes.value.includes(quoteKey)) {
        console.log("Received a repeat quote from Quotable API, trying again...");
        return fetchQuotableQuote(); // Try again if it's a repeat
      }
      
      // Add to recent quotes and maintain a reasonable history size
      recentApiQuotes.value.push(quoteKey);
      if (recentApiQuotes.value.length > 10) {
        recentApiQuotes.value.shift(); // Remove oldest quote from history
      }
      
      return newQuote;
    } else {
      throw new Error('No quote data received from Quotable API');
    }
  } catch (error) {
    console.error('Error fetching quote from Quotable API:', error);
    throw error;
  }
};

const fetchRandomQuote = async () => {
  isLoading.value = true;
  
  // Rotate between the three sources: API, Ninja API, and local sci-fi quotes
  if (quoteSource.value === 'default' || quoteSource.value === 'scifi') {
    quoteSource.value = 'api';
  } else if (quoteSource.value === 'api') {
    quoteSource.value = 'ninja';
  } else {
    quoteSource.value = 'scifi';
  }
  
  try {
    if (quoteSource.value === 'scifi') {
      // Use local sci-fi quotes
      quote.value = getRandomScifiQuote();
    } else if (quoteSource.value === 'ninja') {
      // Use Ninja API
      quote.value = await fetchNinjaQuote();
    } else {
      // Use Quotable API
      quote.value = await fetchQuotableQuote();
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Use a fallback quote if all APIs fail
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
  padding: 1.5rem 2rem;
  background: linear-gradient(to right, var(--card-bg), var(--card-bg) 97%);
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(var(--accent-color-rgb), 0.05) 2px, transparent 0),
    radial-gradient(circle at 75px 75px, rgba(var(--accent-color-rgb), 0.05) 2px, transparent 0);
  background-size: 100px 100px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1s ease-in-out;
  position: relative;
  border-left: 4px solid var(--accent-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.quote-container:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), 0 0 10px rgba(var(--accent-color-rgb), 0.1);
}

.quote-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.quote-text {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  animation: slideIn 0.8s ease-in-out;
  font-weight: 500;
}

.quote-mark {
  color: var(--accent-color);
  font-weight: normal;
  font-size: 2rem;
  display: inline-block;
  vertical-align: middle;
  opacity: 0.8;
  line-height: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.quote-mark.left {
  margin-right: 6px;
  transform: translateY(-0.2rem);
}

.quote-mark.right {
  margin-left: 6px;
  transform: translateY(0.2rem);
}

/* Add a subtle effect on hover */
.quote-container:hover .quote-mark.left {
  opacity: 1;
  transform: translateY(-0.3rem) scale(1.1);
}

.quote-container:hover .quote-mark.right {
  opacity: 1;
  transform: translateY(0.3rem) scale(1.1);
}

.quote-author {
  font-style: italic;
  color: var(--accent-color);
  animation: slideUp 1s ease-in-out;
  font-size: 0.95rem;
  position: relative;
  padding-bottom: 0.5rem;
  max-width: 90%;
  line-height: 1.4;
}

.quote-author::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--accent-color);
  animation: lineExpand 1.2s forwards ease-in-out;
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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  font-size: 1rem;
  border-radius: 50%;
  background-color: rgba(var(--accent-color-rgb), 0.1);
  animation: pulse 2s infinite;
}

.refresh-button:hover {
  opacity: 1;
  transform: rotate(180deg);
  animation: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--accent-color-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--accent-color-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--accent-color-rgb), 0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes lineExpand {
  from {
    width: 0;
  }
  to {
    width: 40px;
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

.quote-type {
  display: none;
}

.sci-fi {
  border-left-color: var(--accent-color);
}

.sci-fi .quote-mark,
.sci-fi .quote-author {
  color: var(--accent-color);
}

.sci-fi .quote-author::after {
  background-color: var(--accent-color);
}

.sci-fi .spinner {
  border-left-color: var(--accent-color);
}

.sci-fi .refresh-button {
  background-color: rgba(var(--accent-color-rgb), 0.1);
}

.sci-fi .refresh-button:hover {
  box-shadow: 0 0 0 0 rgba(var(--accent-color-rgb), 0.4);
}
</style> 