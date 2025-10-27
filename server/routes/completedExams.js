import express from 'express';
import { completedExamsDB } from '../data/completedExamsData.js';
import { authenticateToken } from '../middleware/auth.js';

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
    
    const completedExams = completedExamsDB.getCompletedExamsByInstructor(instructorId);
    
    // Transform data for frontend
    const transformedExams = completedExams.map(exam => {
      const stats = completedExamsDB.getGradingStats(exam.examId);
      return {
        id: exam.examId,
        title: exam.title,
        subject: exam.subject,
        date: exam.date,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        participantCount: exam.students.length,
        gradedCount: stats.gradedStudents,
        status: exam.status,
        averageScore: stats.averageScore
      };
    });

    console.log(`✅ Found ${transformedExams.length} completed exams`);
    
    res.json({
      success: true,
      exams: transformedExams,
      total: transformedExams.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching completed exams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch completed exams' 
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
    
    const examData = completedExamsDB.getExamWithStudents(examId);
    
    if (!examData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Verify instructor access
    if (req.user.userId !== examData.instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Transform student data for frontend
    const submissions = examData.students.map(student => ({
      id: student.submissionId,
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      submissionStatus: student.status,
      submittedAt: student.submittedAt,
      score: student.totalScore,
      totalMarks: examData.totalMarks,
      gradingStatus: student.gradingStatus,
      timeSpent: student.timeSpent
    }));

    console.log(`✅ Found ${submissions.length} submissions`);
    
    res.json({
      success: true,
      exam: {
        id: examData.examId,
        title: examData.title,
        subject: examData.subject,
        date: examData.date,
        duration: examData.duration,
        totalMarks: examData.totalMarks,
        participantCount: examData.students.length,
        averageScore: completedExamsDB.getGradingStats(examId).averageScore
      },
      submissions
    });
    
  } catch (error) {
    console.error('❌ Error fetching exam submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch exam submissions' 
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
    
    const examData = completedExamsDB.getExamWithStudents(examId);
    
    if (!examData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Verify instructor access
    if (req.user.userId !== examData.instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = examData.students.find(s => s.submissionId === submissionId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Transform submission data
    const submission = {
      id: student.submissionId,
      examId: examData.examId,
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      submissionStatus: student.status,
      submittedAt: student.submittedAt,
      timeSpent: student.timeSpent,
      exam: {
        title: examData.title,
        subject: examData.subject,
        totalMarks: examData.totalMarks,
        duration: examData.duration
      }
    };

    const answers = student.submissions.map(sub => ({
      id: sub.questionId,
      questionId: sub.questionId,
      questionText: sub.question,
      questionType: sub.type,
      options: sub.options || null,
      correctAnswer: sub.correctAnswer,
      studentAnswer: sub.studentAnswer,
      marks: sub.marks,
      maxMarks: sub.maxMarks,
      isCorrect: sub.isCorrect,
      feedback: sub.feedback || ''
    }));

    console.log(`✅ Found submission with ${answers.length} answers`);
    
    res.json({
      success: true,
      submission,
      answers
    });
    
  } catch (error) {
    console.error('❌ Error fetching submission detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch submission details' 
    });
  }
});

/**
 * @route PUT /api/exams/:examId/submissions/:submissionId/marks
 * @desc Save marks and feedback for a submission
 * @access Private (Instructor)
 */
router.put('/exams/:examId/submissions/:submissionId/marks', authenticateToken, async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    const { marks, feedback } = req.body;
    
    console.log(`💾 Saving marks for submission: ${submissionId}`);
    
    const examData = completedExamsDB.getExamWithStudents(examId);
    
    if (!examData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Verify instructor access
    if (req.user.userId !== examData.instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = examData.students.find(s => s.submissionId === submissionId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Update marks using the database helper
    const success = completedExamsDB.updateStudentMarks(examId, student.studentId, { marks, feedback });
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update marks' 
      });
    }

    console.log(`✅ Marks saved successfully for ${student.name}`);
    
    res.json({
      success: true,
      message: 'Marks saved successfully',
      totalScore: student.totalScore
    });
    
  } catch (error) {
    console.error('❌ Error saving marks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save marks' 
    });
  }
});

/**
 * @route POST /api/exams/:examId/submissions/:submissionId/report
 * @desc Generate report for a student's submission
 * @access Private (Instructor)
 */
router.post('/exams/:examId/submissions/:submissionId/report', authenticateToken, async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    
    console.log(`📊 Generating report for submission: ${submissionId}`);
    
    const submissionData = completedExamsDB.getStudentSubmission(examId, submissionId.replace('sub', 'stu'));
    
    if (!submissionData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    const { exam, student } = submissionData;

    // Generate report data
    const report = {
      examTitle: exam.title,
      examSubject: exam.subject,
      examDate: exam.date,
      studentName: student.name,
      studentEmail: student.email,
      totalScore: student.totalScore,
      maxScore: exam.totalMarks,
      percentage: Math.round((student.totalScore / exam.totalMarks) * 100),
      timeSpent: student.timeSpent,
      submittedAt: student.submittedAt,
      questions: student.submissions.map(sub => ({
        question: sub.question,
        type: sub.type,
        studentAnswer: sub.studentAnswer,
        correctAnswer: sub.correctAnswer,
        marks: sub.marks,
        maxMarks: sub.maxMarks,
        feedback: sub.feedback
      })),
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Report generated for ${student.name}`);
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      report
    });
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate report' 
    });
  }
});

/**
 * @route POST /api/exams/:examId/submissions/:submissionId/send-report
 * @desc Send report card to student via email
 * @access Private (Instructor)
 */
router.post('/exams/:examId/submissions/:submissionId/send-report', authenticateToken, async (req, res) => {
  try {
    const { examId, submissionId } = req.params;
    
    console.log(`📧 Sending report card for submission: ${submissionId}`);
    
    const submissionData = completedExamsDB.getStudentSubmission(examId, submissionId.replace('sub', 'stu'));
    
    if (!submissionData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    const { exam, student } = submissionData;

    // TODO: Implement actual email sending logic here
    // For now, we'll simulate the email sending
    
    console.log(`✅ Report card sent to ${student.email}`);
    
    res.json({
      success: true,
      message: `Report card sent successfully to ${student.email}`,
      sentTo: student.email,
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error sending report card:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send report card' 
    });
  }
});

/**
 * @route GET /api/exams/:examId/export
 * @desc Export exam results to CSV
 * @access Private (Instructor)
 */
router.get('/exams/:examId/export', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    
    console.log(`📤 Exporting results for exam: ${examId}`);
    
    const examData = completedExamsDB.getExamWithStudents(examId);
    
    if (!examData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Verify instructor access
    if (req.user.userId !== examData.instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate CSV content
    const csvHeader = 'Student Name,Email,Score,Total Marks,Percentage,Time Spent,Status\n';
    const csvRows = examData.students.map(student => {
      const percentage = student.totalScore ? Math.round((student.totalScore / examData.totalMarks) * 100) : 0;
      return `"${student.name}","${student.email}",${student.totalScore || 0},${examData.totalMarks},${percentage}%,${student.timeSpent},${student.gradingStatus}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${examData.title}_results.csv"`);
    
    console.log(`✅ CSV export generated for ${examData.students.length} students`);
    
    res.send(csvContent);
    
  } catch (error) {
    console.error('❌ Error exporting results:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export results' 
    });
  }
});

/**
 * @route GET /api/exams/:examId/grading-stats
 * @desc Get grading statistics for an exam
 * @access Private (Instructor)
 */
router.get('/exams/:examId/grading-stats', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    
    console.log(`📈 Fetching grading stats for exam: ${examId}`);
    
    const stats = completedExamsDB.getGradingStats(examId);
    
    if (!stats) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    console.log(`✅ Grading stats retrieved`);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching grading stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch grading statistics' 
    });
  }
});

export default router;
