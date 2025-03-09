import fs from 'fs';
import path from 'path';
import { connect, BucketSettings, BucketType, DurabilityLevel } from 'couchbase';
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

// Parse quotes from the JSON file
async function parseQuotes() {
  try {
    const quotesPath = path.join(__dirname, '../src/data/quotes.json');
    console.log(`Reading quotes from: ${quotesPath}`);
    
    const quotesData = await fs.promises.readFile(quotesPath, 'utf8');
    console.log(`Successfully read quotes file (${quotesData.length} bytes)`);
    
    const quotes = JSON.parse(quotesData);
    console.log(`Successfully parsed JSON with ${quotes.length} quotes`);
    
    return quotes.map((quoteString, index) => {
      // Split the quote into text and author parts
      const lastDashIndex = quoteString.lastIndexOf(' - ');
      
      if (lastDashIndex === -1) {
        // If no author is specified
        return {
          q: quoteString.trim(),
          a: 'Unknown'
        };
      }
      
      const quoteText = quoteString.substring(0, lastDashIndex).trim();
      let authorText = quoteString.substring(lastDashIndex + 3).trim();
      
      // Check if there's a source in the author part (separated by comma)
      const commaIndex = authorText.indexOf(',');
      let source = '';
      
      if (commaIndex !== -1) {
        source = authorText.substring(commaIndex + 1).trim();
        authorText = authorText.substring(0, commaIndex).trim();
      }
      
      return {
        q: quoteText,
        a: authorText,
        source: source || undefined
      };
    });
  } catch (error) {
    console.error('Error parsing quotes:', error);
    throw error;
  }
}

// Create bucket if it doesn't exist
async function ensureBucketExists(cluster) {
  try {
    console.log('Checking if bucket exists...');
    // Check if bucket exists
    const buckets = await cluster.buckets().getAllBuckets();
    console.log(`Found ${buckets.length} buckets on the server`);
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist. Creating it...`);
      
      // Create bucket settings
      const bucketSettings = new BucketSettings({
        name: bucketName,
        flushEnabled: false,
        ramQuotaMB: 100, // Minimum RAM quota
        numReplicas: 0, // Set to 0 for single node development setup to avoid durability errors
        bucketType: BucketType.Couchbase
      });
      
      console.log('Bucket settings:', JSON.stringify(bucketSettings, null, 2));
      
      // Create the bucket
      await cluster.buckets().createBucket(bucketSettings);
      console.log(`Bucket '${bucketName}' created successfully.`);
      
      // Wait for bucket to be ready
      console.log('Waiting for bucket to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log(`Bucket '${bucketName}' already exists.`);
    }
    
    // Open the bucket to ensure it's accessible
    console.log('Opening bucket...');
    const bucket = cluster.bucket(bucketName);
    await bucket.ping();
    console.log('Bucket ping successful');
    
    return bucket;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw error;
  }
}

// Import quotes into Couchbase
async function importQuotes() {
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
    
    // Ensure bucket exists
    const bucket = await ensureBucketExists(cluster);
    console.log('Bucket setup complete');
    
    const collection = bucket.defaultCollection();
    console.log('Got default collection');
    
    console.log('Parsing quotes...');
    const quotes = await parseQuotes();
    console.log(`Found ${quotes.length} quotes to import`);
    
    // Create a quotes document to hold all quotes
    const quotesDoc = {
      type: 'quotes_collection',
      quotes: quotes,
      createdAt: new Date().toISOString(),
      count: quotes.length
    };
    
    console.log('Importing quotes into database...');
    console.log(`Document size: ~${JSON.stringify(quotesDoc).length} bytes`);
    
    try {
      // Try to get the document first to see if it exists
      console.log('Checking if quotes_collection document exists...');
      try {
        const existingDoc = await collection.get('quotes_collection');
        console.log('Quotes collection already exists, updating...');
        console.log(`Existing document has ${existingDoc.content.quotes?.length || 0} quotes`);
        
        await collection.replace('quotes_collection', quotesDoc);
        console.log('Successfully updated quotes_collection document');
      } catch (err) {
        // Document doesn't exist, insert it
        console.log('Creating new quotes collection...');
        console.log('Error details from get attempt:', err.message);
        
        await collection.insert('quotes_collection', quotesDoc);
        console.log('Successfully inserted quotes_collection document');
      }
      
      console.log(`Successfully imported ${quotes.length} quotes!`);
      
      // Create an index document for random access
      const indexDoc = {
        type: 'quotes_index',
        count: quotes.length,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Creating/updating quotes index document...');
      try {
        await collection.get('quotes_index');
        console.log('Quotes index already exists, updating...');
        await collection.replace('quotes_index', indexDoc);
      } catch (err) {
        console.log('Creating quotes index...');
        await collection.insert('quotes_index', indexDoc);
      }
      
      console.log('Creating indexes for efficient querying...');
      try {
        // Get the cluster's query service
        const queryIndexManager = cluster.queryIndexes();
        
        // Check if our index already exists
        console.log(`Checking for existing indexes on bucket ${bucketName}...`);
        const indexes = await queryIndexManager.getAllIndexes(bucketName);
        console.log(`Found ${indexes.length} indexes on bucket ${bucketName}`);
        
        const quoteTypeIndexName = 'idx_quote_type';
        const quoteTypeIndexExists = indexes.some(idx => idx.name === quoteTypeIndexName);
        
        if (!quoteTypeIndexExists) {
          console.log(`Creating index ${quoteTypeIndexName}...`);
          // Create an index on the 'type' field for faster lookups
          await queryIndexManager.createIndex(bucketName, quoteTypeIndexName, ['type'], {
            ignoreIfExists: true
          });
          console.log(`Index ${quoteTypeIndexName} created successfully`);
          
          // Wait for index to become online
          console.log('Waiting for index to become online...');
          await queryIndexManager.watchIndexes(bucketName, [quoteTypeIndexName], 30000);
          console.log('Index is now online');
        } else {
          console.log(`Index ${quoteTypeIndexName} already exists`);
        }
        
        // Create a query to test the index
        console.log('Testing index with a query...');
        const query = `
          SELECT COUNT(*) as count 
          FROM \`${bucketName}\` 
          WHERE type = 'quotes_collection'
        `;
        
        const result = await cluster.query(query);
        console.log(`Query result: ${JSON.stringify(result.rows)}`);
        
        // Create a N1QL query for retrieving a random quote
        console.log('Creating a sample query for retrieving a random quote...');
        const randomQuoteQuery = `
          SELECT q.* 
          FROM \`${bucketName}\` AS doc, 
               doc.quotes AS q 
          WHERE doc.type = 'quotes_collection' 
          OFFSET ABS(RANDOM() % (
            SELECT RAW doc.count 
            FROM \`${bucketName}\` AS doc 
            WHERE doc.type = 'quotes_collection' 
            LIMIT 1
          )[0]) 
          LIMIT 1
        `;
        
        console.log('Sample query for random quote:');
        console.log(randomQuoteQuery);
        
        // Test the random quote query
        console.log('Testing random quote query...');
        const randomQuoteResult = await cluster.query(randomQuoteQuery);
        console.log(`Random quote: ${JSON.stringify(randomQuoteResult.rows[0])}`);
        
      } catch (indexError) {
        console.error('Error creating or testing indexes:');
        console.error('- Message:', indexError.message);
        console.error('- Code:', indexError.code);
        if (indexError.cause) {
          console.error('- Cause:', indexError.cause);
        }
        // Don't throw the error, just log it - we still want to consider the import successful
        console.log('Index creation had errors, but quotes were imported successfully');
      }
      
      console.log('Import completed successfully!');
    } catch (error) {
      console.error('Error importing quotes:');
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
console.log('Starting import process...');
importQuotes().catch(err => {
  console.error('Unhandled error in main process:', err);
  process.exit(1);
}); 