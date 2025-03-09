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

let cluster = null;
let bucket = null;
let collection = null;

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

// API Routes
app.get('/api/quotes/random', async (req, res) => {
  try {
    // Get a random quote using N1QL query
    const query = `
      SELECT q.* 
      FROM \`Quotes\` q 
      WHERE q.type = "general" 
      ORDER BY RAND() 
      LIMIT 1
    `;
    
    const result = await cluster.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching random quote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/quotes/scifi/random', async (req, res) => {
  try {
    // Get a random sci-fi quote using N1QL query
    const query = `
      SELECT q.* 
      FROM \`Quotes\` q 
      WHERE q.type = "scifi" 
      ORDER BY RAND() 
      LIMIT 1
    `;
    
    const result = await cluster.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No sci-fi quotes found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching random sci-fi quote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/random-quote', async (req, res) => {
  try {
    if (!collection) {
      const connected = await connectToCouchbase();
      if (!connected) {
        return res.status(500).json({ error: 'Database connection failed' });
      }
    }
    
    console.log('Fetching quotes_collection document...');
    
    // Get the quotes collection document
    const result = await collection.get('quotes_collection');
    const quotesDoc = result.content;
    
    if (!quotesDoc || !quotesDoc.quotes || quotesDoc.quotes.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }
    
    console.log(`Found ${quotesDoc.quotes.length} quotes`);
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotesDoc.quotes.length);
    const randomQuote = quotesDoc.quotes[randomIndex];
    
    console.log(`Selected quote at index ${randomIndex}: "${randomQuote.q.substring(0, 30)}..."`);
    
    return res.json({ quote: randomQuote });
  } catch (error) {
    console.error('Error retrieving random quote:', error);
    return res.status(500).json({ error: 'Failed to retrieve quote', details: error.message });
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