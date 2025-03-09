require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const couchbase = require('couchbase');

// Load environment variables
const couchbaseUrl = process.env.VITE_COUCHBASE_URL;
const username = process.env.VITE_COUCHBASE_USERNAME;
const password = process.env.VITE_COUCHBASE_PASSWORD;

// Read the sci-fi quotes file
const scifiQuotesFilePath = path.join(__dirname, '../src/data/sci-fi-quotes.json');
const scifiQuotesData = JSON.parse(fs.readFileSync(scifiQuotesFilePath, 'utf8'));
const scifiQuotes = scifiQuotesData.quotes;

// Process quotes into the correct format
const processedQuotes = scifiQuotes.map(quote => {
  return {
    id: `scifi_${quote.id}`,
    q: quote.line,
    a: quote.name,
    source: quote.source,
    type: 'scifi'
  };
});

// Connect to Couchbase and import the quotes
async function importQuotes() {
  try {
    console.log('Connecting to Couchbase...');
    const cluster = await couchbase.connect(
      `couchbase://${couchbaseUrl}`,
      {
        username: username,
        password: password,
        configProfile: 'wanDevelopment'
      }
    );
    
    const bucket = cluster.bucket('Quotes');
    const collection = bucket.defaultCollection();
    
    console.log(`Processing ${processedQuotes.length} sci-fi quotes...`);
    
    // Import quotes in batches to avoid overwhelming the server
    const batchSize = 100;
    for (let i = 0; i < processedQuotes.length; i += batchSize) {
      const batch = processedQuotes.slice(i, i + batchSize);
      const promises = batch.map(quote => {
        return collection.upsert(quote.id, quote);
      });
      
      await Promise.all(promises);
      console.log(`Imported ${Math.min(i + batchSize, processedQuotes.length)} of ${processedQuotes.length} sci-fi quotes`);
    }
    
    console.log('All sci-fi quotes imported successfully!');
    await cluster.close();
    
  } catch (error) {
    console.error('Error importing sci-fi quotes:', error);
    process.exit(1);
  }
}

importQuotes(); 