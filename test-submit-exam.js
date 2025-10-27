import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/online_examination';

console.log('🔧 Test Exam Submission Script');
console.log('📍 Connecting to:', MONGODB_URI);

async function testSubmitExam() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const StudentExam = mongoose.model('StudentExam', new mongoose.Schema({}, { strict: false }));
    
    // Find an in-progress exam
    const inProgressExam = await StudentExam.findOne({ status: 'in_progress' });
    
    if (!inProgressExam) {
      console.log('❌ No in-progress exams found');
      process.exit(0);
    }
    
    console.log('📝 Found in-progress exam:');
    console.log('  ID:', inProgressExam._id);
    console.log('  Student:', inProgressExam.studentId || inProgressExam.student);
    console.log('  Exam:', inProgressExam.examId || inProgressExam.exam);
    console.log('  Answers:', inProgressExam.answers?.length || 0);
    console.log('  Current Status:', inProgressExam.status);
    
    // Update to completed
    inProgressExam.status = 'completed';
    inProgressExam.submittedAt = new Date();
    inProgressExam.score = 6; // Sample score
    inProgressExam.totalMarks = 10;
    inProgressExam.percentage = 60;
    
    await inProgressExam.save();
    
    console.log('\n✅ Updated exam to completed!');
    console.log('  New Status:', inProgressExam.status);
    console.log('  Submitted At:', inProgressExam.submittedAt);
    console.log('  Score:', inProgressExam.score, '/', inProgressExam.totalMarks);
    
    // Verify
    const updated = await StudentExam.findById(inProgressExam._id);
    console.log('\n🔍 Verification:');
    console.log('  Status in DB:', updated.status);
    console.log('  Submitted:', updated.submittedAt ? 'YES' : 'NO');
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSubmitExam();
