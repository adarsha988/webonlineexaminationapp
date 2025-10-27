import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Database Connection...\n');

// Display configuration (without sensitive data)
console.log('Configuration:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('- MONGODB_USERNAME:', process.env.MONGODB_USERNAME ? '✓ Set' : '✗ Not set');
console.log('- MONGODB_PASSWORD:', process.env.MONGODB_PASSWORD ? '✓ Set' : '✗ Not set');
console.log('- MONGODB_DATABASE:', process.env.MONGODB_DATABASE || 'Not set');
console.log('- PORT:', process.env.PORT || '5000 (default)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
console.log('\n');

// Test database connection
const testConnection = async () => {
  try {
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const dbName = process.env.MONGODB_DATABASE;
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.mongodb.net';

    let connectionString = process.env.DATABASE_URL;

    if (!connectionString && username && password && dbName) {
      connectionString = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
      console.log('📝 Using constructed MongoDB Atlas connection string');
    } else if (!connectionString) {
      connectionString = 'mongodb://localhost:27017/online_examination';
      console.log('📝 Using local MongoDB connection string');
    } else {
      console.log('📝 Using DATABASE_URL from .env');
    }

    console.log('🔗 Attempting to connect to MongoDB...\n');

    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('1. If using MongoDB Atlas:');
      console.log('   - Check your internet connection');
      console.log('   - Verify MongoDB Atlas credentials in .env');
      console.log('   - Ensure your IP is whitelisted in MongoDB Atlas');
      console.log('2. If using local MongoDB:');
      console.log('   - Make sure MongoDB is installed and running');
      console.log('   - Run: mongod --version (to check installation)');
      console.log('   - Start MongoDB service if not running');
    }
    
    process.exit(1);
  }
};

testConnection();
