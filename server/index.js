import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connect } from 'couchbase';

// Initialize dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// This server sits behind a reverse proxy, so rate limiting and logging need
// the real client IP rather than the proxy's.
app.set('trust proxy', 1);

// Security headers. This process only ever returns JSON, so the CSP that
// matters for the site itself is applied at the static layer, not here.
app.use(helmet());

// Previously `cors()` with no arguments, which sends
// Access-Control-Allow-Origin: * - any site on the internet could read this
// API from a visitor's browser. Restrict it to the origins that actually
// serve the app.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://hub.hbqnexus.win,https://staging.hbqnexus.win,http://localhost:5175')
  .split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // No Origin header: same-origin navigation, curl, or a health check.
    if (!origin) return callback(null, true);
    return callback(null, ALLOWED_ORIGINS.includes(origin));
  },
  methods: ['GET'],
}));

app.use(express.json({ limit: '10kb' }));

// The quote endpoints hit Couchbase on every call. Cap how fast a single
// client can do that so one script can't saturate the database.
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}));

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
    // `SELECT count FROM ...` selected a FIELD named "count" - which does not
    // exist on these documents - rather than counting anything. It returned no
    // usable value on every call, threw, and dropped into the catch path
    // below, so the "efficient" query was never once used in production.
    // ARRAY_LENGTH on the embedded array is what was meant.
    const countQuery = `
      SELECT ARRAY_LENGTH(doc.quotes) AS quoteCount
      FROM \`${bucketName}\` AS doc
      WHERE doc.type = $type
      LIMIT 1
    `;

    // Parameterised rather than interpolated. collectionName is an internal
    // constant today, so this was not exploitable - but a query built by
    // string concatenation is one refactor away from being user-controlled.
    const countResult = await cluster.query(countQuery, {
      parameters: { type: collectionName },
    });

    const quoteCount = countResult.rows[0]?.quoteCount;
    if (!quoteCount) {
      throw new Error(`No quotes found for ${collectionName}`);
    }

    // Computed locally from a validated integer, never from user input.
    const randomIndex = Math.floor(Math.random() * quoteCount);

    const query = `
      SELECT q.*
      FROM \`${bucketName}\` AS doc
      UNNEST doc.quotes AS q
      WHERE doc.type = $type
      OFFSET ${randomIndex}
      LIMIT 1
    `;

    const result = await cluster.query(query, {
      parameters: { type: collectionName },
    });

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    throw new Error('No quotes found with query');
  } catch (queryError) {
    console.warn(`Query method failed for ${collectionName}:`, queryError.message);

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
    // Log the detail, return a generic message. Couchbase errors can carry
    // hostnames, bucket names, and query text - none of which a browser
    // client needs, and all of which help someone probing the service.
    return res.status(500).json({ error: 'Failed to retrieve quote' });
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