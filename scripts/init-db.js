const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spendsmart';

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Collections in database:');
    if (collections.length === 0) {
      console.log('   (No collections yet - they will be created when you use the app)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    const dbStats = await mongoose.connection.db.stats();
    console.log('\n📈 Database Statistics:');
    console.log(`   Database Name: ${mongoose.connection.name}`);
    console.log(`   Collections: ${dbStats.collections}`);
    console.log(`   Data Size: ${(dbStats.dataSize / 1024).toFixed(2)} KB`);
    
    console.log('\n✅ Database is ready to use!');
    console.log('   You can now start the server with: npm run dev');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB is running (if using local)');
    console.log('   2. Check your MONGODB_URI in .env file');
    console.log('   3. Verify network access (if using MongoDB Atlas)');
    console.log('   4. Check your credentials');
    process.exit(1);
  }
}

initDatabase();



