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

async function createTestSubmissions() {
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

    // Find or create an instructor
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      console.log('📝 No instructor found. Creating one...');
      instructor = await User.create({
        name: 'Test Instructor',
        email: 'instructor@test.com',
        password: '$2b$10$YourHashedPasswordHere', // Placeholder - won't be used for login
        role: 'instructor'
      });
      console.log('✅ Created instructor:', instructor.name);
    } else {
      console.log('👨‍🏫 Found instructor:', instructor.name);
    }

    // Find or create test students
    console.log('\n📝 Creating test students...');
    const studentEmails = [
      'john.smith@test.com',
      'sarah.johnson@test.com',
      'mike.davis@test.com',
      'emily.wilson@test.com',
      'david.brown@test.com'
    ];

    const studentNames = [
      'John Smith',
      'Sarah Johnson',
      'Mike Davis',
      'Emily Wilson',
      'David Brown'
    ];

    const students = [];
    for (let i = 0; i < studentEmails.length; i++) {
      let student = await User.findOne({ email: studentEmails[i] });
      if (!student) {
        student = await User.create({
          email: studentEmails[i],
          password: '$2b$10$YourHashedPasswordHere', // You should hash this properly
          name: studentNames[i],
          role: 'student'
        });
        console.log(`✅ Created student: ${studentNames[i]}`);
      } else {
        console.log(`✓ Student exists: ${studentNames[i]}`);
      }
      students.push(student);
    }

    // Find or create a test exam
    console.log('\n📚 Finding or creating test exam...');
    let exam = await Exam.findOne({ instructorId: instructor._id });
    
    if (!exam) {
      // Create questions first
      const questions = [];
      
      const q1 = await Question.create({
        questionText: 'What is 2 + 2?',
        type: 'mcq',
        options: ['2', '3', '4', '5'],
        correctAnswer: '4',
        marks: 10,
        createdBy: instructor._id,
        subject: 'Mathematics',
        difficulty: 'easy'
      });
      questions.push(q1._id);

      const q2 = await Question.create({
        questionText: 'Is the Earth flat?',
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 'False',
        marks: 10,
        createdBy: instructor._id,
        subject: 'Science',
        difficulty: 'easy'
      });
      questions.push(q2._id);

      const q3 = await Question.create({
        questionText: 'Explain the Pythagorean theorem.',
        type: 'long',
        correctAnswer: null,
        marks: 25,
        createdBy: instructor._id,
        subject: 'Mathematics',
        difficulty: 'medium'
      });
      questions.push(q3._id);

      const q4 = await Question.create({
        questionText: 'What is the capital of France?',
        type: 'short',
        correctAnswer: 'Paris',
        marks: 15,
        createdBy: instructor._id,
        subject: 'Geography',
        difficulty: 'easy'
      });
      questions.push(q4._id);

      const q5 = await Question.create({
        questionText: 'Describe the process of photosynthesis.',
        type: 'long',
        correctAnswer: null,
        marks: 40,
        createdBy: instructor._id,
        subject: 'Biology',
        difficulty: 'hard'
      });
      questions.push(q5._id);

      // Create exam
      exam = await Exam.create({
        title: 'Test Exam - Mathematics & Science',
        subject: 'Mixed',
        description: 'Test exam for grading demonstration',
        instructorId: instructor._id,
        createdBy: instructor._id,
        questions: questions,
        totalMarks: 100,
        duration: 120,
        scheduledDate: new Date(),
        status: 'published',
        passingMarks: 40
      });
      console.log('✅ Created test exam:', exam.title);
    } else {
      console.log('✓ Using existing exam:', exam.title);
    }

    // Populate questions
    await exam.populate('questions');
    const questions = exam.questions;

    // Create test submissions
    console.log('\n📝 Creating test submissions...');
    
    const submissions = [
      {
        student: students[0],
        answers: [
          { 
            questionId: questions[0]._id,
            answer: '4',
            studentAnswer: '4',
            isCorrect: true,
            marksObtained: 10,
            score: 10,
            maxScore: 10,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[0].questionText,
            questionType: questions[0].type,
            correctAnswer: questions[0].correctAnswer,
            timeSpent: 30
          },
          { 
            questionId: questions[1]._id,
            answer: 'False',
            studentAnswer: 'False',
            isCorrect: true,
            marksObtained: 10,
            score: 10,
            maxScore: 10,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[1].questionText,
            questionType: questions[1].type,
            correctAnswer: questions[1].correctAnswer,
            timeSpent: 20
          },
          { 
            questionId: questions[2]._id,
            answer: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides. Formula: a² + b² = c²',
            studentAnswer: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides. Formula: a² + b² = c²',
            isCorrect: null,
            marksObtained: 0,
            score: 0,
            maxScore: 25,
            gradingStatus: 'pending_manual_grading',
            feedback: '',
            questionText: questions[2].questionText,
            questionType: questions[2].type,
            correctAnswer: null,
            timeSpent: 180
          },
          { 
            questionId: questions[3]._id,
            answer: 'Paris',
            studentAnswer: 'Paris',
            isCorrect: true,
            marksObtained: 15,
            score: 15,
            maxScore: 15,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[3].questionText,
            questionType: questions[3].type,
            correctAnswer: questions[3].correctAnswer,
            timeSpent: 25
          },
          { 
            questionId: questions[4]._id,
            answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and produces glucose and oxygen.',
            studentAnswer: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and produces glucose and oxygen.',
            isCorrect: null,
            marksObtained: 0,
            score: 0,
            maxScore: 40,
            gradingStatus: 'pending_manual_grading',
            feedback: '',
            questionText: questions[4].questionText,
            questionType: questions[4].type,
            correctAnswer: null,
            timeSpent: 240
          }
        ],
        autoGradedScore: 35,
        score: 35
      },
      {
        student: students[1],
        answers: [
          { 
            questionId: questions[0]._id,
            answer: '4',
            studentAnswer: '4',
            isCorrect: true,
            marksObtained: 10,
            score: 10,
            maxScore: 10,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[0].questionText,
            questionType: questions[0].type,
            correctAnswer: questions[0].correctAnswer,
            timeSpent: 25
          },
          { 
            questionId: questions[1]._id,
            answer: 'False',
            studentAnswer: 'False',
            isCorrect: true,
            marksObtained: 10,
            score: 10,
            maxScore: 10,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[1].questionText,
            questionType: questions[1].type,
            correctAnswer: questions[1].correctAnswer,
            timeSpent: 18
          },
          { 
            questionId: questions[2]._id,
            answer: 'In a right triangle, a² + b² = c² where c is the hypotenuse.',
            studentAnswer: 'In a right triangle, a² + b² = c² where c is the hypotenuse.',
            isCorrect: null,
            marksObtained: 0,
            score: 0,
            maxScore: 25,
            gradingStatus: 'pending_manual_grading',
            feedback: '',
            questionText: questions[2].questionText,
            questionType: questions[2].type,
            correctAnswer: null,
            timeSpent: 150
          },
          { 
            questionId: questions[3]._id,
            answer: 'Paris',
            studentAnswer: 'Paris',
            isCorrect: true,
            marksObtained: 15,
            score: 15,
            maxScore: 15,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[3].questionText,
            questionType: questions[3].type,
            correctAnswer: questions[3].correctAnswer,
            timeSpent: 20
          },
          { 
            questionId: questions[4]._id,
            answer: 'Plants use sunlight, water, and CO2 to make glucose and oxygen.',
            studentAnswer: 'Plants use sunlight, water, and CO2 to make glucose and oxygen.',
            isCorrect: null,
            marksObtained: 0,
            score: 0,
            maxScore: 40,
            gradingStatus: 'pending_manual_grading',
            feedback: '',
            questionText: questions[4].questionText,
            questionType: questions[4].type,
            correctAnswer: null,
            timeSpent: 200
          }
        ],
        autoGradedScore: 35,
        score: 35
      },
      {
        student: students[2],
        answers: [
          { 
            questionId: questions[0]._id,
            answer: '3',
            studentAnswer: '3',
            isCorrect: false,
            marksObtained: 0,
            score: 0,
            maxScore: 10,
            gradingStatus: 'auto_graded',
            feedback: 'Incorrect. The correct answer is 4.',
            questionText: questions[0].questionText,
            questionType: questions[0].type,
            correctAnswer: questions[0].correctAnswer,
            timeSpent: 35
          },
          { 
            questionId: questions[1]._id,
            answer: 'False',
            studentAnswer: 'False',
            isCorrect: true,
            marksObtained: 10,
            score: 10,
            maxScore: 10,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[1].questionText,
            questionType: questions[1].type,
            correctAnswer: questions[1].correctAnswer,
            timeSpent: 22
          },
          { 
            questionId: questions[2]._id,
            answer: 'It is about triangles and squares.',
            studentAnswer: 'It is about triangles and squares.',
            isCorrect: null,
            marksObtained: 0,
            score: 0,
            maxScore: 25,
            gradingStatus: 'pending_manual_grading',
            feedback: '',
            questionText: questions[2].questionText,
            questionType: questions[2].type,
            correctAnswer: null,
            timeSpent: 120
          },
          { 
            questionId: questions[3]._id,
            answer: 'Paris',
            studentAnswer: 'Paris',
            isCorrect: true,
            marksObtained: 15,
            score: 15,
            maxScore: 15,
            gradingStatus: 'auto_graded',
            feedback: 'Correct!',
            questionText: questions[3].questionText,
            questionType: questions[3].type,
            correctAnswer: questions[3].correctAnswer,
            timeSpent: 18
          },
          { 
            questionId: questions[4]._id,
            answer: 'Plants make food from sunlight.',
            studentAnswer: 'Plants make food from sunlight.',
            isCorrect: null,
            marksObtained: 0,
            score: 0,
            maxScore: 40,
            gradingStatus: 'pending_manual_grading',
            feedback: '',
            questionText: questions[4].questionText,
            questionType: questions[4].type,
            correctAnswer: null,
            timeSpent: 180
          }
        ],
        autoGradedScore: 25,
        score: 25
      }
    ];

    for (let i = 0; i < submissions.length; i++) {
      const submissionData = submissions[i];
      
      // Check if submission already exists
      const existing = await StudentExam.findOne({
        examId: exam._id,
        studentId: submissionData.student._id
      });

      if (existing) {
        console.log(`✓ Submission exists for ${submissionData.student.name}`);
        continue;
      }

      const submission = await StudentExam.create({
        examId: exam._id,
        exam: exam._id,
        studentId: submissionData.student._id,
        student: submissionData.student._id,
        answers: submissionData.answers,
        status: 'submitted',
        gradingStatus: 'partial',
        score: submissionData.score,
        autoGradedScore: submissionData.autoGradedScore,
        totalMarks: exam.totalMarks,
        percentage: Math.round((submissionData.score / exam.totalMarks) * 100),
        submittedAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
        startedAt: new Date(Date.now() - Math.random() * 90000000)
      });

      console.log(`✅ Created submission for ${submissionData.student.name} - Score: ${submission.score}/${exam.totalMarks}`);
    }

    console.log('\n🎉 Test submissions created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Exam: ${exam.title}`);
    console.log(`- Exam ID: ${exam._id}`);
    console.log(`- Total Questions: ${questions.length}`);
    console.log(`- Total Marks: ${exam.totalMarks}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Submissions: ${submissions.length}`);
    console.log('\n✅ You can now test the grading feature!');
    console.log(`\n🔗 Navigate to: /instructor/exams`);
    console.log(`   Then click "View Submissions" on the test exam`);

  } catch (error) {
    console.error('❌ Error creating test submissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createTestSubmissions();
