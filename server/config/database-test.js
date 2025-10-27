import mongoose from 'mongoose';

// Mock database connection for testing
export const connectDB = async () => {
  try {
    // Skip MongoDB connection for testing
    console.log('🔧 Running in test mode - skipping MongoDB connection');

    // Return a mock connection object
    return {
      readyState: 1,
      close: () => Promise.resolve(),
      on: () => {},
      once: () => {}
    };
  } catch (error) {
    console.error('Database connection error:', error);
    // Don't exit in test mode
    return null;
  }
};

export default connectDB;
