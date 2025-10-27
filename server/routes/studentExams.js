import express from 'express';
import mongoose from 'mongoose';
import Exam from '../models/exam.model.js';
import StudentExam from '../models/studentExam.model.js';
import Question from '../models/question.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Helper function to find user by email or ID
const findUserByIdentifier = async (identifier) => {
  try {
    // First try to find by email
    let user = await User.findOne({ email: identifier });
    if (user) return user;
    
    // If not found and identifier looks like ObjectId, try by _id
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier);
      if (user) return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

// Get student's upcoming exams
router.get('/student/:studentId/exams/upcoming', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get published exams that are scheduled for the future or currently available
    // AND are either assigned to this student or are public (no specific assignments)
    const now = new Date();
    // Get published exams that are available to this student
    const upcomingExams = await Exam.find({
      $and: [
        { status: 'published' },
        {
          $or: [
            { scheduledDate: { $gt: now } }, // Future scheduled exams
            { 
              scheduledDate: { $lte: now }, // Currently available exams
              endDate: { $gt: now } // That haven't ended yet
            },
            { scheduledDate: null } // Exams without specific schedule (always available)
          ]
        },
        {
          // Only show exams assigned to this student OR public exams
          $or: [
            { assignedStudents: user._id }, // Specifically assigned to this student
            { assignedStudents: { $exists: false } }, // No assignments (public)
            { assignedStudents: { $size: 0 } } // Empty assignments array (public)
          ]
        }
      ]
    })
    .populate('instructorId', 'name email')
    .populate('questions')
    .sort({ scheduledDate: 1 });

    // Check if student has records for these exams
    const examIds = upcomingExams.map(exam => exam._id);
    const studentExams = await StudentExam.find({
      student: user._id,
      exam: { $in: examIds }
    });

    console.log('📅 UPCOMING EXAMS DEBUG:');
    console.log('Total upcoming exams found:', upcomingExams.length);
    console.log('Student exam records:', studentExams.length);
    
    const studentExamMap = {};
    studentExams.forEach(se => {
      studentExamMap[se.exam.toString()] = se;
      console.log(`Exam ${se.exam}: status = ${se.status}`);
    });

    // Filter out exams that have been completed or submitted by the student
    const enrichedExams = upcomingExams
      .filter(exam => {
        const studentExam = studentExamMap[exam._id.toString()];
        const isCompleted = studentExam && ['completed', 'submitted'].includes(studentExam.status);
        console.log(`Exam ${exam.title}: studentStatus = ${studentExam?.status || 'none'}, isCompleted = ${isCompleted}`);
        // Exclude if student has completed or submitted the exam
        return !studentExam || !['completed', 'submitted'].includes(studentExam.status);
      })
      .map(exam => ({
        ...exam.toObject(),
        studentStatus: studentExamMap[exam._id.toString()]?.status || 'not_started',
        canStart: !studentExamMap[exam._id.toString()] || 
                  studentExamMap[exam._id.toString()].status === 'not_started'
      }));

    console.log('Filtered upcoming exams count:', enrichedExams.length);

    res.json({
      success: true,
      data: enrichedExams
    });
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming exams',
      error: error.message
    });
  }
});

// Get student's ongoing exams
router.get('/student/:studentId/exams/ongoing', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get published exams that are currently active
    // AND are either assigned to this student or are public (no specific assignments)
    const now = new Date();
    const ongoingExams = await Exam.find({
      $and: [
        { status: 'published' },
        { scheduledDate: { $lte: now } },
        {
          $or: [
            { endDate: { $gt: now } }, // Haven't ended yet
            { endDate: null } // No end date specified
          ]
        },
        {
          // Only show exams assigned to this student OR public exams
          $or: [
            { assignedStudents: user._id }, // Specifically assigned to this student
            { assignedStudents: { $exists: false } }, // No assignments (public)
            { assignedStudents: { $size: 0 } } // Empty assignments array (public)
          ]
        }
      ]
    })
    .populate('instructorId', 'name email')
    .populate('questions')
    .sort({ scheduledDate: 1 });

    // Get ALL student exam records for these exams (not just in_progress)
    const examIds = ongoingExams.map(exam => exam._id);
    const allStudentExams = await StudentExam.find({
      student: user._id,
      exam: { $in: examIds }
    });

    console.log('🔍 ONGOING EXAMS DEBUG:');
    console.log('Total exams found:', ongoingExams.length);
    console.log('Student exam records:', allStudentExams.length);
    
    const studentExamMap = {};
    allStudentExams.forEach(se => {
      studentExamMap[se.exam.toString()] = se;
      console.log(`Exam ${se.exam}: status = ${se.status}, submitted = ${se.submittedAt ? 'YES' : 'NO'}`);
    });

    // Filter out exams that have been completed or submitted
    const filteredOngoingExams = ongoingExams.filter(exam => {
      const studentExam = studentExamMap[exam._id.toString()];
      const isCompleted = studentExam && ['completed', 'submitted'].includes(studentExam.status);
      console.log(`Exam ${exam.title}: studentStatus = ${studentExam?.status || 'none'}, isCompleted = ${isCompleted}`);
      return !isCompleted; // Only include if NOT completed/submitted
    });

    console.log('Filtered ongoing exams count:', filteredOngoingExams.length);

    const enrichedExams = filteredOngoingExams.map(exam => ({
      ...exam.toObject(),
      studentExam: studentExamMap[exam._id.toString()],
      timeRemaining: studentExamMap[exam._id.toString()]?.timeRemaining || exam.duration * 60,
      canContinue: studentExamMap[exam._id.toString()]?.status === 'in_progress'
    }));

    res.json({
      success: true,
      data: enrichedExams
    });
  } catch (error) {
    console.error('Error fetching ongoing exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ongoing exams',
      error: error.message
    });
  }
});

// Get student's completed exams
router.get('/student/:studentId/exams/completed', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Only fetch completed exams where the student actually participated and has results
    const completedExams = await StudentExam.find({
      student: user._id,
      status: { $in: ['completed', 'submitted'] }, // Include both completed and submitted statuses
      submittedAt: { $exists: true } // Must have a submission date
    })
    .populate({
      path: 'exam',
      match: { status: { $ne: 'inactive' } }, // Don't show results for deleted exams
      populate: {
        path: 'instructorId',
        select: 'name email'
      }
    })
    .sort({ submittedAt: -1 });
    
    console.log('✅ COMPLETED EXAMS DEBUG:');
    console.log('Total completed records found:', completedExams.length);
    completedExams.forEach(ce => {
      console.log(`Exam: ${ce.exam?.title || 'Unknown'}, Status: ${ce.status}, Submitted: ${ce.submittedAt}, Score: ${ce.score}`);
    });
    
    // Filter out any records where the exam was not populated (deleted exams)
    const validCompletedExams = completedExams.filter(record => record.exam !== null);
    console.log('Valid completed exams count:', validCompletedExams.length);

    res.json({
      success: true,
      data: validCompletedExams,
      count: validCompletedExams.length
    });
  } catch (error) {
    console.error('Error fetching completed exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed exams',
      error: error.message
    });
  }
});

// Get student notifications
router.get('/student/:studentId/notifications', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const notifications = await Notification.find({
      userId: user._id
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Notification.countDocuments({
      userId: user._id
    });

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalRecords: total
      },
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Start exam
router.post('/student/:studentId/exam/:examId/start', async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if exam exists and is available
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if student is assigned to this exam
    if (!exam.assignedStudents.includes(user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this exam'
      });
    }

    // Check if exam is in correct status
    if (exam.status !== 'ongoing' && exam.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Exam is not available for taking'
      });
    }

    // Check if student already has an exam record
    let studentExam = await StudentExam.findOne({
      student: user._id,
      exam: examId
    });

    if (studentExam && studentExam.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this exam'
      });
    }

    // Create or update student exam record
    if (!studentExam) {
      studentExam = new StudentExam({
        student: user._id,
        exam: examId,
        status: 'in_progress',
        startedAt: new Date(),
        timeRemaining: exam.duration * 60, // Convert minutes to seconds
        answers: []
      });
    } else {
      studentExam.status = 'in_progress';
      studentExam.startedAt = new Date();
    }

    await studentExam.save();

    res.json({
      success: true,
      message: 'Exam started successfully',
      studentExam: studentExam,
      exam: exam
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start exam',
      error: error.message
    });
  }
});

// Save answer
router.post('/student/:studentId/exam/:examId/answer', async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    const { questionId, answer, timeSpent } = req.body;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentExam = await StudentExam.findOne({
      student: user._id,
      exam: examId,
      status: 'in_progress'
    });

    if (!studentExam) {
      return res.status(404).json({
        success: false,
        message: 'Active exam session not found'
      });
    }

    // Find existing answer or create new one
    const existingAnswerIndex = studentExam.answers.findIndex(
      a => a.question.toString() === questionId
    );

    const answerData = {
      question: questionId,
      answer: answer,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };

    if (existingAnswerIndex >= 0) {
      studentExam.answers[existingAnswerIndex] = answerData;
    } else {
      studentExam.answers.push(answerData);
    }

    await studentExam.save();

    res.json({
      success: true,
      message: 'Answer saved successfully'
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save answer',
      error: error.message
    });
  }
});

// Submit exam
router.post('/student/:studentId/exam/:examId/submit', async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentExam = await StudentExam.findOne({
      student: user._id,
      exam: examId,
      status: 'in_progress'
    }).populate('exam');

    if (!studentExam) {
      return res.status(404).json({
        success: false,
        message: 'Active exam session not found'
      });
    }

    // Calculate score
    const exam = studentExam.exam;
    const questions = await Question.find({ _id: { $in: exam.questions } });
    
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(question => {
      maxScore += question.marks || 1;
      const studentAnswer = studentExam.answers.find(
        a => a.question.toString() === question._id.toString()
      );
      
      if (studentAnswer && studentAnswer.answer === question.correctAnswer) {
        totalScore += question.marks || 1;
      }
    });

    // Update student exam record
    studentExam.status = 'completed';
    studentExam.submittedAt = new Date();
    studentExam.score = totalScore;
    studentExam.maxScore = maxScore;
    studentExam.percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    await studentExam.save();

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      score: totalScore,
      maxScore: maxScore,
      percentage: studentExam.percentage
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam',
      error: error.message
    });
  }
});

// Report violation
router.post('/student/:studentId/exam/:examId/violation', async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    const { type, description, severity = 'medium' } = req.body;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentExam = await StudentExam.findOne({
      student: user._id,
      exam: examId,
      status: 'in_progress'
    });

    if (!studentExam) {
      return res.status(404).json({
        success: false,
        message: 'Active exam session not found'
      });
    }

    // Add violation to student exam
    studentExam.violations.push({
      type,
      description,
      severity,
      timestamp: new Date()
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
      message: 'Failed to report violation',
      error: error.message
    });
  }
});

// Get exam results
router.get('/student/:studentId/exam/:examId/result', async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentExam = await StudentExam.findOne({
      student: user._id,
      exam: examId,
      status: 'completed'
    }).populate('exam');

    if (!studentExam) {
      return res.status(404).json({
        success: false,
        message: 'Completed exam not found'
      });
    }

    res.json({
      success: true,
      data: studentExam
    });
  } catch (error) {
    console.error('Error fetching exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam result',
      error: error.message
    });
  }
});

// Utility function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Mark notification as read
router.patch('/student/:studentId/notifications/:notificationId/read', async (req, res) => {
  try {
    const { studentId, notificationId } = req.params;
    
    const user = await findUserByIdentifier(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

export default router;
