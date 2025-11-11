import ProctoringLog from '../models/proctoringLog.model.js';
import Attempt from '../models/attempt.model.js';
import User from '../models/user.model.js';
import Exam from '../models/exam.model.js';

export async function seedProctoringViolations() {
  try {
    console.log('🌱 Starting proctoring violations seeding...');

    // Check if proctoring logs already exist
    const existingLogs = await ProctoringLog.countDocuments();
    if (existingLogs > 0) {
      console.log('✅ Proctoring violations already exist, skipping seeding');
      return;
    }

    // Get existing data
    const students = await User.find({ role: 'student' }).limit(5);
    const exams = await Exam.find().limit(4);
    
    if (students.length === 0 || exams.length === 0) {
      console.log('⚠️  No students or exams found. Skipping proctoring violations seeding.');
      return;
    }

    // Create or find attempts for students
    const attempts = [];
    for (let i = 0; i < Math.min(students.length, 3); i++) {
      const student = students[i];
      const exam = exams[i % exams.length];

      // Try to find existing attempt or create a new one
      let attempt = await Attempt.findOne({ userId: student._id, examId: exam._id });
      
      if (!attempt) {
        const integrityRatings = ['high', 'medium', 'low'];
        attempt = await Attempt.create({
          userId: student._id,
          examId: exam._id,
          status: 'submitted',
          timing: {
            startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            submittedAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000),
            totalTimeSpent: Math.floor(Math.random() * 3600) + 1800
          },
          answers: [],
          proctoring: {
            enabled: true,
            suspicionScore: Math.floor(Math.random() * 50),
            integrityRating: integrityRatings[Math.floor(Math.random() * integrityRatings.length)],
            proctoringLogs: [],
            violations: []
          },
          violationCount: 0,
          criticalViolations: 0
        });
      }
      
      attempts.push(attempt);
    }

    console.log(`📊 Created/Found ${attempts.length} attempts`);

    // Define violation types with severity
    const violationTypes = [
      { eventType: 'no_face', severity: 'high', description: 'Face not detected in camera' },
      { eventType: 'multiple_faces', severity: 'high', description: 'Multiple faces detected' },
      { eventType: 'tab_switch', severity: 'medium', description: 'Student switched browser tabs' },
      { eventType: 'window_blur', severity: 'medium', description: 'Student switched to another window' },
      { eventType: 'gaze_away', severity: 'low', description: 'Student looked away from screen' },
      { eventType: 'face_mismatch', severity: 'high', description: 'Face does not match registered student' },
      { eventType: 'multiple_voices', severity: 'high', description: 'Multiple voices detected in audio' },
      { eventType: 'suspicious_audio', severity: 'medium', description: 'Suspicious background noise detected' },
      { eventType: 'fullscreen_exit', severity: 'medium', description: 'Student exited fullscreen mode' },
      { eventType: 'copy_paste', severity: 'high', description: 'Copy-paste action detected' },
      { eventType: 'right_click', severity: 'low', description: 'Right-click detected' },
      { eventType: 'dev_tools_open', severity: 'high', description: 'Developer tools opened' }
    ];

    // Create proctoring logs
    const proctoringLogs = [];
    
    for (const attempt of attempts) {
      // Create 3-8 violations per attempt
      const violationCount = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < violationCount; i++) {
        const violation = violationTypes[Math.floor(Math.random() * violationTypes.length)];
        const startTime = attempt.timing.startedAt || new Date(Date.now() - 2 * 60 * 60 * 1000);
        const endTime = attempt.timing.submittedAt || new Date(Date.now() - 1 * 60 * 60 * 1000);
        const timestamp = new Date(
          startTime.getTime() + 
          Math.random() * (endTime.getTime() - startTime.getTime())
        );

        const proctoringLog = new ProctoringLog({
          attemptId: attempt._id,
          eventType: violation.eventType,
          severity: violation.severity,
          description: violation.description,
          timestamp,
          metadata: {
            sessionId: `session_${attempt._id}_${i}`,
            confidence: Math.random() * 0.3 + 0.7,
            duration: Math.floor(Math.random() * 10) + 1
          },
          media: {
            screenshot: `/screenshots/${attempt._id}_${timestamp.getTime()}.jpg`,
            hasScreenshot: Math.random() > 0.5,
            hasVideo: false,
            hasAudio: false
          }
        });

        proctoringLogs.push(proctoringLog);
      }
    }

    // Save all proctoring logs
    await ProctoringLog.insertMany(proctoringLogs);

    // Update attempts with proctoring logs and violations
    for (const attempt of attempts) {
      const attemptLogs = proctoringLogs.filter(
        log => log.attemptId.toString() === attempt._id.toString()
      );
      
      attempt.proctoring.proctoringLogs = attemptLogs.map(log => log._id);
      attempt.violationCount = attemptLogs.length;
      attempt.criticalViolations = attemptLogs.filter(
        log => log.severity === 'high' || log.severity === 'critical'
      ).length;
      
      // Update suspicion score based on violations
      attempt.proctoring.suspicionScore = Math.min(
        100,
        attemptLogs.length * 5 + attempt.criticalViolations * 10
      );
      
      // Update integrity rating based on suspicion score
      if (attempt.proctoring.suspicionScore >= 60) {
        attempt.proctoring.integrityRating = 'compromised';
      } else if (attempt.proctoring.suspicionScore >= 35) {
        attempt.proctoring.integrityRating = 'low';
      } else if (attempt.proctoring.suspicionScore >= 15) {
        attempt.proctoring.integrityRating = 'medium';
      } else {
        attempt.proctoring.integrityRating = 'high';
      }
      
      await attempt.save();
    }

    console.log(`🔔 Created ${proctoringLogs.length} proctoring violation logs`);
    console.log('✅ Proctoring violations seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding proctoring violations:', error);
    throw error;
  }
}
