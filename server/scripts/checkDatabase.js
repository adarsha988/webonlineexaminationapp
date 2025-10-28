import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import models
import User from '../models/user.model.js';
import Exam from '../models/exam.model.js';
import StudentExam from '../models/studentExam.model.js';
import Question from '../models/question.model.js';

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Get connection string (same logic as database.js)
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const dbName = process.env.MONGODB_DATABASE;
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.mongodb.net';
    
    let connectionString = process.env.DATABASE_URL || process.env.MONGODB_URI;
    
    if (!connectionString && username && password && dbName) {
      connectionString = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    } else if (!connectionString) {
      // Fallback to local MongoDB
      connectionString = 'mongodb://localhost:27017/online_exam';
    }
    
    console.log('📡 Connecting to:', connectionString.replace(/\/\/.*:.*@/, '//***:***@'));
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    console.log('📍 Connection host:', mongoose.connection.host);
    
    // Count documents in each collection
    console.log('\n📊 Collection Statistics:');
    console.log('========================');
    
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    
    const examCount = await Exam.countDocuments();
    console.log(`📝 Exams: ${examCount}`);
    
    const questionCount = await Question.countDocuments();
    console.log(`❓ Questions: ${questionCount}`);
    
    const submissionCount = await StudentExam.countDocuments();
    console.log(`📄 StudentExams: ${submissionCount}`);
    
    if (submissionCount > 0) {
      console.log('\n📋 StudentExam Documents:');
      const submissions = await StudentExam.find()
        .populate('studentId', 'name email')
        .populate('examId', 'title')
        .limit(10);
      
      submissions.forEach((sub, index) => {
        console.log(`\n${index + 1}. Student: ${sub.studentId?.name || 'Unknown'}`);
        console.log(`   Exam: ${sub.examId?.title || 'Unknown'}`);
        console.log(`   Score: ${sub.score}/${sub.totalMarks}`);
        console.log(`   Status: ${sub.gradingStatus}`);
        console.log(`   Answers: ${sub.answers?.length || 0}`);
      });
    } else {
      console.log('\n⚠️  No StudentExam documents found!');
      console.log('   This means the studentexams collection is empty.');
    }
    
    // List all collections in the database
    console.log('\n📚 All Collections in Database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the check
checkDatabase();
