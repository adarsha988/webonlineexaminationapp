import express from 'express';
import cors from 'cors';

// Basic middleware
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Mock authentication middleware for testing
app.use('/api/*', (req, res, next) => {
  // Add mock user for testing
  req.user = {
    userId: 'test-instructor-id',
    role: 'instructor',
    email: 'test@example.com'
  };
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'test'
  });
});

// Simple test routes for instructor APIs
app.get('/api/exams/instructor/:id', (req, res) => {
  res.json({
    success: true,
    exams: [
      {
        id: 'test-exam-1',
        title: 'Test Mathematics Exam',
        subject: 'Mathematics',
        status: 'published',
        totalMarks: 100,
        duration: 60,
        createdAt: new Date().toISOString(),
        questionsCount: 10,
        attemptsCount: 5,
        averageScore: 85
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
      itemsPerPage: 10
    }
  });
});

app.get('/api/exams/instructor/:id/recent', (req, res) => {
  res.json({
    success: true,
    exams: [
      {
        id: 'test-exam-recent',
        title: 'Recent Test Exam',
        subject: 'Science',
        status: 'draft',
        totalMarks: 80,
        duration: 45,
        createdAt: new Date().toISOString(),
        questionsCount: 8,
        attemptsCount: 0,
        averageScore: 0
      }
    ],
    total: 1
  });
});

app.get('/api/instructor/stats/:instructorId', (req, res) => {
  res.json({
    success: true,
    data: {
      totalExams: 15,
      activeToday: 2,
      completedExams: 10,
      upcomingExams: 3,
      averagePerformance: 78,
      totalQuestions: 150,
      sharedQuestions: 25,
      recentActivity: [
        {
          id: 'activity-1',
          title: 'Mathematics Final Exam',
          subject: 'Mathematics',
          examDate: new Date().toISOString(),
          status: 'completed',
          studentsCount: 25
        }
      ]
    }
  });
});

app.get('/api/instructor/performance/:instructorId', (req, res) => {
  res.json({
    success: true,
    data: {
      subjectPerformance: [
        { subject: 'Mathematics', average: 85, count: 10 },
        { subject: 'Science', average: 78, count: 8 },
        { subject: 'English', average: 82, count: 6 }
      ],
      datePerformance: [
        { date: '2024-01-15', average: 80, count: 15 },
        { date: '2024-01-16', average: 85, count: 12 }
      ],
      totalStudentExams: 150,
      averageScore: 82
    }
  });
});

app.post('/api/exams', (req, res) => {
  const { title, subject, duration, totalMarks, passingMarks, status } = req.body;

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    exam: {
      id: 'new-exam-' + Date.now(),
      title,
      subject,
      duration,
      totalMarks,
      passingMarks,
      status,
      createdAt: new Date().toISOString(),
      questionsCount: 0
    }
  });
});

app.get('/api/exams/:id', (req, res) => {
  res.json({
    success: true,
    exam: {
      id: req.params.id,
      title: 'Sample Exam',
      subject: 'Mathematics',
      description: 'A comprehensive mathematics examination',
      totalMarks: 100,
      passingMarks: 60,
      duration: 60,
      status: 'published',
      questions: [
        {
          id: 'q1',
          questionText: 'What is 2 + 2?',
          type: 'multiple_choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          marks: 5
        }
      ],
      settings: {
        allowRetake: false,
        showResults: true,
        randomizeQuestions: false
      },
      createdAt: new Date().toISOString(),
      attemptsCount: 10,
      averageScore: 85
    }
  });
});

app.put('/api/exams/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Exam updated successfully',
    exam: {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/exams/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Exam deleted successfully'
  });
});

app.listen(5002, () => {
  console.log('🚀 Test server running on http://localhost:5002');
  console.log('📋 Ready for API testing!');
  console.log('\n🔗 Available endpoints:');
  console.log('  GET  /api/exams/instructor/:id');
  console.log('  GET  /api/exams/instructor/:id/recent');
  console.log('  GET  /api/instructor/stats/:instructorId');
  console.log('  GET  /api/instructor/performance/:instructorId');
  console.log('  POST /api/exams');
  console.log('  GET  /api/exams/:id');
  console.log('  PUT  /api/exams/:id');
  console.log('  DELETE /api/exams/:id');
});

export default app;
