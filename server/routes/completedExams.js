import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import StudentExam from '../models/studentExam.model.js';
import Exam from '../models/exam.model.js';
import User from '../models/user.model.js';

const router = express.Router();

/**
 * @route GET /api/instructor/:instructorId/exams/completed
 * @desc Get all completed exams for an instructor
 * @access Private (Instructor)
 */
router.get('/instructor/:instructorId/exams/completed', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Verify instructor access
    if (req.user.userId !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log(`📚 Fetching completed exams for instructor: ${instructorId}`);
    
    // Find all exams created by this instructor
    const exams = await Exam.find({ 
      instructorId: instructorId,
      status: { $in: ['completed', 'ongoing', 'published'] }
    }).lean();
    
    // For each exam, get submission statistics
    const transformedExams = await Promise.all(exams.map(async (exam) => {
      const submissions = await StudentExam.find({ 
        $or: [{ examId: exam._id }, { exam: exam._id }],
        status: { $in: ['completed', 'submitted'] }
      }).lean();
      
      const gradedCount = submissions.filter(s => s.gradingStatus === 'complete').length;
      const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;
      
      return {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        date: exam.scheduledDate || exam.createdAt,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        participantCount: submissions.length,
        gradedCount: gradedCount,
        status: submissions.length > 0 ? 'completed' : exam.status,
        averageScore: averageScore
      };
    }));

    // Filter out exams with no submissions
    const examsWithSubmissions = transformedExams.filter(e => e.participantCount > 0);

    console.log(`✅ Found ${examsWithSubmissions.length} completed exams with submissions`);
    
    res.json({
      success: true,
      exams: examsWithSubmissions,
      total: examsWithSubmissions.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching completed exams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch completed exams',
      error: error.message 
    });
  }
});

/**
 * @route GET /api/exams/:examId/submissions
 * @desc Get all student submissions for an exam
 * @access Private (Instructor)
 */
router.get('/exams/:examId/submissions', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    
    console.log(`📋 Fetching submissions for exam: ${examId}`);
    
    // Find the exam
    const exam = await Exam.findById(examId).lean();
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Verify instructor access
    if (req.user.userId !== exam.instructorId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find all submissions for this exam
    const studentExams = await StudentExam.find({ 
      $or: [{ examId: examId }, { exam: examId }],
      status: { $in: ['completed', 'submitted'] }
    })
    .populate('studentId', 'name email')
    .populate('student', 'name email')
    .lean();

    // Transform student data for frontend
    const submissions = studentExams.map(se => {
      const student = se.studentId || se.student;
      return {
        id: se._id,
        studentId: student?._id,
        studentName: student?.name || 'Unknown Student',
        studentEmail: student?.email || '',
        submissionStatus: se.status,
        submittedAt: se.submittedAt,
        score: se.score || 0,
        totalMarks: exam.totalMarks,
        gradingStatus: se.gradingStatus || 'pending',
        timeSpent: se.timeSpent || 0,
        percentage: se.percentage || 0
      };
    });

    console.log(`✅ Found ${submissions.length} submissions`);
    
    // Calculate average score
    const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    res.json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        date: exam.scheduledDate || exam.createdAt,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        participantCount: submissions.length,
        averageScore: averageScore
      },
      submissions
    });
    
  } catch (error) {
    console.error('❌ Error fetching exam submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch exam submissions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/exams/:examId/submissions/:submissionId
 * @desc Get detailed submission for grading
 * @access Private (Instructor)
 */
router.get('/exams/:examId/submissions/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    
    console.log(`📝 Fetching submission detail: ${submissionId} for exam: ${examId}`);
    
    // Find the exam
    const exam = await Exam.findById(examId).lean();
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Verify instructor access
    if (req.user.userId !== exam.instructorId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the submission
    const submission = await StudentExam.findById(submissionId)
      .populate('studentId', 'name email')
      .populate('student', 'name email')
      .lean();
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    const student = submission.studentId || submission.student;
    
    // Transform submission data
    const submissionData = {
      id: submission._id,
      examId: exam._id,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      submissionStatus: submission.status,
      submittedAt: submission.submittedAt,
      timeSpent: submission.timeSpent || 0,
      score: submission.score || 0,
      totalMarks: exam.totalMarks,
      percentage: submission.percentage || 0,
      gradingStatus: submission.gradingStatus || 'pending',
      exam: {
        title: exam.title,
        subject: exam.subject,
        totalMarks: exam.totalMarks,
        duration: exam.duration
      }
    };

    const answers = (submission.answers || []).map(ans => ({
      id: ans.questionId,
      questionId: ans.questionId,
      questionText: ans.questionText || '',
      questionType: ans.questionType || 'mcq',
      options: ans.options || null,
      correctAnswer: ans.correctAnswer,
      studentAnswer: ans.studentAnswer || ans.answer,
      marks: ans.score || 0,
      maxMarks: ans.maxScore || 0,
      isCorrect: ans.isCorrect,
      feedback: ans.feedback || '',
      gradingStatus: ans.gradingStatus || 'pending'
    }));

    console.log(`✅ Found submission with ${answers.length} answers`);
    
    res.json({
      success: true,
      submission: submissionData,
      answers
    });
    
  } catch (error) {
    console.error('❌ Error fetching submission detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch submission details',
      error: error.message
    });
  }
});

// Note: For grading and marks update, use /api/instructor/grading routes in instructorGrading.js

export default router;
