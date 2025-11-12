import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedComprehensiveData } from '../data/comprehensiveSeedData.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-examination';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Run the comprehensive seed data
    await seedComprehensiveData();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 You can now login with:');
    console.log('   Student: bob@student.edu / password123');
    console.log('   Instructor: inst@example.com / password123');
    console.log('   Admin: alice@admin.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
