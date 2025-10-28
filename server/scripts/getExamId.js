import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import Exam from '../models/exam.model.js';

async function getExamId() {
  try {
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const dbName = process.env.MONGODB_DATABASE;
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.mongodb.net';
    
    let connectionString = process.env.DATABASE_URL || process.env.MONGODB_URI;
    
    if (!connectionString && username && password && dbName) {
      connectionString = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    } else if (!connectionString) {
      connectionString = 'mongodb://localhost:27017/online_exam';
    }
    
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB\n');
    
    const exams = await Exam.find().select('_id title subject');
    
    console.log('📚 Available Exams:\n');
    exams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.title}`);
      console.log(`   Subject: ${exam.subject}`);
      console.log(`   ID: ${exam._id}`);
      console.log(`   URL: http://localhost:5000/instructor/completed-exams/${exam._id}/submissions\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

getExamId();
