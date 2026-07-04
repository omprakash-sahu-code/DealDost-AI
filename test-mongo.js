const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

console.log('Connecting to MongoDB...');
mongoose.connect(uri, { dbName: process.env.DB_NAME || 'dealdost_ai' })
  .then(() => {
    console.log('✅ MongoDB connection SUCCESS!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection FAILED:', err.message);
    process.exit(1);
  });
