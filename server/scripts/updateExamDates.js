import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from '../models/exam.model.js';

// Load environment variables
dotenv.config();

async function updateExamDates() {
  try {
    // Connect to MongoDB - use same logic as main app
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Fallback to local MongoDB
      connectionString = 'mongodb://localhost:27017/online_exam';
    }
    await mongoose.connect(connectionString);
    console.log('📊 Connected to MongoDB');

    // Get current time
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Update the Geometry Quiz to be available now
    const geometryQuiz = await Exam.findOne({ title: 'Geometry Quiz' });
    if (geometryQuiz) {
      geometryQuiz.scheduledDate = now;
      geometryQuiz.endDate = twoHoursFromNow;
      await geometryQuiz.save();
      console.log('✅ Updated Geometry Quiz - Now available until', twoHoursFromNow.toLocaleString());
    }

    // Update Data Structures Test to be available in 1 hour
    const dataStructuresTest = await Exam.findOne({ title: 'Data Structures Test' });
    if (dataStructuresTest) {
      dataStructuresTest.scheduledDate = oneHourFromNow;
      dataStructuresTest.endDate = new Date(oneHourFromNow.getTime() + 2 * 60 * 60 * 1000);
      await dataStructuresTest.save();
      console.log('✅ Updated Data Structures Test - Available from', oneHourFromNow.toLocaleString());
    }

    // List all current exams with their dates
    const allExams = await Exam.find({ status: 'published' }).select('title scheduledDate endDate');
    console.log('\n📋 Current Exam Schedule:');
    allExams.forEach(exam => {
      const isAvailable = now >= exam.scheduledDate && now <= exam.endDate;
      console.log(`${isAvailable ? '🟢' : '🔴'} ${exam.title}`);
      console.log(`   Start: ${exam.scheduledDate?.toLocaleString() || 'Not set'}`);
      console.log(`   End: ${exam.endDate?.toLocaleString() || 'Not set'}`);
      console.log(`   Status: ${isAvailable ? 'AVAILABLE NOW' : 'NOT AVAILABLE'}\n`);
    });

    console.log('🎉 Exam dates updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating exam dates:', error);
    process.exit(1);
  }
}

updateExamDates();
