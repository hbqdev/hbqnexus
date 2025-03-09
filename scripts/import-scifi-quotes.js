import fs from 'fs';
import path from 'path';
import { connect, DurabilityLevel } from 'couchbase';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couchbase connection details from .env
const couchbaseUrl = process.env.VITE_COUCHBASE_URL;
const username = process.env.VITE_COUCHBASE_USERNAME;
const password = process.env.VITE_COUCHBASE_PASSWORD;
const bucketName = 'Quotes';

console.log('Environment variables:');
console.log(`- Couchbase URL: ${couchbaseUrl}`);
console.log(`- Username: ${username}`);
console.log(`- Password: ${password ? '******' : 'Not set'}`);
console.log(`- Bucket name: ${bucketName}`);

// Parse sci-fi quotes from the JSON file
async function parseScifiQuotes() {
  try {
    const quotesPath = path.join(__dirname, '../src/data/sci-fi-quotes.json');
    console.log(`Reading sci-fi quotes from: ${quotesPath}`);
    
    const quotesData = await fs.promises.readFile(quotesPath, 'utf8');
    console.log(`Successfully read sci-fi quotes file (${quotesData.length} bytes)`);
    
    const scifiQuotesData = JSON.parse(quotesData);
    const scifiQuotes = scifiQuotesData.quotes;
    console.log(`Successfully parsed JSON with ${scifiQuotes.length} sci-fi quotes`);
    
    // Process quotes into the correct format
    return scifiQuotes.map(quote => {
      return {
        q: quote.line,
        a: `${quote.name} (${quote.source})`,
        source: quote.source,
        type: 'scifi'
      };
    });
  } catch (error) {
    console.error('Error parsing sci-fi quotes:', error);
    throw error;
  }
}

// Import quotes into Couchbase
async function importScifiQuotes() {
  let cluster = null;
  
  try {
    console.log('Connecting to Couchbase...');
    console.log(`Connection string: couchbase://${couchbaseUrl}`);
    
    // Connect with more detailed options based on the Couchbase SDK documentation
    cluster = await connect(`couchbase://${couchbaseUrl}`, {
      username,
      password,
      // Set lower timeouts for development
      timeouts: {
        kvTimeout: 10000, // 10 seconds
        connectTimeout: 10000, // 10 seconds
        queryTimeout: 10000 // 10 seconds
      },
      // Configure transactions with lower durability for development
      transactions: {
        durabilityLevel: DurabilityLevel.None, // Use None for single-node development
        timeout: 10000 // 10 seconds
      }
    });
    
    console.log('Successfully connected to Couchbase');
    
    const bucket = cluster.bucket(bucketName);
    const collection = bucket.defaultCollection();
    console.log('Got default collection');
    
    console.log('Parsing sci-fi quotes...');
    const quotes = await parseScifiQuotes();
    console.log(`Found ${quotes.length} sci-fi quotes to import`);
    
    // Create a sci-fi quotes document to hold all quotes
    const quotesDoc = {
      type: 'scifi_quotes_collection',
      quotes: quotes,
      createdAt: new Date().toISOString(),
      count: quotes.length
    };
    
    console.log('Importing sci-fi quotes into database...');
    console.log(`Document size: ~${JSON.stringify(quotesDoc).length} bytes`);
    
    try {
      // Try to get the document first to see if it exists
      console.log('Checking if scifi_quotes_collection document exists...');
      try {
        const existingDoc = await collection.get('scifi_quotes_collection');
        console.log('Sci-fi quotes collection already exists, updating...');
        console.log(`Existing document has ${existingDoc.content.quotes?.length || 0} quotes`);
        
        await collection.replace('scifi_quotes_collection', quotesDoc);
        console.log('Successfully updated scifi_quotes_collection document');
      } catch (err) {
        // Document doesn't exist, insert it
        console.log('Creating new sci-fi quotes collection...');
        console.log('Error details from get attempt:', err.message);
        
        await collection.insert('scifi_quotes_collection', quotesDoc);
        console.log('Successfully inserted scifi_quotes_collection document');
      }
      
      console.log(`Successfully imported ${quotes.length} sci-fi quotes!`);
      
      // Create a N1QL query for retrieving a random sci-fi quote
      console.log('Creating a sample query for retrieving a random sci-fi quote...');
      const randomQuoteQuery = `
        SELECT q.* 
        FROM \`${bucketName}\` AS doc, 
             doc.quotes AS q 
        WHERE doc.type = 'scifi_quotes_collection' 
        OFFSET ABS(RANDOM() % (
          SELECT RAW doc.count 
          FROM \`${bucketName}\` AS doc 
          WHERE doc.type = 'scifi_quotes_collection' 
          LIMIT 1
        )[0]) 
        LIMIT 1
      `;
      
      console.log('Sample query for random sci-fi quote:');
      console.log(randomQuoteQuery);
      
      // Test the random quote query
      console.log('Testing random sci-fi quote query...');
      const randomQuoteResult = await cluster.query(randomQuoteQuery);
      console.log(`Random sci-fi quote: ${JSON.stringify(randomQuoteResult.rows[0])}`);
      
      console.log('Sci-fi quotes import completed successfully!');
    } catch (error) {
      console.error('Error importing sci-fi quotes:');
      console.error('- Message:', error.message);
      console.error('- Code:', error.code);
      console.error('- Context:', error.context);
      if (error.cause) {
        console.error('- Cause:', error.cause);
      }
      throw error;
    }
  } catch (error) {
    console.error('Import failed:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    if (error.context) {
      console.error('Error context:', error.context);
    }
  } finally {
    if (cluster) {
      console.log('Closing Couchbase connection...');
      await cluster.close();
      console.log('Couchbase connection closed');
    }
  }
}

// Run the import
console.log('Starting sci-fi quotes import process...');
importScifiQuotes().catch(err => {
  console.error('Unhandled error in main process:', err);
  process.exit(1);
}); 