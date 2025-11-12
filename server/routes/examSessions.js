import express from 'express';
const router = express.Router();
import Exam from '../models/exam.model.js';
import Question from '../models/question.model.js';
import StudentExam from '../models/studentExam.model.js';
import { authenticateToken } from '../middleware/auth.ts';

console.log(' EXAM SESSIONS ROUTES LOADED');

// Start an exam session
router.post('/:examId/start', authenticateToken, async (req, res) => {
  // Start exam endpoint
  try {
    const { examId } = req.params;
    const { studentId, sessionData = {} } = req.body;
    
    // Find the exam
    const exam = await Exam.findById(examId).populate({
      path: 'questions',
      select: 'questionText type options correctAnswer marks difficulty subject'
    });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    
    // Check if exam is published and available
    if (exam.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Exam is not available' });
    }
    
    // Check if student already has a session for this exam
    let studentExam = await StudentExam.findOne({ 
      $or: [
        { studentId: studentId, examId: examId },
        { student: studentId, exam: examId }
      ]
    });
    
    if (studentExam) {
      if (studentExam.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Exam already completed' });
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
        student: studentId,
        studentId: studentId,
        exam: examId,
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
    
    // Exam loaded successfully
    
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
      $or: [
        { studentId: studentId, examId: examId },
        { student: studentId, exam: examId }
      ]
    }).populate({
      path: 'examId exam',
      populate: {
        path: 'questions',
        model: 'Question',
        select: 'questionText type options correctAnswer marks difficulty subject'
      }
    });
    
    if (!studentExam) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    
    // Check if exam is already submitted
    if (studentExam.status === 'submitted' || studentExam.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Exam has already been submitted',
        status: studentExam.status 
      });
    }
    
    // Ensure the session has the exam data with questions
    const sessionData = {
      ...studentExam.toObject(),
      examId: studentExam.examId // Make sure examId contains the full exam with questions
    };
    
    // Session data prepared
    
    res.json({ success: true, session: sessionData });
    
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

// Submit exam with enhanced grading
router.post('/:examId/submit', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, answers } = req.body;
    
    console.log('SUBMIT EXAM DEBUG:');
    console.log('ExamId:', examId);
    console.log('StudentId:', studentId);
    console.log('Answers:', answers);
    console.log('Answers type:', typeof answers);
    console.log('Is array:', Array.isArray(answers));
    
    // Find the student exam session - try both field combinations
    let studentExam = await StudentExam.findOne({ 
      $or: [
        { studentId: studentId, examId: examId },
        { student: studentId, exam: examId }
      ]
    }).populate({
      path: 'examId',
      populate: {
        path: 'questions',
        model: 'Question'
      }
    });
    
    // If examId wasn't populated, try populating exam field
    if (studentExam && !studentExam.examId) {
      studentExam = await StudentExam.findOne({ 
        $or: [
          { studentId: studentId, examId: examId },
          { student: studentId, exam: examId }
        ]
      }).populate({
        path: 'exam',
        populate: {
          path: 'questions',
          model: 'Question'
        }
      });
      // Use exam field as examId for compatibility
      if (studentExam && studentExam.exam) {
        studentExam.examId = studentExam.exam;
      }
    }
    
    if (!studentExam) {
      console.log('Exam session not found for studentId:', studentId, 'examId:', examId);
      return res.status(404).json({ success: false, message: 'Exam session not found' });
    }
    
    console.log('Found student exam:', studentExam._id, 'Current status:', studentExam.status);
    
    // Enhanced answer processing with auto-grading
    let totalScore = 0;
    let totalMarks = 0;
    let autoGradedMarks = 0;
    let pendingManualGrading = 0;
    const processedAnswers = [];
    
    // Ensure answers is an array - if not provided, use answers from studentExam record
    let answersArray;
    if (answers && Array.isArray(answers) && answers.length > 0) {
      answersArray = answers;
    } else if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
      answersArray = [answers];
    } else if (studentExam.answers && Array.isArray(studentExam.answers) && studentExam.answers.length > 0) {
      // Use answers already saved in the student exam record
      console.log('Using answers from studentExam record');
      answersArray = studentExam.answers;
    } else {
      answersArray = [];
    }
    
    console.log('Processed answers array length:', answersArray.length);
    console.log('Sample answer:', answersArray[0]);
    
    for (const answer of answersArray) {
      const question = studentExam.examId.questions.find(q => q._id.toString() === answer.questionId);
      
      if (question) {
        totalMarks += question.marks;
        let answerScore = 0;
        let gradingStatus = 'auto_graded';
        let feedback = '';
        
        // Auto-grading logic based on question type
        // Database uses: 'mcq', 'truefalse', 'short', 'long'
        if (question.type === 'mcq' || question.type === 'truefalse') {
          // MCQ and True/False - Auto-graded
          if (answer.answer === question.correctAnswer) {
            answerScore = question.marks;
            feedback = 'Correct answer!';
          } else {
            answerScore = 0;
            feedback = `Incorrect. Correct answer: ${question.correctAnswer}`;
          }
          autoGradedMarks += answerScore;
        } else if (question.type === 'short' || question.type === 'long') {
          // Short/Long Answer - Pending manual grading
          answerScore = 0; // Will be graded manually
          gradingStatus = 'pending_manual_grading';
          feedback = 'Answer submitted. Awaiting instructor review.';
          pendingManualGrading += question.marks;
        } else {
          // Unknown question type - mark for manual grading
          answerScore = 0;
          gradingStatus = 'pending_manual_grading';
          feedback = 'Answer submitted. Awaiting instructor review.';
          pendingManualGrading += question.marks;
        }
        
        totalScore += answerScore;
        
        processedAnswers.push({
          questionId: answer.questionId,
          questionText: question.questionText,
          questionType: question.type,
          studentAnswer: answer.answer,
          correctAnswer: question.correctAnswer,
          score: answerScore,
          maxScore: question.marks,
          gradingStatus: gradingStatus,
          feedback: feedback,
          timeSpent: answer.timeSpent || 0
        });
      }
    }
    
    // Calculate percentages
    const autoGradedPercentage = totalMarks > 0 ? Math.round((autoGradedMarks / totalMarks) * 100) : 0;
    const overallPercentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    
    // Determine final status - ALWAYS set to 'completed' after submission
    const finalStatus = 'completed';
    
    // Update student exam record
    studentExam.answers = processedAnswers;
    studentExam.score = totalScore;
    studentExam.totalMarks = totalMarks;
    studentExam.autoGradedScore = autoGradedMarks;
    studentExam.pendingManualMarks = pendingManualGrading;
    studentExam.percentage = overallPercentage;
    studentExam.autoGradedPercentage = autoGradedPercentage;
    studentExam.status = finalStatus; // Always 'completed'
    studentExam.submittedAt = new Date();
    studentExam.gradingStatus = pendingManualGrading > 0 ? 'partial' : 'complete';
    
    // Ensure both field names are set for compatibility
    studentExam.exam = studentExam.examId;
    studentExam.student = studentExam.studentId;
    
    console.log('SAVING SUBMISSION:', {
      studentId: studentExam.studentId,
      examId: studentExam.examId,
      status: studentExam.status,
      score: studentExam.score,
      totalMarks: studentExam.totalMarks,
      percentage: studentExam.percentage
    });
    
    await studentExam.save();
    
    console.log('SUBMISSION SAVED SUCCESSFULLY - Status:', studentExam.status);
    
    // Get violation count
    const violationCount = studentExam.violations?.length || 0;
    
    // Prepare response message
    let message = 'Exam submitted successfully!';
    if (pendingManualGrading > 0) {
      message += ` ${pendingManualGrading} marks pending manual grading by instructor.`;
    }
    if (violationCount > 0) {
      message += ` ${violationCount} violation(s) detected and reported to instructor.`;
    }
    
    res.json({
      success: true,
      message: message,
      result: {
        score: totalScore,
        totalMarks: totalMarks,
        percentage: overallPercentage,
        autoGradedScore: autoGradedMarks,
        autoGradedPercentage: autoGradedPercentage,
        pendingManualMarks: pendingManualGrading,
        status: finalStatus,
        gradingStatus: pendingManualGrading > 0 ? 'partial' : 'complete',
        violations: violationCount,
        answersSummary: {
          total: processedAnswers.length,
          autoGraded: processedAnswers.filter(a => a.gradingStatus === 'auto_graded').length,
          pendingGrading: processedAnswers.filter(a => a.gradingStatus === 'pending_manual_grading').length
        }
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
    const { studentId, violationType, description, timestamp, severity } = req.body;
    
    console.log(`VIOLATION REPORTED (ExamSessions): ${violationType} for student ${studentId} in exam ${examId}`);
    console.log('VIOLATION DETAILS:', { studentId, violationType, description, timestamp, severity });
    
    // Find the student exam session
    const studentExam = await StudentExam.findOne({ 
      $or: [
        { studentId: studentId, examId: examId },
        { student: studentId, exam: examId }
      ]
    });
    
    if (!studentExam) {
      console.log('No active session found for violation report');
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    
    // Add violation to the session
    if (!studentExam.violations) {
      studentExam.violations = [];
    }
    
    const violationData = {
      type: violationType,
      description: description || 'Proctoring violation detected',
      timestamp: timestamp || new Date(),
      severity: severity || 'medium'
    };
    
    studentExam.violations.push(violationData);
    await studentExam.save();
    
    console.log(`Violation saved to StudentExam: ${violationType}`);
    
    // Also create ProctoringLog entry for better tracking
    try {
      const ProctoringLog = (await import('../models/proctoringLog.model.js')).default;
      const Attempt = (await import('../models/attempt.model.js')).default;
      
      // Find or create attempt
      let attempt = await Attempt.findOne({
        userId: studentId,
        examId: examId
      });
      
      if (attempt) {
        await ProctoringLog.create({
          attemptId: attempt._id,
          eventType: violationType,
          severity: severity || 'medium',
          description: description || 'Proctoring violation detected',
          timestamp: timestamp || new Date(),
          metadata: {
            source: 'exam_session',
            studentExamId: studentExam._id
          }
        });
        console.log(`Violation logged to ProctoringLog`);
      }
    } catch (logError) {
      console.error('Failed to create ProctoringLog entry:', logError.message);
      // Don't fail the request if logging fails
    }
    
    res.json({ 
      success: true, 
      message: 'Violation reported successfully',
      violationCount: studentExam.violations.length
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

export default router;
