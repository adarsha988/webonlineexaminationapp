// Dummy database for completed exams functionality
// This will be replaced with MongoDB/Postgres later

const completedExamsData = [
  {
    examId: "exam123",
    title: "JavaScript Fundamentals",
    subject: "Computer Science",
    date: "2025-01-15",
    duration: 120,
    totalMarks: 100,
    instructorId: "68beffab1da34d8f8e1fef08", // Dr. Michael Johnson
    status: "completed",
    createdAt: "2025-01-10T09:00:00Z",
    completedAt: "2025-01-15T12:00:00Z",
    students: [
      {
        studentId: "stu001",
        name: "Alice Johnson",
        email: "alice.johnson@student.edu",
        submissionId: "sub001",
        submittedAt: "2025-01-15T11:45:00Z",
        timeSpent: 115,
        status: "completed",
        totalScore: 85,
        gradingStatus: "graded",
        submissions: [
          {
            questionId: "q1",
            type: "mcq",
            question: "What is a closure in JavaScript?",
            options: ["Function with preserved scope", "Just a function", "A loop", "An object"],
            correctAnswer: "Function with preserved scope",
            studentAnswer: "Function with preserved scope",
            marks: 5,
            maxMarks: 5,
            isCorrect: true,
            feedback: "Excellent understanding!"
          },
          {
            questionId: "q2",
            type: "short",
            question: "Explain the JavaScript event loop in 2-3 sentences.",
            correctAnswer: "The event loop handles asynchronous operations by managing a call stack and callback queue, ensuring non-blocking execution.",
            studentAnswer: "JS handles async operations with event loop that manages call stack and callback queue for non-blocking execution",
            marks: 8,
            maxMarks: 10,
            isCorrect: null,
            feedback: "Good explanation, could be more detailed about phases."
          },
          {
            questionId: "q3",
            type: "essay",
            question: "Discuss the advantages and disadvantages of using Promises in JavaScript. Provide examples.",
            studentAnswer: "Promises make async code cleaner and more readable compared to callbacks. They help avoid callback hell and provide better error handling with .catch(). However, they can still chain heavily and might be complex for beginners. Example: fetch() returns a promise that can be chained with .then() and .catch().",
            marks: 12,
            maxMarks: 15,
            isCorrect: null,
            feedback: "Good coverage of pros and cons. Could include more specific examples."
          }
        ]
      },
      {
        studentId: "stu002",
        name: "Bob Smith",
        email: "bob.smith@student.edu",
        submissionId: "sub002",
        submittedAt: "2025-01-15T11:30:00Z",
        timeSpent: 108,
        status: "completed",
        totalScore: null,
        gradingStatus: "pending",
        submissions: [
          {
            questionId: "q1",
            type: "mcq",
            question: "What is a closure in JavaScript?",
            options: ["Function with preserved scope", "Just a function", "A loop", "An object"],
            correctAnswer: "Function with preserved scope",
            studentAnswer: "Just a function",
            marks: 0,
            maxMarks: 5,
            isCorrect: false,
            feedback: ""
          },
          {
            questionId: "q2",
            type: "short",
            question: "Explain the JavaScript event loop in 2-3 sentences.",
            correctAnswer: "The event loop handles asynchronous operations by managing a call stack and callback queue, ensuring non-blocking execution.",
            studentAnswer: "It is how JavaScript waits for things to happen and processes them one by one.",
            marks: null,
            maxMarks: 10,
            isCorrect: null,
            feedback: ""
          },
          {
            questionId: "q3",
            type: "essay",
            question: "Discuss the advantages and disadvantages of using Promises in JavaScript. Provide examples.",
            studentAnswer: "Promises are good for async operations but can be hard to debug when they chain too much. They are better than callbacks though.",
            marks: null,
            maxMarks: 15,
            isCorrect: null,
            feedback: ""
          }
        ]
      },
      {
        studentId: "stu003",
        name: "Carol Davis",
        email: "carol.davis@student.edu",
        submissionId: "sub003",
        submittedAt: "2025-01-15T11:55:00Z",
        timeSpent: 120,
        status: "completed",
        totalScore: 92,
        gradingStatus: "graded",
        submissions: [
          {
            questionId: "q1",
            type: "mcq",
            question: "What is a closure in JavaScript?",
            options: ["Function with preserved scope", "Just a function", "A loop", "An object"],
            correctAnswer: "Function with preserved scope",
            studentAnswer: "Function with preserved scope",
            marks: 5,
            maxMarks: 5,
            isCorrect: true,
            feedback: "Perfect!"
          },
          {
            questionId: "q2",
            type: "short",
            question: "Explain the JavaScript event loop in 2-3 sentences.",
            correctAnswer: "The event loop handles asynchronous operations by managing a call stack and callback queue, ensuring non-blocking execution.",
            studentAnswer: "The event loop is JavaScript's mechanism for handling asynchronous operations. It manages a call stack for synchronous code and a callback queue for async operations, ensuring non-blocking execution by processing callbacks when the call stack is empty.",
            marks: 10,
            maxMarks: 10,
            isCorrect: null,
            feedback: "Excellent detailed explanation!"
          },
          {
            questionId: "q3",
            type: "essay",
            question: "Discuss the advantages and disadvantages of using Promises in JavaScript. Provide examples.",
            studentAnswer: "Promises provide several advantages: 1) Better readability than callbacks, 2) Built-in error handling with .catch(), 3) Chainable with .then(). Example: fetch('/api/data').then(response => response.json()).catch(error => console.error(error)). Disadvantages include: 1) Still can create complex chains, 2) Learning curve for beginners, 3) Not as intuitive as async/await syntax.",
            marks: 14,
            maxMarks: 15,
            isCorrect: null,
            feedback: "Comprehensive answer with good examples. Minor deduction for not mentioning Promise.all/race."
          }
        ]
      }
    ]
  },
  {
    examId: "exam124",
    title: "React Components & Hooks",
    subject: "Web Development",
    date: "2025-01-12",
    duration: 90,
    totalMarks: 80,
    instructorId: "68beffab1da34d8f8e1fef08",
    status: "completed",
    createdAt: "2025-01-08T10:00:00Z",
    completedAt: "2025-01-12T14:30:00Z",
    students: [
      {
        studentId: "stu001",
        name: "Alice Johnson",
        email: "alice.johnson@student.edu",
        submissionId: "sub004",
        submittedAt: "2025-01-12T14:20:00Z",
        timeSpent: 85,
        status: "completed",
        totalScore: 75,
        gradingStatus: "graded",
        submissions: [
          {
            questionId: "q4",
            type: "mcq",
            question: "Which hook is used for side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: "useEffect",
            studentAnswer: "useEffect",
            marks: 5,
            maxMarks: 5,
            isCorrect: true,
            feedback: "Correct!"
          },
          {
            questionId: "q5",
            type: "short",
            question: "What is the difference between controlled and uncontrolled components?",
            correctAnswer: "Controlled components have their state managed by React, while uncontrolled components manage their own state internally.",
            studentAnswer: "Controlled components are managed by React state, uncontrolled manage their own state with refs",
            marks: 8,
            maxMarks: 10,
            isCorrect: null,
            feedback: "Good answer, could mention form elements specifically."
          }
        ]
      },
      {
        studentId: "stu004",
        name: "David Wilson",
        email: "david.wilson@student.edu",
        submissionId: "sub005",
        submittedAt: "2025-01-12T14:15:00Z",
        timeSpent: 78,
        status: "completed",
        totalScore: null,
        gradingStatus: "pending",
        submissions: [
          {
            questionId: "q4",
            type: "mcq",
            question: "Which hook is used for side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: "useEffect",
            studentAnswer: "useState",
            marks: 0,
            maxMarks: 5,
            isCorrect: false,
            feedback: ""
          },
          {
            questionId: "q5",
            type: "short",
            question: "What is the difference between controlled and uncontrolled components?",
            correctAnswer: "Controlled components have their state managed by React, while uncontrolled components manage their own state internally.",
            studentAnswer: "Controlled components use props, uncontrolled use state",
            marks: null,
            maxMarks: 10,
            isCorrect: null,
            feedback: ""
          }
        ]
      }
    ]
  }
];

// Helper functions for data manipulation
const completedExamsDB = {
  // Get all completed exams for an instructor
  getCompletedExamsByInstructor: (instructorId) => {
    return completedExamsData.filter(exam => exam.instructorId === instructorId);
  },

  // Get exam with students for a specific exam
  getExamWithStudents: (examId) => {
    return completedExamsData.find(exam => exam.examId === examId);
  },

  // Get specific student submission for an exam
  getStudentSubmission: (examId, studentId) => {
    const exam = completedExamsData.find(exam => exam.examId === examId);
    if (!exam) return null;
    
    const student = exam.students.find(student => student.studentId === studentId);
    return student ? { exam, student } : null;
  },

  // Update marks for a student's submission
  updateStudentMarks: (examId, studentId, marksData) => {
    const exam = completedExamsData.find(exam => exam.examId === examId);
    if (!exam) return false;
    
    const student = exam.students.find(student => student.studentId === studentId);
    if (!student) return false;

    // Update marks and feedback for each question
    Object.keys(marksData.marks).forEach(questionId => {
      const submission = student.submissions.find(sub => sub.questionId === questionId);
      if (submission && submission.type !== 'mcq') {
        submission.marks = marksData.marks[questionId];
        if (marksData.feedback[questionId]) {
          submission.feedback = marksData.feedback[questionId];
        }
      }
    });

    // Calculate total score
    const totalScore = student.submissions.reduce((total, submission) => {
      return total + (submission.marks || 0);
    }, 0);

    student.totalScore = totalScore;
    student.gradingStatus = 'graded';

    return true;
  },

  // Get grading statistics for an exam
  getGradingStats: (examId) => {
    const exam = completedExamsData.find(exam => exam.examId === examId);
    if (!exam) return null;

    const totalStudents = exam.students.length;
    const gradedStudents = exam.students.filter(student => student.gradingStatus === 'graded').length;
    const pendingStudents = totalStudents - gradedStudents;
    
    const gradedScores = exam.students
      .filter(student => student.totalScore !== null)
      .map(student => student.totalScore);
    
    const averageScore = gradedScores.length > 0 
      ? gradedScores.reduce((sum, score) => sum + score, 0) / gradedScores.length 
      : 0;

    return {
      totalStudents,
      gradedStudents,
      pendingStudents,
      averageScore: Math.round(averageScore * 100) / 100,
      gradingProgress: Math.round((gradedStudents / totalStudents) * 100)
    };
  }
};

export { completedExamsDB };
