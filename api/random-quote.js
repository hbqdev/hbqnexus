const { connect } = require('couchbase');
require('dotenv').config();

// Couchbase connection details from .env
const couchbaseUrl = process.env.VITE_COUCHBASE_URL;
const username = process.env.VITE_COUCHBASE_USERNAME;
const password = process.env.VITE_COUCHBASE_PASSWORD;
const bucketName = 'Quotes';

module.exports = async (req, res) => {
  let cluster = null;
  
  try {
    // Connect to Couchbase
    cluster = await connect(`couchbase://${couchbaseUrl}`, {
      username,
      password
    });
    
    const bucket = cluster.bucket(bucketName);
    const collection = bucket.defaultCollection();
    
    // Get the quotes collection
    const result = await collection.get('quotes_collection');
    const quotesDoc = result.content;
    
    if (!quotesDoc || !quotesDoc.quotes || quotesDoc.quotes.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotesDoc.quotes.length);
    const randomQuote = quotesDoc.quotes[randomIndex];
    
    return res.status(200).json({ quote: randomQuote });
  } catch (error) {
    console.error('Error retrieving random quote:', error);
    return res.status(500).json({ error: 'Failed to retrieve quote' });
  } finally {
    if (cluster) {
      cluster.close();
    }
  }
}; 