import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function populateAllCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Get connection string
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
    
    console.log('📡 Connecting to:', connectionString.replace(/\/\/.*:.*@/, '//***:***@'));
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    const db = mongoose.connection.db;
    
    // 1. ACTIVITIES
    console.log('\n📝 Populating activities...');
    const activitiesCol = db.collection('activities');
    const activitiesCount = await activitiesCol.countDocuments();
    if (activitiesCount === 0) {
      await activitiesCol.insertMany([
        {
          userId: new mongoose.Types.ObjectId(),
          action: 'login',
          description: 'User logged in',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date(),
          createdAt: new Date()
        },
        {
          userId: new mongoose.Types.ObjectId(),
          action: 'exam_started',
          description: 'Started exam: Mathematics Final',
          examId: new mongoose.Types.ObjectId(),
          timestamp: new Date(),
          createdAt: new Date()
        },
        {
          userId: new mongoose.Types.ObjectId(),
          action: 'exam_submitted',
          description: 'Submitted exam: Mathematics Final',
          examId: new mongoose.Types.ObjectId(),
          timestamp: new Date(),
          createdAt: new Date()
        }
      ]);
      console.log('✅ Created 3 activities');
    } else {
      console.log(`✓ Activities already exist (${activitiesCount})`);
    }
    
    // 2. ATTEMPTS
    console.log('\n📝 Populating attempts...');
    const attemptsCol = db.collection('attempts');
    const attemptsCount = await attemptsCol.countDocuments();
    if (attemptsCount === 0) {
      await attemptsCol.insertMany([
        {
          studentId: new mongoose.Types.ObjectId(),
          examId: new mongoose.Types.ObjectId(),
          attemptNumber: 1,
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(),
          score: 85,
          totalMarks: 100,
          percentage: 85,
          status: 'completed',
          answers: [],
          createdAt: new Date()
        },
        {
          studentId: new mongoose.Types.ObjectId(),
          examId: new mongoose.Types.ObjectId(),
          attemptNumber: 1,
          startTime: new Date(Date.now() - 7200000),
          endTime: new Date(Date.now() - 3600000),
          score: 72,
          totalMarks: 100,
          percentage: 72,
          status: 'completed',
          answers: [],
          createdAt: new Date()
        }
      ]);
      console.log('✅ Created 2 attempts');
    } else {
      console.log(`✓ Attempts already exist (${attemptsCount})`);
    }
    
    // 3. COLLEGES (already has 3)
    console.log('\n📝 Checking colleges...');
    const collegesCol = db.collection('colleges');
    const collegesCount = await collegesCol.countDocuments();
    console.log(`✓ Colleges: ${collegesCount} documents`);
    
    // 4. CONTACTS
    console.log('\n📝 Populating contacts...');
    const contactsCol = db.collection('contacts');
    const contactsCount = await contactsCol.countDocuments();
    if (contactsCount === 0) {
      await contactsCol.insertMany([
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          subject: 'Question about exams',
          message: 'How do I register for the upcoming exam?',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          subject: 'Technical support',
          message: 'I cannot access my exam results',
          status: 'resolved',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          subject: 'Feedback',
          message: 'Great platform! Very user-friendly.',
          status: 'read',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('✅ Created 3 contacts');
    } else {
      console.log(`✓ Contacts already exist (${contactsCount})`);
    }
    
    // 5. DEPARTMENTS (already has 3)
    console.log('\n📝 Checking departments...');
    const departmentsCol = db.collection('departments');
    const departmentsCount = await departmentsCol.countDocuments();
    console.log(`✓ Departments: ${departmentsCount} documents`);
    
    // 6. EXAMS (already has data)
    console.log('\n📝 Checking exams...');
    const examsCol = db.collection('exams');
    const examsCount = await examsCol.countDocuments();
    console.log(`✓ Exams: ${examsCount} documents`);
    
    // 7. NOTIFICATIONS
    console.log('\n📝 Populating notifications...');
    const notificationsCol = db.collection('notifications');
    const notificationsCount = await notificationsCol.countDocuments();
    if (notificationsCount === 0) {
      const userId = new mongoose.Types.ObjectId();
      await notificationsCol.insertMany([
        {
          userId: userId,
          title: 'Exam Scheduled',
          message: 'Your Mathematics exam is scheduled for tomorrow at 10:00 AM',
          type: 'exam',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: userId,
          title: 'Results Published',
          message: 'Your exam results are now available',
          type: 'result',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: userId,
          title: 'Welcome',
          message: 'Welcome to the Online Examination System!',
          type: 'system',
          read: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: new mongoose.Types.ObjectId(),
          title: 'Exam Reminder',
          message: 'Don\'t forget your Science exam starts in 1 hour',
          type: 'reminder',
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('✅ Created 4 notifications');
    } else {
      console.log(`✓ Notifications already exist (${notificationsCount})`);
    }
    
    // 8. PROCTORING LOGS
    console.log('\n📝 Populating proctoringlogs...');
    const proctoringCol = db.collection('proctoringlogs');
    const proctoringCount = await proctoringCol.countDocuments();
    if (proctoringCount === 0) {
      const studentId = new mongoose.Types.ObjectId();
      const examId = new mongoose.Types.ObjectId();
      await proctoringCol.insertMany([
        {
          studentId: studentId,
          examId: examId,
          eventType: 'tab_switch',
          description: 'Student switched to another tab',
          severity: 'medium',
          timestamp: new Date(Date.now() - 1800000),
          metadata: {
            previousTab: 'Exam',
            newTab: 'Unknown'
          },
          createdAt: new Date()
        },
        {
          studentId: studentId,
          examId: examId,
          eventType: 'face_not_detected',
          description: 'Face not detected in webcam',
          severity: 'high',
          timestamp: new Date(Date.now() - 1200000),
          metadata: {
            duration: 5,
            unit: 'seconds'
          },
          createdAt: new Date()
        },
        {
          studentId: studentId,
          examId: examId,
          eventType: 'multiple_faces',
          description: 'Multiple faces detected',
          severity: 'high',
          timestamp: new Date(Date.now() - 900000),
          metadata: {
            faceCount: 2
          },
          createdAt: new Date()
        },
        {
          studentId: new mongoose.Types.ObjectId(),
          examId: examId,
          eventType: 'window_blur',
          description: 'Exam window lost focus',
          severity: 'low',
          timestamp: new Date(Date.now() - 600000),
          metadata: {},
          createdAt: new Date()
        }
      ]);
      console.log('✅ Created 4 proctoring logs');
    } else {
      console.log(`✓ Proctoring logs already exist (${proctoringCount})`);
    }
    
    // 9. QUESTIONS (already has data)
    console.log('\n📝 Checking questions...');
    const questionsCol = db.collection('questions');
    const questionsCount = await questionsCol.countDocuments();
    console.log(`✓ Questions: ${questionsCount} documents`);
    
    // 10. QUIZZES (already has 8)
    console.log('\n📝 Checking quizzes...');
    const quizzesCol = db.collection('quizzes');
    const quizzesCount = await quizzesCol.countDocuments();
    console.log(`✓ Quizzes: ${quizzesCount} documents`);
    
    // 11. REPORTS
    console.log('\n📝 Populating reports...');
    const reportsCol = db.collection('reports');
    const reportsCount = await reportsCol.countDocuments();
    if (reportsCount === 0) {
      await reportsCol.insertMany([
        {
          examId: new mongoose.Types.ObjectId(),
          instructorId: new mongoose.Types.ObjectId(),
          reportType: 'exam_summary',
          title: 'Mathematics Final Exam Report',
          data: {
            totalStudents: 45,
            averageScore: 78.5,
            highestScore: 98,
            lowestScore: 45,
            passRate: 82.2
          },
          generatedAt: new Date(),
          createdAt: new Date()
        },
        {
          examId: new mongoose.Types.ObjectId(),
          instructorId: new mongoose.Types.ObjectId(),
          reportType: 'student_performance',
          title: 'Student Performance Analysis',
          data: {
            studentId: new mongoose.Types.ObjectId(),
            examsTaken: 5,
            averageScore: 85.4,
            trend: 'improving'
          },
          generatedAt: new Date(),
          createdAt: new Date()
        },
        {
          examId: new mongoose.Types.ObjectId(),
          instructorId: new mongoose.Types.ObjectId(),
          reportType: 'proctoring_violations',
          title: 'Proctoring Violations Report',
          data: {
            totalViolations: 12,
            severeViolations: 3,
            moderateViolations: 5,
            minorViolations: 4
          },
          generatedAt: new Date(),
          createdAt: new Date()
        }
      ]);
      console.log('✅ Created 3 reports');
    } else {
      console.log(`✓ Reports already exist (${reportsCount})`);
    }
    
    // 12. SHARED BANKS (already has 2)
    console.log('\n📝 Checking sharedbanks...');
    const sharedbanksCol = db.collection('sharedbanks');
    const sharedbanksCount = await sharedbanksCol.countDocuments();
    console.log(`✓ Shared banks: ${sharedbanksCount} documents`);
    
    // 13. STUDENT EXAMS (already has 3)
    console.log('\n📝 Checking studentexams...');
    const studentexamsCol = db.collection('studentexams');
    const studentexamsCount = await studentexamsCol.countDocuments();
    console.log(`✓ Student exams: ${studentexamsCount} documents`);
    
    // 14. TESTIMONIALS (already has 6)
    console.log('\n📝 Checking testimonials...');
    const testimonialsCol = db.collection('testimonials');
    const testimonialsCount = await testimonialsCol.countDocuments();
    console.log(`✓ Testimonials: ${testimonialsCount} documents`);
    
    // 15. USERS (already has data)
    console.log('\n📝 Checking users...');
    const usersCol = db.collection('users');
    const usersCount = await usersCol.countDocuments();
    console.log(`✓ Users: ${usersCount} documents`);
    
    // Final Summary
    console.log('\n🎉 Database Population Complete!');
    console.log('\n📊 Final Collection Summary:');
    console.log('============================');
    
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`✅ ${col.name.padEnd(20)} ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the population
populateAllCollections();
