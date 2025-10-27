import express from 'express';
const router = express.Router();
import Exam from '../models/exam.model.js';
import StudentExam from '../models/studentExam.model.js';
import User from '../models/user.model.js';
import { authenticateToken } from '../middleware/auth.ts';

// Get completed exams for instructor grading
router.get('/completed-exams/:instructorId', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Find exams created by this instructor
    const instructorExams = await Exam.find({ 
      instructorId: instructorId,
      status: 'published'
    }).select('_id title subject totalMarks');
    
    const examIds = instructorExams.map(exam => exam._id);
    
    // Find student submissions for these exams
    const completedExams = await StudentExam.find({
      examId: { $in: examIds },
      status: { $in: ['completed', 'pending_grading'] },
      submittedAt: { $exists: true }
    })
    .populate('studentId', 'name email')
    .populate('examId', 'title subject totalMarks duration')
    .sort({ submittedAt: -1 });
    
    // Group by exam
    const examGroups = {};
    completedExams.forEach(submission => {
      const examId = submission.examId._id.toString();
      if (!examGroups[examId]) {
        examGroups[examId] = {
          exam: submission.examId,
          submissions: [],
          stats: {
            total: 0,
            fullyGraded: 0,
            pendingGrading: 0,
            averageScore: 0
          }
        };
      }
      examGroups[examId].submissions.push(submission);
    });
    
    // Calculate statistics for each exam
    Object.keys(examGroups).forEach(examId => {
      const group = examGroups[examId];
      group.stats.total = group.submissions.length;
      group.stats.fullyGraded = group.submissions.filter(s => s.gradingStatus === 'complete').length;
      group.stats.pendingGrading = group.submissions.filter(s => s.gradingStatus === 'partial').length;
      
      const totalScore = group.submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      group.stats.averageScore = group.stats.total > 0 ? Math.round(totalScore / group.stats.total) : 0;
    });
    
    res.json({
      success: true,
      data: Object.values(examGroups)
    });
    
  } catch (error) {
    console.error('Error fetching completed exams:', error);
    res.status(500).json({ success: false, message: 'Error fetching completed exams', error: error.message });
  }
});

// Get student submissions for a specific exam
router.get('/exam/:examId/submissions', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const submissions = await StudentExam.find({
      examId: examId,
      status: { $in: ['completed', 'pending_grading'] },
      submittedAt: { $exists: true }
    })
    .populate('studentId', 'name email')
    .populate('examId', 'title subject totalMarks')
    .sort({ submittedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await StudentExam.countDocuments({
      examId: examId,
      status: { $in: ['completed', 'pending_grading'] },
      submittedAt: { $exists: true }
    });
    
    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching exam submissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching exam submissions', error: error.message });
  }
});

// Get detailed submission for grading
router.get('/submission/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await StudentExam.findById(submissionId)
      .populate('studentId', 'name email')
      .populate({
        path: 'examId',
        select: 'title subject totalMarks questions',
        populate: {
          path: 'questions',
          model: 'Question',
          select: 'questionText type options correctAnswer marks'
        }
      });
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.json({
      success: true,
      data: submission
    });
    
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ success: false, message: 'Error fetching submission details', error: error.message });
  }
});

// Grade manual questions (essay/short answer)
router.post('/submission/:submissionId/grade', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { gradedAnswers, feedback } = req.body;
    
    const submission = await StudentExam.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Update manually graded answers
    let totalScore = submission.autoGradedScore || 0;
    let manuallyGradedScore = 0;
    
    submission.answers.forEach(answer => {
      const gradedAnswer = gradedAnswers.find(ga => ga.questionId === answer.questionId);
      if (gradedAnswer && answer.gradingStatus === 'pending_manual_grading') {
        answer.score = gradedAnswer.score;
        answer.feedback = gradedAnswer.feedback || answer.feedback;
        answer.gradingStatus = 'manually_graded';
        manuallyGradedScore += gradedAnswer.score;
      }
    });
    
    // Update submission totals
    submission.manuallyGradedScore = manuallyGradedScore;
    submission.score = (submission.autoGradedScore || 0) + manuallyGradedScore;
    submission.percentage = Math.round((submission.score / submission.examId.totalMarks) * 100);
    submission.gradingStatus = 'complete';
    submission.status = 'completed';
    submission.instructorFeedback = feedback;
    submission.gradedAt = new Date();
    
    await submission.save();
    
    res.json({
      success: true,
      message: 'Grading completed successfully',
      data: {
        score: submission.score,
        percentage: submission.percentage,
        autoGradedScore: submission.autoGradedScore || 0,
        manuallyGradedScore: manuallyGradedScore
      }
    });
    
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ success: false, message: 'Error grading submission', error: error.message });
  }
});

// Send report to student
router.post('/submission/:submissionId/send-report', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { message, instructorId } = req.body;
    
    console.log('📧 SEND REPORT REQUEST:');
    console.log('Submission ID:', submissionId);
    console.log('Instructor ID:', instructorId);
    console.log('Custom Message:', message);
    
    const submission = await StudentExam.findById(submissionId)
      .populate('studentId', 'name email')
      .populate('examId', 'title subject totalMarks');
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Check if already graded
    if (submission.gradingStatus !== 'complete') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send report for incomplete grading. Please complete grading first.' 
      });
    }
    
    // Create notification for student
    const Notification = (await import('../models/notification.model.js')).default;
    
    const notification = await Notification.create({
      userId: submission.studentId._id,
      type: 'exam_result',
      title: `Exam Results: ${submission.examId.title}`,
      message: message || `Your exam "${submission.examId.title}" has been graded. Score: ${submission.score}/${submission.totalMarks} (${submission.percentage}%)`,
      link: `/student/exam/${submission.examId._id}/result`,
      priority: 'high',
      isRead: false
    });
    
    // Mark report as sent
    submission.reportSent = true;
    submission.reportSentAt = new Date();
    await submission.save();
    
    console.log('✅ Report sent successfully');
    console.log('Notification created:', notification._id);
    console.log('Student:', submission.studentId.name);
    console.log('Score:', `${submission.score}/${submission.totalMarks} (${submission.percentage}%)`);
    
    res.json({
      success: true,
      message: 'Report sent successfully to student',
      data: {
        notificationId: notification._id,
        studentName: submission.studentId.name,
        studentEmail: submission.studentId.email,
        score: submission.score,
        totalMarks: submission.totalMarks,
        percentage: submission.percentage
      }
    });
    
  } catch (error) {
    console.error('❌ Error sending report:', error);
    res.status(500).json({ success: false, message: 'Error sending report', error: error.message });
  }
});

// Get grading statistics for instructor
router.get('/stats/:instructorId', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Find exams created by this instructor
    const instructorExams = await Exam.find({ 
      instructorId: instructorId,
      status: 'published'
    }).select('_id');
    
    const examIds = instructorExams.map(exam => exam._id);
    
    // Get statistics
    const totalSubmissions = await StudentExam.countDocuments({
      examId: { $in: examIds },
      submittedAt: { $exists: true }
    });
    
    const pendingGrading = await StudentExam.countDocuments({
      examId: { $in: examIds },
      gradingStatus: 'partial'
    });
    
    const fullyGraded = await StudentExam.countDocuments({
      examId: { $in: examIds },
      gradingStatus: 'complete'
    });
    
    const recentSubmissions = await StudentExam.find({
      examId: { $in: examIds },
      submittedAt: { $exists: true }
    })
    .populate('studentId', 'name')
    .populate('examId', 'title')
    .sort({ submittedAt: -1 })
    .limit(5);
    
    res.json({
      success: true,
      data: {
        totalSubmissions,
        pendingGrading,
        fullyGraded,
        gradingProgress: totalSubmissions > 0 ? Math.round((fullyGraded / totalSubmissions) * 100) : 0,
        recentSubmissions
      }
    });
    
  } catch (error) {
    console.error('Error fetching grading statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching grading statistics', error: error.message });
  }
});

export default router;
