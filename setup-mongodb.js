import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB Connection String - Update this if needed
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/online_examination';

console.log('🔧 MongoDB Setup Script');
console.log('📍 Connecting to:', MONGODB_URI);

// Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastLogin: { type: Date, default: null },
  profileImage: { type: String, default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  profile: { type: Object, default: {} }
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  subjects: [{ name: String, code: String, credits: Number, semester: Number }],
  establishedYear: Number,
  contactInfo: { email: String, phone: String, office: String },
  headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scope: { type: String, enum: ['private', 'shared'], default: 'private' },
  sharedBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'SharedBank' },
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  type: { type: String, enum: ['mcq', 'truefalse', 'short', 'long'], required: true },
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  marks: { type: Number, default: 1, min: 0 },
  tags: [String],
  metadata: { type: Object, default: {} },
  status: { type: String, enum: ['draft', 'approved', 'suggested', 'rejected'], default: 'approved' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  totalMarks: { type: Number, required: true, min: 1 },
  passingMarks: { type: Number, required: true, min: 0 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published', 'ongoing', 'completed', 'upcoming', 'inactive'], default: 'draft' },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examDate: Date,
  scheduledDate: Date,
  endDate: Date,
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  settings: {
    allowRetake: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    randomizeQuestions: { type: Boolean, default: false }
  }
}, { timestamps: true });

const studentExamSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'submitted'], default: 'not_started' },
  startTime: Date,
  endTime: Date,
  submittedAt: Date,
  score: { type: Number, default: 0 },
  totalMarks: Number,
  percentage: Number,
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: String,
    isCorrect: Boolean,
    marksAwarded: Number
  }],
  timeSpent: Number,
  isPassed: Boolean
}, { timestamps: true });

// Add unique compound index
studentExamSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['exam', 'result', 'announcement', 'reminder', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  relatedExam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  actionUrl: String
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

// Create Models
const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);
const Question = mongoose.model('Question', questionSchema);
const Exam = mongoose.model('Exam', examSchema);
const StudentExam = mongoose.model('StudentExam', studentExamSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Activity = mongoose.model('Activity', activitySchema);

// Seed Data Function
async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Question.deleteMany({}),
      Exam.deleteMany({}),
      StudentExam.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');

    // Create password hash
    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);

    // 1. Create Admin
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: defaultPassword,
      role: 'admin',
      status: 'active',
      phone: '+1-555-0001',
      address: 'Admin Office, Main Building'
    });
    console.log('✅ Admin created:', admin.email);

    // 2. Create Instructors
    console.log('\n👨‍🏫 Creating instructors...');
    const instructors = await User.insertMany([
      {
        name: 'Dr. Michael Johnson',
        email: 'instructor@example.com',
        password: defaultPassword,
        role: 'instructor',
        status: 'active',
        phone: '+1-555-0201',
        address: 'CS Department, Room 301',
        profile: { specialization: 'Computer Science', experience: 10 }
      },
      {
        name: 'Dr. Sarah Wilson',
        email: 'sarah@university.edu',
        password: defaultPassword,
        role: 'instructor',
        status: 'active',
        phone: '+1-555-0202',
        address: 'Math Department, Room 201',
        profile: { specialization: 'Mathematics', experience: 8 }
      },
      {
        name: 'Prof. David Brown',
        email: 'david@university.edu',
        password: defaultPassword,
        role: 'instructor',
        status: 'active',
        phone: '+1-555-0203',
        address: 'Physics Department, Room 101',
        profile: { specialization: 'Physics', experience: 12 }
      }
    ]);
    console.log('✅ Created', instructors.length, 'instructors');

    // 3. Create Students
    console.log('\n👨‍🎓 Creating students...');
    const students = await User.insertMany([
      {
        name: 'John Smith',
        email: 'student@example.com',
        password: defaultPassword,
        role: 'student',
        status: 'active',
        phone: '+1-555-1001',
        profile: { studentId: 'STU2021001', semester: 6, gpa: 3.5 }
      },
      {
        name: 'Emma Davis',
        email: 'emma@student.edu',
        password: defaultPassword,
        role: 'student',
        status: 'active',
        phone: '+1-555-1002',
        profile: { studentId: 'STU2021002', semester: 6, gpa: 3.7 }
      },
      {
        name: 'Liam Wilson',
        email: 'liam@student.edu',
        password: defaultPassword,
        role: 'student',
        status: 'active',
        phone: '+1-555-1003',
        profile: { studentId: 'STU2021003', semester: 4, gpa: 3.8 }
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia@student.edu',
        password: defaultPassword,
        role: 'student',
        status: 'active',
        phone: '+1-555-1004',
        profile: { studentId: 'STU2021004', semester: 4, gpa: 3.2 }
      },
      {
        name: 'Noah Anderson',
        email: 'noah@student.edu',
        password: defaultPassword,
        role: 'student',
        status: 'active',
        phone: '+1-555-1005',
        profile: { studentId: 'STU2021005', semester: 6, gpa: 3.4 }
      }
    ]);
    console.log('✅ Created', students.length, 'students');

    // 4. Create Departments
    console.log('\n🏢 Creating departments...');
    const departments = await Department.insertMany([
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Engineering',
        subjects: [
          { name: 'Data Structures', code: 'CS201', credits: 4, semester: 3 },
          { name: 'Algorithms', code: 'CS301', credits: 4, semester: 5 },
          { name: 'Database Systems', code: 'CS302', credits: 3, semester: 5 },
          { name: 'Web Development', code: 'CS401', credits: 3, semester: 7 }
        ],
        establishedYear: 1995,
        contactInfo: { email: 'cs@university.edu', phone: '+1-555-0101', office: 'Building A, Floor 3' },
        headOfDepartment: instructors[0]._id,
        instructors: [instructors[0]._id],
        students: [students[0]._id, students[1]._id, students[4]._id]
      },
      {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Department of Mathematics',
        subjects: [
          { name: 'Calculus I', code: 'MATH101', credits: 4, semester: 1 },
          { name: 'Linear Algebra', code: 'MATH201', credits: 3, semester: 3 },
          { name: 'Statistics', code: 'MATH301', credits: 3, semester: 5 }
        ],
        establishedYear: 1980,
        contactInfo: { email: 'math@university.edu', phone: '+1-555-0102', office: 'Building B, Floor 2' },
        headOfDepartment: instructors[1]._id,
        instructors: [instructors[1]._id],
        students: [students[2]._id]
      },
      {
        name: 'Physics',
        code: 'PHY',
        description: 'Department of Physics',
        subjects: [
          { name: 'Classical Mechanics', code: 'PHY101', credits: 4, semester: 1 },
          { name: 'Quantum Physics', code: 'PHY301', credits: 4, semester: 5 }
        ],
        establishedYear: 1975,
        contactInfo: { email: 'physics@university.edu', phone: '+1-555-0103', office: 'Building C, Floor 1' },
        headOfDepartment: instructors[2]._id,
        instructors: [instructors[2]._id],
        students: [students[3]._id]
      }
    ]);
    console.log('✅ Created', departments.length, 'departments');

    // 5. Create Questions
    console.log('\n❓ Creating questions...');
    const questions = await Question.insertMany([
      // Computer Science Questions
      {
        questionText: 'What does HTML stand for?',
        type: 'mcq',
        options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
        correctAnswer: 'HyperText Markup Language',
        marks: 2,
        difficulty: 'easy',
        subject: 'Computer Science',
        scope: 'private',
        createdBy: instructors[0]._id,
        tags: ['web', 'html', 'basics']
      },
      {
        questionText: 'Which data structure uses FIFO principle?',
        type: 'mcq',
        options: ['Stack', 'Queue', 'Array', 'Tree'],
        correctAnswer: 'Queue',
        marks: 2,
        difficulty: 'easy',
        subject: 'Computer Science',
        scope: 'private',
        createdBy: instructors[0]._id,
        tags: ['data-structures', 'queue']
      },
      {
        questionText: 'What is the time complexity of binary search?',
        type: 'mcq',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 'O(log n)',
        marks: 3,
        difficulty: 'medium',
        subject: 'Computer Science',
        scope: 'private',
        createdBy: instructors[0]._id,
        tags: ['algorithms', 'complexity', 'search']
      },
      {
        questionText: 'Which programming language is known for web development?',
        type: 'mcq',
        options: ['C++', 'Java', 'JavaScript', 'Python'],
        correctAnswer: 'JavaScript',
        marks: 2,
        difficulty: 'easy',
        subject: 'Computer Science',
        scope: 'private',
        createdBy: instructors[0]._id,
        tags: ['programming', 'web']
      },
      {
        questionText: 'What does CSS stand for?',
        type: 'mcq',
        options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
        correctAnswer: 'Cascading Style Sheets',
        marks: 2,
        difficulty: 'easy',
        subject: 'Computer Science',
        scope: 'private',
        createdBy: instructors[0]._id,
        tags: ['web', 'css']
      },
      // Mathematics Questions
      {
        questionText: 'What is 12 × 8?',
        type: 'mcq',
        options: ['94', '95', '96', '97'],
        correctAnswer: '96',
        marks: 2,
        difficulty: 'easy',
        subject: 'Mathematics',
        scope: 'private',
        createdBy: instructors[1]._id,
        tags: ['arithmetic', 'multiplication']
      },
      {
        questionText: 'What is the square root of 64?',
        type: 'mcq',
        options: ['6', '7', '8', '9'],
        correctAnswer: '8',
        marks: 2,
        difficulty: 'easy',
        subject: 'Mathematics',
        scope: 'private',
        createdBy: instructors[1]._id,
        tags: ['algebra', 'square-root']
      },
      {
        questionText: 'What is the value of π (pi) approximately?',
        type: 'mcq',
        options: ['3.14', '2.71', '1.61', '4.20'],
        correctAnswer: '3.14',
        marks: 1,
        difficulty: 'easy',
        subject: 'Mathematics',
        scope: 'private',
        createdBy: instructors[1]._id,
        tags: ['constants', 'geometry']
      },
      {
        questionText: 'What is 15 + 27?',
        type: 'mcq',
        options: ['41', '42', '43', '44'],
        correctAnswer: '42',
        marks: 1,
        difficulty: 'easy',
        subject: 'Mathematics',
        scope: 'private',
        createdBy: instructors[1]._id,
        tags: ['arithmetic', 'addition']
      },
      {
        questionText: 'What is 100 ÷ 4?',
        type: 'mcq',
        options: ['23', '24', '25', '26'],
        correctAnswer: '25',
        marks: 2,
        difficulty: 'easy',
        subject: 'Mathematics',
        scope: 'private',
        createdBy: instructors[1]._id,
        tags: ['arithmetic', 'division']
      },
      // Physics Questions
      {
        questionText: 'What is the speed of light in vacuum?',
        type: 'mcq',
        options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁷ m/s', '3 × 10⁹ m/s'],
        correctAnswer: '3 × 10⁸ m/s',
        marks: 2,
        difficulty: 'easy',
        subject: 'Physics',
        scope: 'private',
        createdBy: instructors[2]._id,
        tags: ['constants', 'light']
      },
      {
        questionText: 'What is Newton\'s first law of motion?',
        type: 'mcq',
        options: ['F = ma', 'An object at rest stays at rest', 'Action and reaction', 'E = mc²'],
        correctAnswer: 'An object at rest stays at rest',
        marks: 2,
        difficulty: 'easy',
        subject: 'Physics',
        scope: 'private',
        createdBy: instructors[2]._id,
        tags: ['mechanics', 'newton']
      }
    ]);
    console.log('✅ Created', questions.length, 'questions');

    // 6. Create Exams
    console.log('\n📝 Creating exams...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const exams = await Exam.insertMany([
      {
        title: 'Web Development Fundamentals',
        description: 'Test your knowledge of HTML, CSS, and JavaScript basics',
        subject: 'Computer Science',
        duration: 60,
        totalMarks: 10,
        passingMarks: 6,
        questions: questions.slice(0, 5).map(q => q._id),
        createdBy: instructors[0]._id,
        instructorId: instructors[0]._id,
        status: 'published',
        scheduledDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        assignedStudents: [students[0]._id, students[1]._id, students[4]._id],
        settings: { allowRetake: false, showResults: true, randomizeQuestions: false }
      },
      {
        title: 'Mathematics Quiz - Arithmetic',
        description: 'Basic arithmetic operations and algebra',
        subject: 'Mathematics',
        duration: 45,
        totalMarks: 8,
        passingMarks: 5,
        questions: questions.slice(5, 10).map(q => q._id),
        createdBy: instructors[1]._id,
        instructorId: instructors[1]._id,
        status: 'published',
        scheduledDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
        assignedStudents: [students[2]._id],
        settings: { allowRetake: true, showResults: true, randomizeQuestions: true }
      },
      {
        title: 'Physics Basics',
        description: 'Fundamental concepts in classical mechanics',
        subject: 'Physics',
        duration: 30,
        totalMarks: 4,
        passingMarks: 2,
        questions: questions.slice(10, 12).map(q => q._id),
        createdBy: instructors[2]._id,
        instructorId: instructors[2]._id,
        status: 'upcoming',
        scheduledDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 1 * 60 * 60 * 1000),
        assignedStudents: [students[3]._id],
        settings: { allowRetake: false, showResults: true, randomizeQuestions: false }
      }
    ]);
    console.log('✅ Created', exams.length, 'exams');

    // 7. Create Student Exam Records
    console.log('\n📊 Creating student exam records...');
    const studentExams = await StudentExam.insertMany([
      {
        student: students[0]._id,
        studentId: students[0]._id,
        exam: exams[0]._id,
        examId: exams[0]._id,
        status: 'not_started',
        totalMarks: 10
      },
      {
        student: students[1]._id,
        studentId: students[1]._id,
        exam: exams[0]._id,
        examId: exams[0]._id,
        status: 'not_started',
        totalMarks: 10
      },
      {
        student: students[4]._id,
        studentId: students[4]._id,
        exam: exams[0]._id,
        examId: exams[0]._id,
        status: 'not_started',
        totalMarks: 10
      },
      {
        student: students[2]._id,
        studentId: students[2]._id,
        exam: exams[1]._id,
        examId: exams[1]._id,
        status: 'not_started',
        totalMarks: 8
      },
      {
        student: students[3]._id,
        studentId: students[3]._id,
        exam: exams[2]._id,
        examId: exams[2]._id,
        status: 'not_started',
        totalMarks: 4
      }
    ]);
    console.log('✅ Created', studentExams.length, 'student exam records');

    // 8. Create Notifications
    console.log('\n🔔 Creating notifications...');
    const notifications = await Notification.insertMany([
      {
        userId: students[0]._id,
        type: 'exam',
        title: 'New Exam Assigned',
        message: 'You have been assigned to "Web Development Fundamentals" exam',
        isRead: false,
        priority: 'high',
        relatedExam: exams[0]._id
      },
      {
        userId: students[1]._id,
        type: 'exam',
        title: 'New Exam Assigned',
        message: 'You have been assigned to "Web Development Fundamentals" exam',
        isRead: false,
        priority: 'high',
        relatedExam: exams[0]._id
      },
      {
        userId: students[2]._id,
        type: 'exam',
        title: 'New Exam Assigned',
        message: 'You have been assigned to "Mathematics Quiz - Arithmetic" exam',
        isRead: false,
        priority: 'high',
        relatedExam: exams[1]._id
      }
    ]);
    console.log('✅ Created', notifications.length, 'notifications');

    // 9. Create Activities
    console.log('\n📈 Creating activity logs...');
    const activities = await Activity.insertMany([
      {
        userId: instructors[0]._id,
        type: 'exam_created',
        description: 'Created exam: Web Development Fundamentals',
        metadata: { examId: exams[0]._id }
      },
      {
        userId: instructors[1]._id,
        type: 'exam_created',
        description: 'Created exam: Mathematics Quiz - Arithmetic',
        metadata: { examId: exams[1]._id }
      },
      {
        userId: admin._id,
        type: 'user_created',
        description: 'System initialized with seed data',
        metadata: { action: 'database_seed' }
      }
    ]);
    console.log('✅ Created', activities.length, 'activity logs');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   • Users: ${1 + instructors.length + students.length} (1 admin, ${instructors.length} instructors, ${students.length} students)`);
    console.log(`   • Departments: ${departments.length}`);
    console.log(`   • Questions: ${questions.length}`);
    console.log(`   • Exams: ${exams.length}`);
    console.log(`   • Student Exams: ${studentExams.length}`);
    console.log(`   • Notifications: ${notifications.length}`);
    console.log(`   • Activities: ${activities.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@example.com');
    console.log('     Password: password123');
    console.log('\n   Instructor:');
    console.log('     Email: instructor@example.com');
    console.log('     Password: password123');
    console.log('\n   Student:');
    console.log('     Email: student@example.com');
    console.log('     Password: password123');
    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!\n');

    // Seed the database
    await seedDatabase();

    // Close connection
    console.log('🔌 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed. Setup complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
