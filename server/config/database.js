import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const dbName = process.env.MONGODB_DATABASE;
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.mongodb.net';

    // Use full DATABASE_URL if provided, otherwise construct from individual parts
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString && username && password && dbName) {
      connectionString = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    } else if (!connectionString) {
      // For development without MongoDB, use a mock connection
      console.log('🔧 MongoDB not available - using mock database connection for testing');
      console.log('📋 Note: Some features will be limited without a real database');

      // Return a mock mongoose connection object
      return {
        readyState: 1,
        close: () => Promise.resolve(),
        on: () => {},
        once: () => {},
        db: {
          collection: () => ({}),
          collections: () => ({}),
        }
      };
    }

    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // For development, don't exit - allow server to start with limited functionality
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Continuing with limited functionality (no database)');
      return null;
    }

    process.exit(1);
  }
};

export default connectDB;
