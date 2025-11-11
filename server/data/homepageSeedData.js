import mongoose from 'mongoose';
import College from '../models/college.model.js';
import Testimonial from '../models/testimonial.model.js';
import Quiz from '../models/quiz.model.js';

export async function seedHomepageData() {
  try {
    console.log('🌱 Starting homepage data seeding...');

    // Check if data already exists
    const collegeCount = await College.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    const quizCount = await Quiz.countDocuments();

    if (collegeCount > 0 || testimonialCount > 0 || quizCount > 0) {
      console.log('✅ Homepage data already exists, skipping seeding');
      return;
    }

    console.log('📊 No existing homepage data found, seeding initial data...');

    // 1. Create Colleges
    const colleges = await College.insertMany([
      {
        name: 'Stanford University',
        address: '450 Serra Mall, Stanford, CA 94305, USA',
        coordinates: {
          latitude: 37.4275,
          longitude: -122.1697
        },
        phone: '+1-650-723-2300',
        email: 'info@stanford.edu',
        website: 'https://www.stanford.edu',
        description: 'A leading research university known for its entrepreneurial character and excellence in education.',
        isActive: true
      },
      {
        name: 'Massachusetts Institute of Technology',
        address: '77 Massachusetts Ave, Cambridge, MA 02139, USA',
        coordinates: {
          latitude: 42.3601,
          longitude: -71.0942
        },
        phone: '+1-617-253-1000',
        email: 'info@mit.edu',
        website: 'https://www.mit.edu',
        description: 'A world-renowned institute of technology and research university.',
        isActive: true
      },
      {
        name: 'Harvard University',
        address: 'Cambridge, MA 02138, USA',
        coordinates: {
          latitude: 42.3770,
          longitude: -71.1167
        },
        phone: '+1-617-495-1000',
        email: 'info@harvard.edu',
        website: 'https://www.harvard.edu',
        description: 'One of the most prestigious universities in the world, established in 1636.',
        isActive: true
      },
      {
        name: 'University of California, Berkeley',
        address: 'Berkeley, CA 94720, USA',
        coordinates: {
          latitude: 37.8719,
          longitude: -122.2585
        },
        phone: '+1-510-642-6000',
        email: 'info@berkeley.edu',
        website: 'https://www.berkeley.edu',
        description: 'A leading public research university known for academic excellence and innovation.',
        isActive: true
      },
      {
        name: 'Carnegie Mellon University',
        address: '5000 Forbes Ave, Pittsburgh, PA 15213, USA',
        coordinates: {
          latitude: 40.4443,
          longitude: -79.9436
        },
        phone: '+1-412-268-2000',
        email: 'info@cmu.edu',
        website: 'https://www.cmu.edu',
        description: 'A global research university known for its programs in technology, engineering, and computer science.',
        isActive: true
      }
    ]);

    console.log('🏢 Created colleges');

    // 2. Create Testimonials
    const testimonials = await Testimonial.insertMany([
      {
        name: 'Sarah Johnson',
        designation: 'Software Engineer',
        company: 'Google',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        message: 'The online examination system has revolutionized how we conduct assessments. The interface is intuitive and the proctoring features ensure exam integrity.',
        rating: 5,
        isActive: true
      },
      {
        name: 'Dr. Michael Chen',
        designation: 'Professor',
        company: 'Stanford University',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        message: 'As an educator, I appreciate the comprehensive analytics and reporting features. It helps me understand student performance better.',
        rating: 5,
        isActive: true
      },
      {
        name: 'Emily Rodriguez',
        designation: 'Student',
        company: 'MIT',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        message: 'Taking exams online has never been easier. The system is user-friendly and I love the instant feedback feature.',
        rating: 4,
        isActive: true
      },
      {
        name: 'David Thompson',
        designation: 'IT Director',
        company: 'Harvard University',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        message: 'The security features and scalability of this platform make it perfect for large-scale examinations. Highly recommended!',
        rating: 5,
        isActive: true
      },
      {
        name: 'Lisa Wang',
        designation: 'Academic Coordinator',
        company: 'UC Berkeley',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        message: 'The automated grading and detailed reports save us hours of work. The platform is reliable and efficient.',
        rating: 4,
        isActive: true
      },
      {
        name: 'James Wilson',
        designation: 'Department Head',
        company: 'Carnegie Mellon',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        message: 'Excellent platform for conducting remote examinations. The anti-cheating measures are top-notch.',
        rating: 5,
        isActive: true
      }
    ]);

    console.log('💬 Created testimonials');

    // 3. Create Quiz Questions
    const quizQuestions = await Quiz.insertMany([
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1, // O(log n)
        explanation: 'Binary search divides the search space in half with each iteration, resulting in O(log n) time complexity.',
        category: 'Computer Science',
        difficulty: 'medium',
        isActive: true
      },
      {
        question: 'Which of the following is NOT a programming paradigm?',
        options: ['Object-Oriented', 'Functional', 'Procedural', 'Algorithmic'],
        correctAnswer: 3, // Algorithmic
        explanation: 'Algorithmic is not a programming paradigm. The main paradigms include Object-Oriented, Functional, and Procedural.',
        category: 'Computer Science',
        difficulty: 'easy',
        isActive: true
      },
      {
        question: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Simple Query Language', 'System Query Language', 'Standard Query Language'],
        correctAnswer: 0, // Structured Query Language
        explanation: 'SQL stands for Structured Query Language, used for managing and querying relational databases.',
        category: 'Database',
        difficulty: 'easy',
        isActive: true
      },
      {
        question: 'In mathematics, what is the value of π (pi) approximately?',
        options: ['3.14159', '2.71828', '1.41421', '1.61803'],
        correctAnswer: 0, // 3.14159
        explanation: 'Pi (π) is approximately 3.14159, representing the ratio of a circle\'s circumference to its diameter.',
        category: 'Mathematics',
        difficulty: 'easy',
        isActive: true
      },
      {
        question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctAnswer: 1, // Stack
        explanation: 'A stack follows the LIFO principle where the last element added is the first one to be removed.',
        category: 'Data Structures',
        difficulty: 'easy',
        isActive: true
      },
      {
        question: 'What is the derivative of x² with respect to x?',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: 1, // 2x
        explanation: 'Using the power rule of differentiation, the derivative of x² is 2x.',
        category: 'Mathematics',
        difficulty: 'medium',
        isActive: true
      },
      {
        question: 'Which of the following is a NoSQL database?',
        options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
        correctAnswer: 2, // MongoDB
        explanation: 'MongoDB is a NoSQL database that stores data in flexible, JSON-like documents.',
        category: 'Database',
        difficulty: 'medium',
        isActive: true
      },
      {
        question: 'What is the Big O notation for the worst-case time complexity of Quick Sort?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correctAnswer: 1, // O(n²)
        explanation: 'Quick Sort has a worst-case time complexity of O(n²) when the pivot is always the smallest or largest element.',
        category: 'Algorithms',
        difficulty: 'hard',
        isActive: true
      },
      {
        question: 'In object-oriented programming, what is encapsulation?',
        options: [
          'The ability to create multiple instances of a class',
          'The bundling of data and methods that operate on that data',
          'The ability of different classes to be treated as instances of the same class',
          'The creation of new classes based on existing classes'
        ],
        correctAnswer: 1, // The bundling of data and methods that operate on that data
        explanation: 'Encapsulation is the bundling of data and the methods that operate on that data within a single unit or class.',
        category: 'Object-Oriented Programming',
        difficulty: 'medium',
        isActive: true
      },
      {
        question: 'What is the result of 2³ + 3² - 1?',
        options: ['15', '16', '17', '18'],
        correctAnswer: 1, // 16
        explanation: '2³ = 8, 3² = 9, so 8 + 9 - 1 = 16.',
        category: 'Mathematics',
        difficulty: 'easy',
        isActive: true
      }
    ]);

    console.log('🧠 Created quiz questions');

    console.log('✅ Homepage seed data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`- 🏢 Colleges: ${colleges.length}`);
    console.log(`- 💬 Testimonials: ${testimonials.length}`);
    console.log(`- 🧠 Quiz Questions: ${quizQuestions.length}`);

  } catch (error) {
    console.error('❌ Error seeding homepage data:', error);
    throw error;
  }
}
