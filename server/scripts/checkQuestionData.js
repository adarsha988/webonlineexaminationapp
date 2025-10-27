import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/question.model.js';
import Exam from '../models/exam.model.js';

// Load environment variables
dotenv.config();

async function checkQuestionData() {
  try {
    // Connect to MongoDB - use same logic as main app
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Fallback to local MongoDB
      connectionString = 'mongodb://localhost:27017/online_exam';
    }
    
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    // Check questions
    console.log('\n📝 Checking Questions:');
    const questions = await Question.find().limit(5);
    questions.forEach((question, index) => {
      console.log(`\nQuestion ${index + 1}:`);
      console.log(`ID: ${question._id}`);
      console.log(`Text: "${question.questionText}"`);
      console.log(`Type: ${question.type}`);
      console.log(`Options: ${JSON.stringify(question.options)}`);
      console.log(`Correct Answer: ${question.correctAnswer}`);
    });

    // Check exam with questions
    console.log('\n📋 Checking Geometry Quiz:');
    const geometryQuiz = await Exam.findOne({ title: 'Geometry Quiz' })
      .populate({
        path: 'questions',
        select: 'questionText type options correctAnswer'
      });
    
    if (geometryQuiz) {
      console.log(`\nExam: ${geometryQuiz.title}`);
      console.log(`Questions Count: ${geometryQuiz.questions.length}`);
      
      geometryQuiz.questions.forEach((question, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log(`Text: "${question.questionText}"`);
        console.log(`Type: ${question.type}`);
        if (question.options && question.options.length > 0) {
          console.log(`Options: ${JSON.stringify(question.options)}`);
        }
        console.log(`Correct Answer: ${question.correctAnswer}`);
      });
    } else {
      console.log('❌ Geometry Quiz not found');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking question data:', error);
    process.exit(1);
  }
}

checkQuestionData();
