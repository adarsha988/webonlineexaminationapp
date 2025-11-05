import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CalendarDays, 
  Timer, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Trophy,
  TrendingUp,
  Play,
  Eye,
  Calendar,
  Target,
  Bell,
  Award,
  Zap,
  Activity,
  FileText,
  Sparkles,
  User,
  Users,
  Brain,
  Crown,
  MessageSquare
} from 'lucide-react';
import { studentExamAPI, studentNotificationsAPI } from '../../api/studentExams';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const StudentDashboard = () => {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [ongoingExams, setOngoingExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    upcomingCount: 0,
    rank: 12,
    totalStudents: 150
  });
  
  const [performanceData] = useState([
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 82 },
    { month: 'Mar', score: 78 },
    { month: 'Apr', score: 88 },
    { month: 'May', score: 92 },
    { month: 'Jun', score: 95 }
  ]);

  const [leaderboard] = useState([
    { rank: 1, name: 'Emily Chen', score: 98, avatar: '👩‍🎓' },
    { rank: 2, name: 'Michael Kim', score: 96, avatar: '👨‍🎓' },
    { rank: 3, name: 'Sarah Johnson', score: 95, avatar: '👩‍💼' },
    { rank: 4, name: 'David Lee', score: 94, avatar: '👨‍💻' },
    { rank: 5, name: 'You', score: 92, avatar: '⭐', isCurrentUser: true }
  ]);

  const [radarData] = useState([
    { subject: 'Math', score: 92, fullMark: 100 },
    { subject: 'Science', score: 85, fullMark: 100 },
    { subject: 'English', score: 88, fullMark: 100 },
    { subject: 'History', score: 78, fullMark: 100 },
    { subject: 'Programming', score: 95, fullMark: 100 },
    { subject: 'Physics', score: 82, fullMark: 100 }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get authenticated user email from localStorage or use a valid test email
      const studentId = localStorage.getItem('userEmail') || 'sophia@student.edu';
      
      console.log('🔍 FETCHING DASHBOARD DATA FOR:', studentId);
      console.log('📧 Using authenticated user email instead of UUID');
      
      const [upcomingResponse, ongoingResponse, completedResponse, notificationsResponse] = await Promise.allSettled([
        studentExamAPI.getUpcomingExams(studentId).catch(err => {
          console.error('❌ UPCOMING EXAMS ERROR:', err);
          return { data: [] };
        }),
        studentExamAPI.getOngoingExams(studentId).catch(err => {
          console.error('❌ ONGOING EXAMS ERROR:', err);
          return { data: [] };
        }),
        studentExamAPI.getCompletedExams(studentId, 1, 5).catch(err => {
          console.error('❌ COMPLETED EXAMS ERROR:', err);
          return { data: [] };
        }),
        studentNotificationsAPI.getNotifications(studentId, 1, 5, false).catch(err => {
          console.error('❌ NOTIFICATIONS ERROR:', err);
          return { data: [] };
        })
      ]);

      console.log('✅ DASHBOARD: API responses received');
      console.log('📈 Upcoming:', upcomingResponse.status === 'fulfilled' ? upcomingResponse.value : upcomingResponse.reason);
      console.log('🔄 Ongoing:', ongoingResponse.status === 'fulfilled' ? ongoingResponse.value : ongoingResponse.reason);
      console.log('✅ Completed:', completedResponse.status === 'fulfilled' ? completedResponse.value : completedResponse.reason);
      console.log('🔔 Notifications:', notificationsResponse.status === 'fulfilled' ? notificationsResponse.value : notificationsResponse.reason);

      // Set data from successful responses
      if (upcomingResponse.status === 'fulfilled') {
        setUpcomingExams(upcomingResponse.value.data || []);
      }
      if (ongoingResponse.status === 'fulfilled') {
        setOngoingExams(ongoingResponse.value.data || []);
      }
      if (completedResponse.status === 'fulfilled') {
        setCompletedExams(completedResponse.value.data || []);
      }
      if (notificationsResponse.status === 'fulfilled') {
        setNotifications(notificationsResponse.value.data || []);
      }

      // Update stats
      const totalUpcoming = upcomingResponse.status === 'fulfilled' ? (upcomingResponse.value.data || []).length : 0;
      const totalCompleted = completedResponse.status === 'fulfilled' ? (completedResponse.value.data || []).length : 0;
      
      setStats({
        totalExams: totalUpcoming + totalCompleted,
        completedExams: totalCompleted,
        averageScore: 85, // Default for now
        upcomingCount: totalUpcoming
      });

    } catch (error) {
      console.error('❌ DASHBOARD ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExams = (exams) => {
    return exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || exam.subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  };

  const getUniqueSubjects = () => {
    const allExams = [...upcomingExams, ...completedExams];
    const subjects = [...new Set(allExams.map(exam => exam.subject))];
    return subjects;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExam = (examDate) => {
    const now = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days`;
    return 'Past due';
  };

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      {/* Glassmorphism Card */}
      <div className="relative p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass overflow-hidden">
        {/* Animated Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-neon`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div>
            <p className="text-4xl font-bold text-white mb-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center text-sm text-cyber-neon-cyan font-medium">
                <TrendingUp className="w-4 h-4 mr-1 animate-pulse" />
                {trend}
              </div>
            )}
          </div>
        </div>
        
        {/* Corner Accent */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 blur-2xl rounded-full`}></div>
      </div>
    </motion.div>
  );

  const ExamCard = ({ exam, type = 'upcoming' }) => {
    const timeLeft = type === 'upcoming' ? getTimeUntilExam(exam.examDate) : null;
    const isUrgent = timeLeft === 'Today' || timeLeft === 'Tomorrow';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="relative group"
      >
        <div className="relative p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass overflow-hidden hover:shadow-neon transition-all duration-300">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-electric-purple opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                  {type === 'upcoming' && timeLeft && (
                    <motion.span
                      animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isUrgent 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-neon' 
                          : 'bg-cyber-cyan bg-opacity-20 text-cyber-neon-cyan border border-cyber-cyan border-opacity-30'
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {timeLeft}
                    </motion.span>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{exam.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
                    <BookOpen className="w-4 h-4 text-cyber-cyan" />
                    <span className="text-white">{exam.subject}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
                    <Timer className="w-4 h-4 text-cyber-purple" />
                    <span className="text-white">{exam.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
                    <BarChart3 className="w-4 h-4 text-cyber-electric-purple" />
                    <span className="text-white">{exam.totalMarks} pts</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-10">
              <div className="flex items-center text-sm text-gray-400">
                <CalendarDays className="w-4 h-4 mr-2 text-cyber-cyan" />
                <span className="text-white">{formatDate(exam.examDate)}</span>
              </div>
              
              <div className="flex gap-2">
                {type === 'upcoming' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white text-sm font-bold rounded-xl hover:shadow-neon transition-all"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Exam
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, count, isExpanded, onToggle, icon: Icon }) => (
    <motion.div
      className="flex items-center justify-between p-5 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 cursor-pointer hover:bg-opacity-10 transition-all shadow-glass"
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-purple">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="px-3 py-1 bg-cyber-purple bg-opacity-30 text-cyber-neon-cyan text-sm font-bold rounded-full border border-cyber-purple border-opacity-50">
          {count}
        </span>
      </div>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg className="w-6 h-6 text-cyber-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </motion.div>
  );

  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-midnight via-cyber-dark to-cyber-blue flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyber-neon-cyan shadow-cyan"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyber-purple animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const filteredUpcoming = getFilteredExams(upcomingExams);
  const filteredCompleted = getFilteredExams(completedExams);
  const userName = localStorage.getItem('userName') || 'Student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-midnight via-cyber-dark to-cyber-blue relative overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-20"></div>
        
        {/* Neural Connection Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#neuralGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </svg>

        {/* Glowing Orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyber-electric-purple opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyber-cyan opacity-10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-purple opacity-5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyber-neon-cyan rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Futuristic Header with Profile */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Avatar with Progress Ring */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-cyan p-1 shadow-glow">
                  <div className="w-full h-full rounded-full bg-cyber-dark flex items-center justify-center text-3xl font-bold text-white border-2 border-cyber-glass">
                    <User className="w-10 h-10 text-cyber-neon-cyan" />
                  </div>
                </div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 bg-gradient-to-r from-cyber-purple to-cyber-cyan rounded-full p-1.5 shadow-neon"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              
              <div>
                <h1 className="text-5xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon-cyan via-cyber-purple to-cyber-electric-purple animate-glow mb-2 tracking-wide">
                  {getGreeting()}, {userName}
                </h1>
                <p className="text-gray-300 mt-1 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyber-cyan animate-glow" />
                  <span>Ready to ace your exams?</span>
                </p>
              </div>
            </div>
            
            {/* Notifications Badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-4 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass hover:shadow-neon transition-all"
            >
              <Bell className="w-6 h-6 text-cyber-neon-cyan" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-cyber-purple to-cyber-electric-purple rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-cyber-dark animate-pulse">
                  {notifications.length}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Analytics Overview - Futuristic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Exams"
            value={stats.totalExams || 320}
            icon={BookOpen}
            gradient="from-blue-500 to-cyan-500"
            subtitle="All time"
            trend="+12% this month"
          />
          <StatCard
            title="Completed"
            value={stats.completedExams || 89}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-500"
            subtitle="This semester"
            trend="+8% this week"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore || 85}%`}
            icon={Trophy}
            gradient="from-cyber-purple to-cyber-electric-purple"
            subtitle="Overall performance"
            trend="+5% improvement"
          />
          <StatCard
            title="Upcoming"
            value={upcomingExams.length}
            icon={Calendar}
            gradient="from-orange-500 to-pink-500"
            subtitle="Next 30 days"
          />
        </div>

        {/* Performance Analytics & Leaderboard Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-purple">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
              </div>
              <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white bg-opacity-5">Last 6 Months</span>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 14, 39, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Top Performers</h3>
            </div>

            <div className="space-y-3">
              {leaderboard.map((student, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    student.isCurrentUser
                      ? 'bg-gradient-to-r from-cyber-cyan to-cyber-purple shadow-neon'
                      : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-white bg-opacity-10 text-gray-300'
                  }`}>
                    {student.rank}
                  </div>
                  <div className="text-2xl">{student.avatar}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{student.name}</p>
                  </div>
                  <div className="text-cyber-neon-cyan font-bold">{student.score}%</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions with Holographic Start Exam Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Play, label: 'Start Exam', gradient: 'from-green-500 to-emerald-500', isHolographic: true },
            { icon: Eye, label: 'View Results', gradient: 'from-blue-500 to-cyan-500', isHolographic: false },
            { icon: FileText, label: 'Study Resources', gradient: 'from-purple-500 to-pink-500', isHolographic: false },
            { icon: Brain, label: 'AI Assistant', gradient: 'from-orange-500 to-red-500', isHolographic: false }
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 hover:shadow-neon transition-all group overflow-hidden ${
                action.isHolographic ? 'shadow-glow' : ''
              }`}
            >
              {action.isHolographic && (
                <>
                  <div className="absolute inset-0 bg-holographic-gradient bg-holographic animate-holographic opacity-20"></div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                </>
              )}
              <div className={`relative z-10 w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform ${
                action.isHolographic ? 'animate-pulse' : ''
              }`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="relative z-10 text-white font-semibold text-sm text-center">{action.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* AI Assistant & Skills Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Study Assistant Widget */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 relative group"
          >
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-cyber-purple/20 to-cyber-cyan/20 backdrop-blur-xl border border-white border-opacity-10 shadow-neon overflow-hidden">
              {/* Animated Scan Line */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50"
                  animate={{ y: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-purple animate-holographic bg-holographic bg-holographic-gradient">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-cyber-dark"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      AI Study Assistant
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                        ACTIVE
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">Powered by Neural Learning Engine</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    { icon: Sparkles, text: 'Personalized study plan generated for upcoming Math exam', type: 'success' },
                    { icon: Target, text: 'Focus on Chapter 5: Calculus - 78% proficiency detected', type: 'warning' },
                    { icon: Zap, text: 'Quick revision recommended: 15 minutes daily', type: 'info' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-xl bg-white bg-opacity-5 border-l-2 ${
                        item.type === 'success' ? 'border-green-400' :
                        item.type === 'warning' ? 'border-yellow-400' :
                        'border-cyber-cyan'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 mt-0.5 ${
                        item.type === 'success' ? 'text-green-400' :
                        item.type === 'warning' ? 'text-yellow-400' :
                        'text-cyber-cyan'
                      } animate-pulse`} />
                      <p className="text-sm text-gray-300 flex-1">{item.text}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white font-bold rounded-xl shadow-neon hover:shadow-glow transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-holographic-gradient bg-holographic animate-holographic opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <MessageSquare className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Chat with AI Assistant</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Skills Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyber-electric-purple to-pink-500">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Skills Analysis</h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar 
                    name="Your Scores" 
                    dataKey="score" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 14, 39, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter - Futuristic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyber-cyan w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Search exams by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:border-transparent transition-all backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyber-purple w-5 h-5 z-10 pointer-events-none" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple focus:border-transparent appearance-none backdrop-blur-sm min-w-[200px]"
              >
                <option value="all" className="bg-cyber-dark">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject} value={subject} className="bg-cyber-dark">{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Exams Section */}
        <div className="mb-8">
          <SectionHeader
            title="Upcoming Exams"
            count={filteredUpcoming.length}
            isExpanded={showUpcoming}
            onToggle={() => setShowUpcoming(!showUpcoming)}
            icon={AlertCircle}
          />
          
          <AnimatePresence>
            {showUpcoming && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                {filteredUpcoming.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredUpcoming.map((exam) => (
                      <ExamCard key={exam._id || exam.id} exam={exam} type="upcoming" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10">
                    <Target className="w-16 h-16 text-cyber-cyan mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">No upcoming exams</h3>
                    <p className="text-gray-400">
                      {searchTerm || subjectFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'You\'re all caught up! No exams scheduled at the moment.'
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Completed Exams Section */}
        <div className="mb-8">
          <SectionHeader
            title="Completed Exams"
            count={filteredCompleted.length}
            isExpanded={showCompleted}
            onToggle={() => setShowCompleted(!showCompleted)}
            icon={CheckCircle}
          />
          
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                {filteredCompleted.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCompleted.map((exam) => (
                      <ExamCard key={exam._id || exam.id} exam={exam} type="completed" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10">
                    <BookOpen className="w-16 h-16 text-cyber-purple mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">No completed exams</h3>
                    <p className="text-gray-400">
                      {searchTerm || subjectFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'You haven\'t completed any exams yet.'
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
