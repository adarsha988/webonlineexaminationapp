import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CalendarDays, 
  Timer, 
  Users, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Activity,
  TrendingUp,
  Zap,
  Award,
  Video,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Brain,
  Monitor,
  Target,
  FileText,
  Settings
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ExamCreationForm from './ExamCreationForm';

const InstructorDashboard = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalExams: 0,
    activeToday: 0,
    completedExams: 0,
    upcomingExams: 0,
    totalStudents: 0,
    averageScore: 0
  });

  // Live Monitoring Data
  const [liveMonitoring] = useState([
    { id: 1, student: 'Emily Chen', exam: 'Data Structures Final', status: 'active', alerts: 0, progress: 75, avatar: '👩‍🎓' },
    { id: 2, student: 'Michael Kim', exam: 'Algorithms Quiz', status: 'active', alerts: 2, progress: 45, avatar: '👨‍🎓' },
    { id: 3, student: 'Sarah Johnson', exam: 'Database Midterm', status: 'active', alerts: 0, progress: 90, avatar: '👩‍💼' },
    { id: 4, student: 'David Lee', exam: 'Web Development Test', status: 'active', alerts: 1, progress: 60, avatar: '👨‍💻' }
  ]);

  // Student Performance Heatmap Data
  const [heatmapData] = useState([
    { subject: 'Math', week1: 85, week2: 88, week3: 90, week4: 87 },
    { subject: 'Physics', week1: 78, week2: 82, week3: 85, week4: 89 },
    { subject: 'Chemistry', week1: 92, week2: 90, week3: 88, week4: 91 },
    { subject: 'Biology', week1: 80, week2: 85, week3: 87, week4: 90 },
    { subject: 'English', week1: 88, week2: 90, week3: 92, week4: 94 }
  ]);

  // Participation Analytics
  const [participationData] = useState([
    { day: 'Mon', students: 45 },
    { day: 'Tue', students: 52 },
    { day: 'Wed', students: 48 },
    { day: 'Thu', students: 55 },
    { day: 'Fri', students: 42 },
    { day: 'Sat', students: 28 },
    { day: 'Sun', students: 15 }
  ]);

  useEffect(() => {
    fetchExams();
    fetchStats();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, searchTerm, statusFilter]);

  const fetchExams = async () => {
    try {
      const instructorId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/exams/instructor/${instructorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const instructorId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/instructor/stats/${instructorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    setFilteredExams(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { gradient: 'from-gray-500 to-gray-700', icon: Edit },
      published: { gradient: 'from-blue-500 to-cyan-500', icon: CheckCircle },
      ongoing: { gradient: 'from-green-500 to-emerald-500', icon: Clock },
      completed: { gradient: 'from-purple-500 to-pink-500', icon: CheckCircle },
      upcoming: { gradient: 'from-yellow-500 to-orange-500', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${config.gradient} text-white shadow-neon`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  const handleExamCreated = (newExam) => {
    setExams(prev => [newExam, ...prev]);
    setShowCreateForm(false);
    fetchStats();
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div className="relative p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass overflow-hidden">
        {/* Animated Glow */}
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
                +{trend}% from last month
              </div>
            )}
          </div>
        </div>
        
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 blur-2xl rounded-full`}></div>
      </div>
    </motion.div>
  );

  const ExamCard = ({ exam }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative group"
    >
      <div className="relative p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass hover:shadow-neon transition-all duration-300 overflow-hidden">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-electric-purple opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                {getStatusBadge(exam.status)}
              </div>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{exam.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
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
            
            <div className="flex gap-2 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-xl bg-white bg-opacity-10 text-cyber-cyan hover:bg-opacity-20 transition-all">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-xl bg-white bg-opacity-10 text-cyber-neon-cyan hover:bg-opacity-20 transition-all">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-xl bg-white bg-opacity-10 text-red-400 hover:bg-opacity-20 transition-all">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-10">
            <div className="flex items-center text-sm text-gray-400">
              <CalendarDays className="w-4 h-4 mr-2 text-cyber-cyan" />
              <span className="text-white">{exam.examDate ? formatDate(exam.examDate) : 'Not scheduled'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-purple bg-opacity-20">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{exam.assignedStudents?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const instructorName = localStorage.getItem('userName') || 'Instructor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {instructorName}!
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Manage your exams and monitor student progress.
                </p>
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            
            {/* Create Exam Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Exam
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview - Futuristic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Exams"
            value={stats.totalExams || 48}
            icon={BookOpen}
            gradient="from-blue-500 to-cyan-500"
            subtitle="All courses"
            trend={12}
          />
          <StatCard
            title="Active Now"
            value={stats.activeToday || 12}
            icon={Activity}
            gradient="from-green-500 to-emerald-500"
            subtitle="Live exams"
            trend={8}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents || 285}
            icon={Users}
            gradient="from-cyber-purple to-cyber-electric-purple"
            subtitle="Enrolled"
            trend={15}
          />
          <StatCard
            title="Avg Score"
            value={`${stats.averageScore || 87}%`}
            icon={Award}
            gradient="from-orange-500 to-pink-500"
            subtitle="Overall"
            trend={5}
          />
        </div>

        {/* Live Monitoring & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live Monitoring Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 relative">
                  <Video className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-cyber-dark"></span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Live Proctoring Monitor</h3>
                  <p className="text-xs text-gray-400">Real-time AI-powered surveillance</p>
                </div>
              </div>
              <span className="text-xs text-green-400 px-3 py-1 rounded-full bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {liveMonitoring.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {liveMonitoring.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10 hover:bg-opacity-10 transition-all"
                >
                  <div className="text-3xl">{student.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{student.student}</h4>
                      {student.alerts > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 bg-opacity-20 text-red-400 text-xs font-bold rounded-full border border-red-500 border-opacity-30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {student.alerts}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{student.exam}</p>
                    <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${student.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full ${student.progress > 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : student.progress > 50 ? 'bg-gradient-to-r from-cyber-cyan to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyber-neon-cyan font-bold">{student.progress}%</p>
                    <p className="text-xs text-gray-400">Progress</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Student Participation Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-purple">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Participation</h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 14, 39, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient${index})`} />
                    ))}
                  </Bar>
                  <defs>
                    {participationData.map((entry, index) => (
                      <linearGradient key={`gradient${index}`} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Performance Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Student Performance Heatmap</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white border-opacity-10">
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Subject</th>
                  <th className="text-center text-gray-400 text-sm font-medium py-3 px-4">Week 1</th>
                  <th className="text-center text-gray-400 text-sm font-medium py-3 px-4">Week 2</th>
                  <th className="text-center text-gray-400 text-sm font-medium py-3 px-4">Week 3</th>
                  <th className="text-center text-gray-400 text-sm font-medium py-3 px-4">Week 4</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-white border-opacity-5"
                  >
                    <td className="text-white font-semibold py-4 px-4">{row.subject}</td>
                    {['week1', 'week2', 'week3', 'week4'].map((week, weekIndex) => {
                      const score = row[week];
                      const getHeatColor = (score) => {
                        if (score >= 90) return 'from-green-500 to-emerald-500';
                        if (score >= 80) return 'from-cyan-500 to-blue-500';
                        if (score >= 70) return 'from-yellow-500 to-orange-500';
                        return 'from-red-500 to-pink-500';
                      };
                      return (
                        <td key={weekIndex} className="text-center py-4 px-4">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${getHeatColor(score)} shadow-neon`}>
                            <span className="text-white font-bold text-lg">{score}</span>
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Exam Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 shadow-glass mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyber-purple to-cyber-electric-purple">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Exam Management</h2>
          </div>

          {/* Search and Filter - Futuristic */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyber-purple focus:border-transparent appearance-none backdrop-blur-sm min-w-[200px]"
              >
                <option value="all" className="bg-cyber-dark">All Status</option>
                <option value="draft" className="bg-cyber-dark">Draft</option>
                <option value="published" className="bg-cyber-dark">Published</option>
                <option value="ongoing" className="bg-cyber-dark">Ongoing</option>
                <option value="completed" className="bg-cyber-dark">Completed</option>
                <option value="upcoming" className="bg-cyber-dark">Upcoming</option>
              </select>
            </div>
          </div>

          {/* Exams Grid */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam._id || exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10">
              <BookOpen className="w-16 h-16 text-cyber-purple mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No exams found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first exam'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white font-bold rounded-2xl shadow-neon hover:shadow-glow transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Exam
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Exam Creation Modal */}
      {showCreateForm && (
        <ExamCreationForm
          onClose={() => setShowCreateForm(false)}
          onExamCreated={handleExamCreated}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;
