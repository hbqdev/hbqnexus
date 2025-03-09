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
    
    console.log('Fetching random quote...');
    
    // Randomly decide which collection to use
    const collections = ['quotes_collection', 'scifi_quotes_collection'];
    const randomCollection = collections[Math.floor(Math.random() * collections.length)];
    
    console.log(`Selected collection: ${randomCollection}`);
    
    try {
      // First, get the count of quotes in the selected collection
      const countQuery = `
        SELECT count 
        FROM \`${bucketName}\` 
        WHERE type = '${randomCollection}' 
        LIMIT 1
      `;
      
      const countResult = await cluster.query(countQuery);
      
      if (!countResult.rows.length || !countResult.rows[0].count) {
        throw new Error(`No count found for ${randomCollection}`);
      }
      
      const quoteCount = countResult.rows[0].count;
      const randomIndex = Math.floor(Math.random() * quoteCount);
      
      // Now use the random index to get a quote
      const query = `
        SELECT q.* 
        FROM \`${bucketName}\` AS doc, 
             doc.quotes AS q 
        WHERE doc.type = '${randomCollection}' 
        OFFSET ${randomIndex}
        LIMIT 1
      `;
      
      const result = await cluster.query(query);
      
      if (result.rows.length > 0) {
        return res.json({ quote: result.rows[0] });
      }
      
      // Fallback to Method 2 if no results
      throw new Error('No quotes found with query');
      
    } catch (queryError) {
      console.warn('Query method failed, falling back to document method:', queryError);
      
      // Method 2: Get the whole document and select a random quote
      try {
        const result = await collection.get(randomCollection);
        const quotesDoc = result.content;
        
        if (!quotesDoc || !quotesDoc.quotes || quotesDoc.quotes.length === 0) {
          return res.status(404).json({ error: 'No quotes found' });
        }
        
        const randomIndex = Math.floor(Math.random() * quotesDoc.quotes.length);
        const randomQuote = quotesDoc.quotes[randomIndex];
        
        return res.json({ quote: randomQuote });
      } catch (docError) {
        console.error('Error retrieving document:', docError);
        
        // If the selected collection doesn't exist, try the other one
        const otherCollection = randomCollection === 'quotes_collection' ? 
          'scifi_quotes_collection' : 'quotes_collection';
        
        try {
          const result = await collection.get(otherCollection);
          const quotesDoc = result.content;
          
          if (!quotesDoc || !quotesDoc.quotes || quotesDoc.quotes.length === 0) {
            return res.status(404).json({ error: 'No quotes found' });
          }
          
          const randomIndex = Math.floor(Math.random() * quotesDoc.quotes.length);
          const randomQuote = quotesDoc.quotes[randomIndex];
          
          return res.json({ quote: randomQuote });
        } catch (finalError) {
          return res.status(500).json({ error: 'Failed to retrieve quote from any collection' });
        }
      }
    }
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