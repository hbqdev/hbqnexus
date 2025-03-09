import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connect } from 'couchbase';
import { fileURLToPath } from 'url';
import path from 'path';

// Initialize dotenv
dotenv.config();

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Couchbase connection details from .env
const couchbaseUrl = process.env.VITE_COUCHBASE_URL;
const username = process.env.VITE_COUCHBASE_USERNAME;
const password = process.env.VITE_COUCHBASE_PASSWORD;
const bucketName = 'Quotes';

// Global variables to maintain connection
let cluster = null;
let bucket = null;
let collection = null;

// Helper function to ensure we have a connection
async function ensureConnection() {
  if (!collection) {
    return await connectToCouchbase();
  }
  return true;
}

async function connectToCouchbase() {
  try {
    console.log('Connecting to Couchbase...');
    console.log(`URL: ${couchbaseUrl}, Username: ${username}`);
    
    cluster = await connect(`couchbase://${couchbaseUrl}`, {
      username,
      password,
      timeouts: {
        kvTimeout: 10000,
        connectTimeout: 10000,
        queryTimeout: 10000
      }
    });
    
    bucket = cluster.bucket(bucketName);
    collection = bucket.defaultCollection();
    console.log('Connected to Couchbase successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Couchbase:', error);
    return false;
  }
}

// Helper function to get a random quote from a specific collection
async function getRandomQuoteFromCollection(collectionName) {
  try {
    // First, get the count of quotes in the collection
    const countQuery = `
      SELECT count 
      FROM \`${bucketName}\` 
      WHERE type = '${collectionName}' 
      LIMIT 1
    `;
    
    const countResult = await cluster.query(countQuery);
    
    if (!countResult.rows.length || !countResult.rows[0].count) {
      throw new Error(`No count found for ${collectionName}`);
    }
    
    const quoteCount = countResult.rows[0].count;
    const randomIndex = Math.floor(Math.random() * quoteCount);
    
    // Now use the random index to get a quote
    const query = `
      SELECT q.* 
      FROM \`${bucketName}\` AS doc, 
           doc.quotes AS q 
      WHERE doc.type = '${collectionName}' 
      OFFSET ${randomIndex}
      LIMIT 1
    `;
    
    const result = await cluster.query(query);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    throw new Error('No quotes found with query');
  } catch (queryError) {
    console.warn(`Query method failed for ${collectionName}:`, queryError);
    
    // Fallback to getting the whole document
    const result = await collection.get(collectionName);
    const quotesDoc = result.content;
    
    if (!quotesDoc || !quotesDoc.quotes || quotesDoc.quotes.length === 0) {
      throw new Error(`No quotes found in ${collectionName}`);
    }
    
    const randomIndex = Math.floor(Math.random() * quotesDoc.quotes.length);
    return quotesDoc.quotes[randomIndex];
  }
}

// Main endpoint for random quotes from any collection
app.get('/api/random-quote', async (req, res) => {
  try {
    // Ensure we have a connection
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    console.log('Fetching random quote...');
    
    // Randomly decide which collection to use
    const collections = ['quotes_collection', 'scifi_quotes_collection'];
    const randomCollection = collections[Math.floor(Math.random() * collections.length)];
    
    console.log(`Selected collection: ${randomCollection}`);
    
    try {
      // Get a random quote from the selected collection
      const quote = await getRandomQuoteFromCollection(randomCollection);
      return res.json({ quote });
    } catch (error) {
      // If the selected collection fails, try the other one
      console.warn(`Failed to get quote from ${randomCollection}, trying alternative`);
      const otherCollection = randomCollection === 'quotes_collection' ? 
        'scifi_quotes_collection' : 'quotes_collection';
      
      try {
        const quote = await getRandomQuoteFromCollection(otherCollection);
        return res.json({ quote });
      } catch (finalError) {
        return res.status(500).json({ error: 'Failed to retrieve quote from any collection' });
      }
    }
  } catch (error) {
    console.error('Error retrieving random quote:', error);
    return res.status(500).json({ error: 'Failed to retrieve quote', details: error.message });
  }
});

// Optional: Keep these endpoints if you need to specifically target one collection
app.get('/api/quotes/random', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    try {
      const quote = await getRandomQuoteFromCollection('quotes_collection');
      return res.json({ quote });
    } catch (error) {
      return res.status(404).json({ error: 'No quotes found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve quote' });
  }
});

app.get('/api/quotes/scifi/random', async (req, res) => {
  try {
    const connected = await ensureConnection();
    if (!connected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    try {
      const quote = await getRandomQuoteFromCollection('scifi_quotes_collection');
      return res.json({ quote });
    } catch (error) {
      return res.status(404).json({ error: 'No sci-fi quotes found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve quote' });
  }
});

// Start server
async function startServer() {
  await connectToCouchbase();
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer(); 