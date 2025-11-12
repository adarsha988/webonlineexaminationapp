import express from 'express';
const router = express.Router();
import Exam from '../models/exam.model.js';
import Question from '../models/question.model.js';
import Activity from '../models/activity.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import StudentExam from '../models/studentExam.model.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

// GET /api/exams - Get all exams with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pipeline = [];
    const matchStage = {};

    // Filter by status
    if (status && status !== 'all') {
      matchStage.status = status;
    }

    // Search by title, subject, or instructor
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add id field and sort
    pipeline.push({ $addFields: { id: '$_id' } });
    pipeline.push({ $sort: { createdAt: -1 } });

    // Get total count
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Exam.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: parseInt(limit) });

    const exams = await Exam.aggregate(pipeline);

    res.json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Error fetching exams', error: error.message });
  }
});

// GET /api/exams/upcoming - Get upcoming exams for students
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    const now = new Date();
    
    const upcomingExams = await Exam.find({
      examDate: { $gt: now },
      status: { $in: ['published', 'upcoming'] },
      $or: [
        { assignedStudents: studentId },
        { assignedStudents: { $exists: false } }, // Public exams
        { assignedStudents: { $size: 0 } } // Public exams
      ]
    })
    .populate('instructorId', 'name email')
    .populate('questions')
    .sort({ examDate: 1 })
    .lean();

    // Add computed fields
    const enrichedExams = upcomingExams.map(exam => ({
      ...exam,
      id: exam._id,
      timeUntilExam: Math.floor((exam.examDate - now) / (1000 * 60 * 60 * 24)), // days
      canTake: true,
      instructor: exam.instructorId
    }));

    res.json({
      success: true,
      data: enrichedExams,
      count: enrichedExams.length
    });
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching upcoming exams', 
      error: error.message 
    });
  }
});

// GET /api/exams/recent - Get recent/completed exams for students
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    const now = new Date();
    
    const recentExams = await Exam.find({
      examDate: { $lt: now },
      status: { $in: ['completed', 'ongoing'] },
      $or: [
        { assignedStudents: studentId },
        { assignedStudents: { $exists: false } },
        { assignedStudents: { $size: 0 } }
      ]
    })
    .populate('instructorId', 'name email')
    .sort({ examDate: -1 })
    .limit(10)
    .lean();

    // Add computed fields
    const enrichedExams = recentExams.map(exam => ({
      ...exam,
      id: exam._id,
      daysSinceExam: Math.floor((now - exam.examDate) / (1000 * 60 * 60 * 24)),
      instructor: exam.instructorId
    }));

    res.json({
      success: true,
      data: enrichedExams,
      count: enrichedExams.length
    });
  } catch (error) {
    console.error('Error fetching recent exams:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recent exams', 
      error: error.message 
    });
  }
});

// GET /api/exams/instructor/:instructorId - Get exams by instructor
router.get('/instructor/:instructorId', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;
    
    const matchStage = { 
      instructorId: instructorId,
      status: { $ne: 'inactive' } // Exclude soft-deleted exams
    };

    // Filter by status
    if (status && status !== 'all') {
      matchStage.status = status;
    }

    // Search by title or subject
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const pipeline = [
      { $match: matchStage },
      { $addFields: { id: '$_id' } },
      { $sort: { createdAt: -1 } }
    ];

    // Get total count
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Exam.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: (page - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    const exams = await Exam.aggregate(pipeline);

    res.json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching instructor exams:', error);
    res.status(500).json({ message: 'Error fetching instructor exams', error: error.message });
  }
});

// GET /api/exams/:id - Get exam by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('questions')
      .populate('instructorId', 'name email');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Error fetching exam', error: error.message });
  }
});

// POST /api/exams - Create new exam
router.post('/', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    console.log('CREATING EXAM:', { userId: req.user.userId, examData: req.body });
    console.log('STATUS RECEIVED:', req.body.status);
    
    const examData = {
      ...req.body,
      instructorId: req.user.userId,
      createdBy: req.user.userId,
      // Set default passingMarks if not provided
      passingMarks: req.body.passingMarks || Math.floor((req.body.totalMarks || 100) * 0.4),
      // Explicitly preserve status from request body
      status: req.body.status || 'draft'
    };
    
    // Calculate endDate if scheduledDate is provided
    if (examData.scheduledDate && examData.duration) {
      const scheduledDate = new Date(examData.scheduledDate);
      const endDate = new Date(scheduledDate.getTime() + (examData.duration * 60 * 1000)); // duration in minutes to milliseconds
      examData.endDate = endDate;
      console.log(`📅 Calculated endDate: ${endDate} for exam: ${examData.title}`);
    }
    
    console.log('📝 PROCESSED EXAM DATA:', examData);
    
    const exam = new Exam(examData);
    await exam.save();
    
    console.log('✅ EXAM SAVED:', { id: exam._id, title: exam.title, status: exam.status });
    
    // Log activity
    await Activity.create({
      userId: req.user.userId,
      action: 'exam_created',
      details: `Created exam: ${exam.title}`,
      metadata: { examId: exam._id }
    });
    
    // Create notifications for students when exam is published
    if (exam.status === 'published') {
      try {
        // Get all students
        const students = await User.find({ role: 'student' }).select('_id name email');
        
        // Create notification for each student
        const notificationPromises = students.map(student => 
          Notification.createExamNotification(
            'New Exam Available',
            `A new exam "${exam.title}" has been published by your instructor. Subject: ${exam.subject}`,
            `/student/exam/${exam._id}`,
            student._id
          )
        );
        
        await Promise.all(notificationPromises);
        console.log(`✅ Created notifications for ${students.length} students about exam: ${exam.title}`);
      } catch (notificationError) {
        console.error('❌ Error creating notifications:', notificationError);
        // Don't fail the exam creation if notifications fail
      }
    }
    
    // Return exam with id field for frontend compatibility
    const examResponse = {
      ...exam.toObject(),
      id: exam._id
    };
    
    res.status(201).json(examResponse);
  } catch (error) {
    console.error('❌ ERROR CREATING EXAM:', error);
    res.status(400).json({ message: 'Error creating exam', error: error.message });
  }
});

// PUT /api/exams/:id - Update exam
router.put('/:id', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const existingExam = await Exam.findById(req.params.id);
    if (!existingExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if user owns this exam
    if (existingExam.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only edit your own exams.' });
    }
    
    // Prevent editing published exams with submissions
    if (existingExam.status === 'published' && existingExam.attempts.length > 0) {
      return res.status(400).json({ message: 'Cannot edit published exam with student submissions' });
    }
    
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log activity
    await Activity.create({
      userId: req.user.userId,
      action: 'exam_updated',
      details: `Updated exam: ${exam.title}`,
      metadata: { examId: exam._id }
    });
    
    res.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(400).json({ message: 'Error updating exam', error: error.message });
  }
});

// DELETE /api/exams/:id - Soft delete exam
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if user owns this exam
    if (exam.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own exams.' });
    }
    
    // Prevent deleting published/completed exams with submissions
    if ((exam.status === 'published' || exam.status === 'completed') && exam.attempts.length > 0) {
      return res.status(400).json({ message: 'Cannot delete exam with student submissions' });
    }
    
    // Soft delete - update status to inactive
    exam.status = 'inactive';
    await exam.save();
    
    // Log activity
    await Activity.create({
      userId: req.user.userId,
      action: 'exam_deleted',
      details: `Deleted exam: ${exam.title}`,
      metadata: { examId: exam._id }
    });
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
});

// PATCH /api/exams/:id/publish - Publish exam
router.patch('/:id/publish', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if user owns this exam
    if (exam.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only publish your own exams.' });
    }
    
    // Validate exam before publishing
    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish exam without questions' });
    }
    
    if (!exam.scheduledDate) {
      return res.status(400).json({ message: 'Cannot publish exam without scheduled date' });
    }
    
    // Check for overlapping schedules (optional validation)
    const overlappingExam = await Exam.findOne({
      instructorId: exam.instructorId,
      status: 'published',
      scheduledDate: {
        $gte: new Date(exam.scheduledDate.getTime() - exam.duration * 60000),
        $lte: new Date(exam.scheduledDate.getTime() + exam.duration * 60000)
      },
      _id: { $ne: exam._id }
    });
    
    if (overlappingExam) {
      return res.status(400).json({ message: 'Exam schedule overlaps with another published exam' });
    }
    
    exam.status = 'published';
    await exam.save();
    
    // Log activity
    await Activity.create({
      userId: req.user.userId,
      action: 'exam_published',
      details: `Published exam: ${exam.title}`,
      metadata: { examId: exam._id }
    });
    
    res.json({ message: 'Exam published successfully', exam });
  } catch (error) {
    console.error('Error publishing exam:', error);
    res.status(500).json({ message: 'Error publishing exam', error: error.message });
  }
});

// GET /api/exams/instructor/:instructorId/recent - Get recent exams for instructor
router.get('/instructor/:instructorId/recent', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { limit = 5 } = req.query;

    // Verify the requesting user owns these exams or is admin
    if (req.user.userId !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only view your own exams.' });
    }

    const exams = await Exam.find({ instructorId: instructorId })
      .populate('questions')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Add computed fields for frontend compatibility
    const enrichedExams = exams.map(exam => ({
      ...exam,
      id: exam._id,
      questionsCount: exam.questions?.length || 0,
      attemptsCount: exam.attempts?.length || 0,
      averageScore: exam.averageScore || 0
    }));

    res.json({
      success: true,
      exams: enrichedExams,
      count: enrichedExams.length
    });
  } catch (error) {
    console.error('Error fetching recent exams:', error);
    res.status(500).json({ message: 'Error fetching recent exams', error: error.message });
  }
});

// GET /api/exams/instructor/:instructorId - Get all exams for instructor with pagination
router.get('/instructor/:instructorId', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10, status, subject, search } = req.query;

    // Verify the requesting user owns these exams or is admin
    if (req.user.userId !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only view your own exams.' });
    }

    const query = { instructorId: instructorId };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by subject if provided
    if (subject) {
      query.subject = subject;
    }

    // Search by title if provided
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Get total count
    const total = await Exam.countDocuments(query);

    // Get exams with pagination
    const exams = await Exam.find(query)
      .populate('questions')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Add computed fields for frontend compatibility
    const enrichedExams = exams.map(exam => ({
      ...exam,
      id: exam._id,
      questionsCount: exam.questions?.length || 0,
      attemptsCount: exam.attempts?.length || 0,
      averageScore: exam.averageScore || 0
    }));

    res.json({
      success: true,
      exams: enrichedExams,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching instructor exams:', error);
    res.status(500).json({ message: 'Error fetching instructor exams', error: error.message });
  }
});

// Exam Session Management Endpoints

// Start an exam session
router.post('/:examId/start', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, sessionData = {} } = req.body;
    
    // Find the exam
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    
    // Check if exam is published and available
    if (exam.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Exam is not available' });
    }
    
    // Check if student already has a session for this exam
    let studentExam = await StudentExam.findOne({ 
      studentId: studentId, 
      examId: examId 
    });
    
    if (studentExam) {
      if (studentExam.status === 'submitted') {
        return res.status(400).json({ success: false, message: 'Exam already submitted' });
      }
      if (studentExam.status === 'in_progress') {
        return res.json({ 
          success: true, 
          message: 'Resuming existing session',
          session: studentExam 
        });
      }
    }
    
    // Create new exam session
    if (!studentExam) {
      studentExam = new StudentExam({
        studentId: studentId,
        examId: examId,
        status: 'in_progress',
        startedAt: new Date(),
        answers: [],
        timeSpent: 0
      });
    } else {
      studentExam.status = 'in_progress';
      studentExam.startedAt = new Date();
    }
    
    await studentExam.save();
    
    // Return exam data with session info
    res.json({
      success: true,
      session: studentExam,
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        questions: exam.questions,
        instructions: exam.instructions || 'Please read all questions carefully before answering.'
      }
    });
    
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ success: false, message: 'Error starting exam', error: error.message });
  }
});

// Get exam session
router.get('/:examId/session', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId } = req.query;
    
    const studentExam = await StudentExam.findOne({ 
      studentId: studentId, 
      examId: examId 
    }).populate('examId');
    
    if (!studentExam) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    
    res.json({ success: true, session: studentExam });
    
  } catch (error) {
    console.error('Error getting exam session:', error);
    res.status(500).json({ success: false, message: 'Error getting exam session', error: error.message });
  }
});

// Save answer
router.patch('/:examId/answer', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, questionId, answer, timeSpent = 0 } = req.body;
    
    const studentExam = await StudentExam.findOne({ 
      studentId: studentId, 
      examId: examId 
    });
    
    if (!studentExam) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    
    // Find existing answer or create new one
    const existingAnswerIndex = studentExam.answers.findIndex(
      a => a.questionId.toString() === questionId
    );
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      studentExam.answers[existingAnswerIndex].answer = answer;
      studentExam.answers[existingAnswerIndex].timeSpent = timeSpent;
      studentExam.answers[existingAnswerIndex].answeredAt = new Date();
    } else {
      // Add new answer
      studentExam.answers.push({
        questionId,
        answer,
        timeSpent,
        answeredAt: new Date()
      });
    }
    
    // Update total time spent
    studentExam.timeSpent = (studentExam.timeSpent || 0) + timeSpent;
    
    await studentExam.save();
    
    res.json({ success: true, message: 'Answer saved successfully' });
    
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ success: false, message: 'Error saving answer', error: error.message });
  }
});

// Submit exam
router.post('/:examId/submit', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId } = req.body;
    
    const studentExam = await StudentExam.findOne({ 
      studentId: studentId, 
      examId: examId 
    }).populate('examId');
    
    if (!studentExam) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    
    // Calculate score
    const exam = studentExam.examId;
    let score = 0;
    let correctAnswers = 0;
    
    for (const answer of studentExam.answers) {
      const question = await Question.findById(answer.questionId);
      if (question && question.correctAnswer === answer.answer) {
        correctAnswers++;
        score += question.marks || 1;
      }
    }
    
    // Update student exam record
    studentExam.status = 'submitted';
    studentExam.submittedAt = new Date();
    studentExam.score = score;
    studentExam.totalQuestions = exam.questions.length;
    studentExam.correctAnswers = correctAnswers;
    
    await studentExam.save();
    
    res.json({ 
      success: true, 
      message: 'Exam submitted successfully',
      result: {
        score,
        totalMarks: exam.totalMarks,
        correctAnswers,
        totalQuestions: exam.questions.length,
        percentage: (score / exam.totalMarks) * 100
      }
    });
    
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ success: false, message: 'Error submitting exam', error: error.message });
  }
});

// Report proctoring violation
router.post('/:examId/violation', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, violationType, description, timestamp } = req.body;
    
    // Find the student exam session
    const studentExam = await StudentExam.findOne({ 
      studentId: studentId, 
      examId: examId 
    });
    
    if (!studentExam) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    
    // Add violation to the session
    if (!studentExam.violations) {
      studentExam.violations = [];
    }
    
    studentExam.violations.push({
      type: violationType,
      description: description || 'Proctoring violation detected',
      timestamp: timestamp || new Date(),
      severity: 'medium' // Default severity
    });
    
    await studentExam.save();
    
    res.json({ 
      success: true, 
      message: 'Violation reported successfully'
    });
    
  } catch (error) {
    console.error('Error reporting violation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reporting violation', 
      error: error.message 
    });
  }
});

// GET /api/exams/:examId/submissions - Get all submissions for an exam (Instructor)
router.get('/:examId/submissions', authenticateToken, authorizeRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Get exam details
    const exam = await Exam.findById(examId)
      .populate('questions')
      .populate('createdBy', 'name email');
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    // Get all student submissions for this exam
    const submissions = await StudentExam.find({ 
      exam: examId,
      status: 'completed',
      submittedAt: { $exists: true }
    })
    .populate('student', 'name email')
    .sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      exam,
      submissions
    });
    
  } catch (error) {
    console.error('Error fetching exam submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching exam submissions', 
      error: error.message 
    });
  }
});

// POST /api/exams/submissions/:submissionId/send-report - Send report to student
router.post('/submissions/:submissionId/send-report', authenticateToken, authorizeRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { message, instructorId } = req.body;
    
    // Get submission details
    const submission = await StudentExam.findById(submissionId)
      .populate('exam', 'title subject')
      .populate('student', 'name email');
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    // Create notification for student
    const notification = new Notification({
      userId: submission.student._id,
      type: 'exam_result',
      title: `Exam Result: ${submission.exam.title}`,
      message: message || `Your exam "${submission.exam.title}" has been graded. Score: ${submission.score}/${submission.totalMarks} (${submission.percentage}%)`,
      link: `/student/exam/${submission.exam._id}/result`,
      isRead: false,
      metadata: {
        examId: submission.exam._id,
        submissionId: submission._id,
        score: submission.score,
        totalMarks: submission.totalMarks,
        percentage: submission.percentage
      }
    });
    
    await notification.save();
    
    // Mark report as sent
    submission.reportSent = true;
    submission.reportSentAt = new Date();
    await submission.save();
    
    res.json({
      success: true,
      message: 'Report sent successfully',
      notification
    });
    
  } catch (error) {
    console.error('Error sending report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending report', 
      error: error.message 
    });
  }
});

export default router;
