import Activity from '../models/activity.model.js';
import User from '../models/user.model.js';

/**
 * Seed Activity Data
 * Creates sample activity records for the admin dashboard
 */
export async function seedActivityData() {
  try {
    console.log('🌱 Starting activity data seeding...');

    // Check if activities already exist
    const existingCount = await Activity.countDocuments();
    if (existingCount > 0) {
      console.log('✅ Activities already exist, skipping seeding');
      return;
    }

    // Get users for activity records
    const admin = await User.findOne({ role: 'admin' });
    const instructors = await User.find({ role: 'instructor' }).limit(3);
    const students = await User.find({ role: 'student' }).limit(5);

    if (!admin) {
      console.log('⚠️ No admin user found. Please seed users first.');
      return;
    }

    if (instructors.length === 0 || students.length === 0) {
      console.log('⚠️ Insufficient users found. Please seed users first.');
      return;
    }

    // Generate timestamps for realistic activity history
    const now = new Date();
    const generateTimestamp = (daysAgo, hoursAgo = 0) => {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);
      return date;
    };

    // Create diverse activity records
    const activities = [
      // Recent activities (today)
      {
        user: students[0]._id,
        type: 'user_login',
        description: `${students[0].name} logged into the system`,
        metadata: {
          loginTime: new Date(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0'
        },
        ipAddress: '192.168.1.101',
        createdAt: generateTimestamp(0, 1)
      },
      {
        user: instructors[0]._id,
        type: 'exam_created',
        description: `${instructors[0].name} created a new exam: "Mathematics Final Exam"`,
        metadata: {
          examTitle: 'Mathematics Final Exam',
          subject: 'Mathematics',
          duration: 120,
          totalMarks: 100
        },
        ipAddress: '192.168.1.102',
        createdAt: generateTimestamp(0, 2)
      },
      {
        user: students[1]._id,
        type: 'exam_taken',
        description: `${students[1].name} started taking "Data Structures Quiz"`,
        metadata: {
          examTitle: 'Data Structures Quiz',
          startTime: new Date()
        },
        ipAddress: '192.168.1.103',
        createdAt: generateTimestamp(0, 3)
      },
      {
        user: admin._id,
        type: 'user_created',
        description: `Admin created new student account for ${students[2].name}`,
        metadata: {
          targetUserId: students[2]._id,
          targetUserName: students[2].name,
          targetUserEmail: students[2].email,
          targetUserRole: 'student'
        },
        ipAddress: '192.168.1.100',
        createdAt: generateTimestamp(0, 4)
      },

      // Yesterday's activities
      {
        user: instructors[1]._id,
        type: 'question_created',
        description: `${instructors[1].name} added a new question to the question bank`,
        metadata: {
          subject: 'Computer Science',
          questionType: 'mcq',
          difficulty: 'medium'
        },
        ipAddress: '192.168.1.104',
        createdAt: generateTimestamp(1, 5)
      },
      {
        user: students[2]._id,
        type: 'profile_updated',
        description: `${students[2].name} updated their profile information`,
        metadata: {
          updatedFields: ['name', 'phone', 'address']
        },
        ipAddress: '192.168.1.105',
        createdAt: generateTimestamp(1, 8)
      },
      {
        user: instructors[0]._id,
        type: 'exam_published',
        description: `${instructors[0].name} published "Physics Midterm Exam"`,
        metadata: {
          examTitle: 'Physics Midterm Exam',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        ipAddress: '192.168.1.102',
        createdAt: generateTimestamp(1, 10)
      },

      // 2 days ago
      {
        user: students[3]._id,
        type: 'user_login',
        description: `${students[3].name} logged into the system`,
        metadata: {
          loginTime: generateTimestamp(2, 2)
        },
        ipAddress: '192.168.1.106',
        createdAt: generateTimestamp(2, 2)
      },
      {
        user: admin._id,
        type: 'role_changed',
        description: `Admin changed user role for ${instructors[1].name}`,
        metadata: {
          targetUserId: instructors[1]._id,
          oldRole: 'student',
          newRole: 'instructor'
        },
        ipAddress: '192.168.1.100',
        createdAt: generateTimestamp(2, 5)
      },
      {
        user: instructors[2]._id,
        type: 'question_updated',
        description: `${instructors[2].name} updated a question in Chemistry bank`,
        metadata: {
          subject: 'Chemistry',
          questionType: 'truefalse',
          updateType: 'correction'
        },
        ipAddress: '192.168.1.107',
        createdAt: generateTimestamp(2, 8)
      },

      // 3 days ago
      {
        user: students[0]._id,
        type: 'password_changed',
        description: `${students[0].name} changed their password`,
        metadata: {
          changeReason: 'user_requested'
        },
        ipAddress: '192.168.1.101',
        createdAt: generateTimestamp(3, 3)
      },
      {
        user: instructors[0]._id,
        type: 'exam_updated',
        description: `${instructors[0].name} updated exam settings for "Algebra Test"`,
        metadata: {
          examTitle: 'Algebra Test',
          updatedFields: ['duration', 'passingMarks']
        },
        ipAddress: '192.168.1.102',
        createdAt: generateTimestamp(3, 6)
      },

      // 1 week ago
      {
        user: admin._id,
        type: 'user_activated',
        description: `Admin activated account for ${students[4].name}`,
        metadata: {
          targetUserId: students[4]._id,
          targetUserName: students[4].name,
          activationReason: 'verification_completed'
        },
        ipAddress: '192.168.1.100',
        createdAt: generateTimestamp(7, 2)
      },
      {
        user: instructors[1]._id,
        type: 'shared_bank_created',
        description: `${instructors[1].name} created a shared question bank "Physics Questions"`,
        metadata: {
          bankName: 'Physics Questions',
          visibility: 'department',
          questionCount: 0
        },
        ipAddress: '192.168.1.104',
        createdAt: generateTimestamp(7, 5)
      },
      {
        user: students[1]._id,
        type: 'user_logout',
        description: `${students[1].name} logged out of the system`,
        metadata: {
          sessionDuration: 7200, // 2 hours in seconds
          logoutType: 'manual'
        },
        ipAddress: '192.168.1.103',
        createdAt: generateTimestamp(7, 8)
      },

      // 2 weeks ago
      {
        user: instructors[2]._id,
        type: 'question_approved',
        description: `${instructors[2].name} approved a question for Biology exam`,
        metadata: {
          subject: 'Biology',
          submittedBy: instructors[0]._id,
          approvalNotes: 'Question meets quality standards'
        },
        ipAddress: '192.168.1.107',
        createdAt: generateTimestamp(14, 4)
      },
      {
        user: admin._id,
        type: 'user_deactivated',
        description: `Admin deactivated account (inactive user cleanup)`,
        metadata: {
          targetUserEmail: 'inactive@example.com',
          deactivationReason: 'prolonged_inactivity',
          lastLoginDate: generateTimestamp(90)
        },
        ipAddress: '192.168.1.100',
        createdAt: generateTimestamp(14, 7)
      },
      {
        user: instructors[0]._id,
        type: 'collaborator_added',
        description: `${instructors[0].name} added ${instructors[1].name} as collaborator`,
        metadata: {
          bankName: 'Mathematics Question Bank',
          collaboratorId: instructors[1]._id,
          permissions: ['view', 'edit']
        },
        ipAddress: '192.168.1.102',
        createdAt: generateTimestamp(14, 10)
      },

      // Additional variety
      {
        user: students[2]._id,
        type: 'user_login',
        description: `${students[2].name} logged into the system`,
        metadata: {
          loginTime: generateTimestamp(5, 3),
          loginMethod: 'password'
        },
        ipAddress: '192.168.1.105',
        createdAt: generateTimestamp(5, 3)
      },
      {
        user: instructors[1]._id,
        type: 'question_imported',
        description: `${instructors[1].name} imported 25 questions from CSV file`,
        metadata: {
          importFormat: 'csv',
          totalQuestions: 25,
          successfulImports: 23,
          failedImports: 2,
          subject: 'English'
        },
        ipAddress: '192.168.1.104',
        createdAt: generateTimestamp(4, 6)
      },
      {
        user: admin._id,
        type: 'permission_changed',
        description: `Admin updated permissions for ${instructors[2].name}`,
        metadata: {
          targetUserId: instructors[2]._id,
          permissionType: 'question_approval',
          newPermission: 'granted'
        },
        ipAddress: '192.168.1.100',
        createdAt: generateTimestamp(6, 4)
      }
    ];

    // Insert all activities
    const createdActivities = await Activity.insertMany(activities);

    console.log(`✅ Successfully seeded ${createdActivities.length} activity records`);
    console.log('📊 Activity breakdown:');
    
    // Count by type
    const activityTypes = {};
    createdActivities.forEach(activity => {
      activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
    });
    
    Object.entries(activityTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    return createdActivities;

  } catch (error) {
    console.error('❌ Error seeding activity data:', error);
    throw error;
  }
}

// Export for standalone execution
export default seedActivityData;
