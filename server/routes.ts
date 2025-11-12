import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authenticateToken } from "./middleware/auth.js";
import { config, validateEnv } from "./config/env.js";
// @ts-ignore
import User from "./models/user.model.js";
// @ts-ignore
import quizRoutes from "./routes/quiz.js";
// @ts-ignore
import testimonialRoutes from "./routes/testimonial.js";
// @ts-ignore
import contactRoutes from "./routes/contact.js";
// @ts-ignore
import collegeRoutes from "./routes/college.js";
// @ts-ignore
import statsRoutes from "./routes/stats.js";
// @ts-ignore
import usersRoutes from "./routes/users.js";
// @ts-ignore
import activitiesRoutes from "./routes/activities.js";
// @ts-ignore
import reportsRoutes from "./routes/reports.js";
// @ts-ignore
import exportRoutes from "./routes/export.js";
// @ts-ignore
import examsRoutes from "./routes/exams.js";
// @ts-ignore
import completedExamsRoutes from "./routes/completedExams.js";
// @ts-ignore
import notificationsRoutes from "./routes/notifications.js";
// @ts-ignore
import questionsRoutes from "./routes/questions.js";
// @ts-ignore
import sharedBanksRoutes from "./routes/sharedBanks.js";
// @ts-ignore
import adminRoutes from "./routes/admin.js";
// @ts-ignore
import analyticsRoutes from "./routes/analytics.js";
// @ts-ignore
import instructorExamsRoutes from "./routes/instructorExams.js";
// @ts-ignore
import studentExamsRoutes from "./routes/studentExams.js";
// @ts-ignore
import studentAnalyticsRoutes from "./routes/studentAnalytics.js";
// @ts-ignore
import studentNotificationsRoutes from "./routes/studentNotifications.js";
// @ts-ignore
import globalAnalyticsRoutes from "./routes/globalAnalytics.js";
// @ts-ignore
import globalNotificationsRoutes from "./routes/globalNotifications.js";
// @ts-ignore
import instructorStatsRoutes from "./routes/instructorStats.js";
// @ts-ignore
import studentStatsRoutes from "./routes/studentStats.js";
// @ts-ignore
import attemptsRoutes from "./routes/attempts.js";
// @ts-ignore
import proctoringRoutes from "./routes/proctoring.js";
// @ts-ignore
import resultsRoutes from "./routes/results.js";
// @ts-ignore
import aiProctoringRoutes from "./routes/aiProctoring.js";
// @ts-ignore
import supportRoutes from "./routes/support.js";
// Note: Using examsRoutes for both admin and student session endpoints

// Validate environment variables
validateEnv();

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Auth Routes
  // @ts-ignore
  const authRoutes = await import('./routes/auth.js');
  app.use('/api/auth', authRoutes.default);

  // Public API Routes
  app.use('/api/quiz', quizRoutes);
  app.use('/api/testimonial', testimonialRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/college', collegeRoutes);
  app.use('/api', supportRoutes);

  // Admin API Routes
  app.use('/api/stats', statsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/activities', activitiesRoutes);
  app.use('/api/recent-activities', activitiesRoutes); // Alias for activities
  app.use('/api/reports', reportsRoutes);
  app.use('/api/export', exportRoutes);
  
  // Instructor API Routes
  app.use('/api/questions', questionsRoutes);
  app.use('/api/shared-banks', sharedBanksRoutes);
  app.use('/api/exams', instructorExamsRoutes);
  
  // General exam routes (for admin)
  app.use('/api/admin/exams', examsRoutes);
  
  // Exam session routes (for students) - using dedicated exam sessions routes
  console.log('MOUNTING EXAM SESSIONS ROUTES AT /api/exam-sessions');
  // @ts-ignore
  const examSessionsRoutes = await import('./routes/examSessions.js');
  app.use('/api/exam-sessions', examSessionsRoutes.default);
  
  // Completed Exams Routes
  app.use('/api', completedExamsRoutes);
  
  // Student API Routes
  app.use('/api', studentExamsRoutes);
  app.use('/api', studentAnalyticsRoutes);
  app.use('/api', studentNotificationsRoutes);
  app.use('/api/student', studentStatsRoutes);
  
  // Instructor Stats Routes
  app.use('/api/instructor', instructorStatsRoutes);
  
  // Instructor Grading Routes
  // @ts-ignore
  const instructorGradingRoutes = await import('./routes/instructorGrading.js');
  app.use('/api/instructor/grading', instructorGradingRoutes.default);
  
  // AI Proctoring Routes
  app.use('/api/attempts', attemptsRoutes);
  app.use('/api/proctoring', proctoringRoutes);
  app.use('/api/results', resultsRoutes);
  app.use('/api/ai-proctoring', aiProctoringRoutes);
  
  // Global API Routes (role-aware)
  app.use('/api/global-analytics', globalAnalyticsRoutes);
  app.use('/api/global-notifications', globalNotificationsRoutes);
  
  // Admin API Routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, role = 'student' } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user with hashed password
      const user = await User.create({ email, password: hashedPassword, name, role });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('LOGIN ATTEMPT:', { email, passwordLength: password?.length });
      
      const user = await User.findOne({ email });
      console.log('USER FOUND:', user ? `Yes - ${user.email}` : 'No');
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare password with bcrypt
      console.log('Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('PASSWORD VALID:', isPasswordValid);
      if (!isPasswordValid) {
        console.log('Password comparison failed for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt.secret) as any;
          
          // Log logout activity if we have activity logging
          console.log(`User ${decoded.email} logged out at ${new Date().toISOString()}`);
        } catch (jwtError) {
          console.log('JWT verification failed during logout:', (jwtError as Error).message);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.originalUrl 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
