import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple user model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'instructor', 'student'] },
  status: { type: String, default: 'active' },
  profile: Object
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/online_examination');
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`ℹ️  Database already has ${existingUsers} users`);
      console.log('   Delete existing users? (This will clear all users)');
      console.log('   Run: User.deleteMany({}) in MongoDB shell if needed');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        profile: { phone: '+1-555-0001' }
      },
      {
        name: 'Dr. John Instructor',
        email: 'instructor@test.com',
        password: hashedPassword,
        role: 'instructor',
        status: 'active',
        profile: { 
          phone: '+1-555-0002',
          specialization: 'Computer Science'
        }
      },
      {
        name: 'Student User',
        email: 'student@test.com',
        password: hashedPassword,
        role: 'student',
        status: 'active',
        profile: { 
          phone: '+1-555-0003',
          studentId: 'STU2024001',
          semester: 6
        }
      }
    ];

    console.log('\n🌱 Creating users...');
    
    for (const userData of users) {
      try {
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
          console.log(`⚠️  User ${userData.email} already exists, skipping`);
        } else {
          await User.create(userData);
          console.log(`✅ Created ${userData.role}: ${userData.email}`);
        }
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️  User ${userData.email} already exists (duplicate key)`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, err.message);
        }
      }
    }

    console.log('\n✅ Seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: password123');
    console.log('\nInstructor:');
    console.log('  Email: instructor@test.com');
    console.log('  Password: password123');
    console.log('\nStudent:');
    console.log('  Email: student@test.com');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();
