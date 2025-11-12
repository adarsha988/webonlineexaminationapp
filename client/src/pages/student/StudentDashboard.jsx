import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Bell, 
  TrendingUp, 
  Calendar,
  Play,
  Eye,
  Award,
  Target,
  BarChart3,
  Sparkles,
  Zap,
  Star,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { studentExamAPI, studentNotificationsAPI, studentAnalyticsAPI } from '@/api/studentExams';
import ExamCard from '@/components/student/ExamCard';
import StudentLayout from '@/layouts/StudentLayout';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [ongoingExams, setOngoingExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Show success message if coming from exam submission
  useEffect(() => {
    if (location.state?.message) {
      console.log('📨 Dashboard received message:', location.state.message);
      toast({
        title: "Success",
        description: location.state.message,
        variant: "default",
      });
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  useEffect(() => {
    console.log('StudentDashboard mounted/updated:', { 
      userId: user?._id, 
      loading,
      locationKey: location.key 
    });
    
    if (user && user._id) {
      fetchDashboardData();
    } else {
      console.warn('⚠️ User not available yet, waiting...');
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (!user) {
          console.error('❌ User still not available after 5 seconds');
          setLoading(false);
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [user, location.key]); // Re-fetch when location changes (navigation)

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data for student:', user?._id);
      setLoading(true);
      const studentId = user._id || user.id;
      console.log('Student ID:', studentId);

      // Fetch all dashboard data in parallel
      const [
        upcomingRes,
        ongoingRes,
        completedRes,
        notificationsRes
      ] = await Promise.all([
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
        studentNotificationsAPI.getNotifications(studentId, 1, 5).catch(err => {
          console.error('❌ NOTIFICATIONS ERROR:', err);
          return { data: [], unreadCount: 0 };
        })
      ]);

      // API responses received successfully

      console.log('Dashboard data received:', {
        upcoming: upcomingRes.data?.length || 0,
        ongoing: ongoingRes.data?.length || 0,
        completed: completedRes.data?.length || 0,
        notifications: notificationsRes.data?.length || 0
      });

      setUpcomingExams(upcomingRes.data || []);
      setOngoingExams(ongoingRes.data || []);
      setCompletedExams(completedRes.data || []);
      setNotifications(notificationsRes.data || []);
      setUnreadCount(notificationsRes.unreadCount || 0);

      // Store analytics data for future use
      if (completedRes.data && completedRes.data.length > 0) {
        const analyticsData = {
          completedExams: completedRes.data,
          totalExams: completedRes.data.length,
          averageScore: completedRes.data.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / completedRes.data.length,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('studentAnalytics', JSON.stringify(analyticsData));
        console.log('Analytics data stored:', analyticsData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      console.log('Dashboard loading complete');
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await studentExamAPI.startExam(examId, user._id);
      if (response.success) {
        // Route to verification page first - must grant camera/mic before exam
        navigate(`/student/exam-verification/${examId}`);
        toast({
          title: "Starting Exam",
          description: "Please verify your camera and microphone first",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start exam",
        variant: "destructive",
      });
    }
  };

  const handleResumeExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await studentNotificationsAPI.markAsRead(user._id, notificationId);
      // Update local state to reflect the change
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast({
        title: "Notification marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleViewNotification = (notification) => {
    // Mark as read when viewing
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Check if notification is about exam results
    if (notification.type === 'exam_result' || notification.message.toLowerCase().includes('result')) {
      // Extract exam ID from notification metadata or message
      const examId = notification.metadata?.examId || notification.examId;
      if (examId) {
        navigate(`/student/exam/${examId}/result`);
      } else {
        // Fallback to general results page
        navigate('/student/exams/completed');
      }
    } else if (notification.type === 'exam_reminder') {
      // Navigate to exam if it's a reminder
      const examId = notification.metadata?.examId || notification.examId;
      if (examId) {
        navigate(`/student/exam/${examId}`);
      }
    } else {
      // For other notifications, just mark as read (already done above)
      toast({
        title: "Notification viewed",
        description: notification.title,
      });
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m remaining`;
  };

  const getExamStatusBadge = (exam) => {
    const now = new Date();
    const scheduledDate = new Date(exam.scheduledDate);
    const endDate = new Date(exam.endDate);

    if (exam.studentStatus === 'in_progress') {
      return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>;
    }
    if (exam.studentStatus === 'submitted') {
      return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    }
    if (scheduledDate > now) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    if (endDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default" className="bg-blue-500">Available</Badge>;
  };

  console.log('StudentDashboard render:', { loading, user: !!user, upcomingExams: upcomingExams.length });

  if (!user) {
    console.log('No user found, showing error');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access the student dashboard.</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalExams = upcomingExams.length + ongoingExams.length + completedExams.length;
  const averageScore = completedExams.length > 0 
    ? Math.round(completedExams.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / completedExams.length)
    : 0;

  if (loading) {
    console.log('Showing loading state');
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse border-none shadow-xl">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Animated Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  Here's what's happening with your exams today.
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
          </motion.div>

          {/* Animated Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
          >
            {/* Total Exams Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="h-8 w-8 opacity-80" />
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm opacity-90 mb-1"
                  >
                    Total Exams
                  </motion.p>
                  <motion.p 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                    className="text-4xl font-bold"
                  >
                    {totalExams}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Completed Exams Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-none shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
                <motion.div
                  className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="h-8 w-8 opacity-80" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Star className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <p className="text-sm opacity-90 mb-1">Completed</p>
                  <p className="text-4xl font-bold">{completedExams.length}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Average Score Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative">
                <motion.div
                  className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-8 w-8 opacity-80" />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <p className="text-sm opacity-90 mb-1">Average Score</p>
                  <p className="text-4xl font-bold">{averageScore}%</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Exams Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-none shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
                <motion.div
                  className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-8 w-8 opacity-80" />
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <p className="text-sm opacity-90 mb-1">Upcoming</p>
                  <p className="text-4xl font-bold">{upcomingExams.length}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Dashboard Content */}
          <Tabs defaultValue="exams" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
                <TabsTrigger value="exams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">Exams</TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Notifications</TabsTrigger>
              </TabsList>
            </motion.div>

          <TabsContent value="exams" className="space-y-6 sm:space-y-8">
            {/* Ongoing Exams with Pulse Animation */}
            <AnimatePresence>
              {ongoingExams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative"
                    >
                      <Clock className="h-6 w-6 text-yellow-500" />
                      <motion.div
                        className="absolute inset-0 bg-yellow-500 rounded-full blur-md"
                        animate={{ opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900">Ongoing Exams</h2>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </motion.div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {ongoingExams.map((exam, index) => (
                      <motion.div
                        key={exam._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -8 }}
                      >
                        <Card className="border-none shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden relative group">
                          <motion.div
                            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                            animate={{ opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                          <CardHeader className="pb-3 relative z-10">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-bold text-gray-900">{exam.title}</CardTitle>
                                <CardDescription className="text-gray-600 mt-1">{exam.subject}</CardDescription>
                              </div>
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none shadow-lg">
                                  Active
                                </Badge>
                              </motion.div>
                            </div>
                          </CardHeader>
                          <CardContent className="relative z-10">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                {formatTimeRemaining(exam.timeRemaining)}
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  onClick={() => handleResumeExam(exam._id)}
                                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume Exam
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upcoming Exams with Animated Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <motion.div
                    className="absolute inset-0 bg-blue-500 rounded-full blur-md"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Exams</h2>
                <Badge className="bg-blue-500 text-white">{upcomingExams.length}</Badge>
              </motion.div>
              {upcomingExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {upcomingExams.map((exam, index) => (
                    <motion.div
                      key={exam._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, type: "spring" }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <ExamCard
                        exam={exam}
                        onStart={handleStartExam}
                        type="upcoming"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <Card className="border-none shadow-lg">
                    <CardContent className="text-center py-12">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-gray-500 font-medium">No upcoming exams</p>
                      <p className="text-gray-400 text-sm mt-2">Check back later for new exams</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

          </TabsContent>


          <TabsContent value="notifications" className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <motion.div
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: [0, -15, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <Bell className="h-6 w-6 text-purple-500" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs font-bold">{unreadCount}</span>
                      </motion.div>
                    )}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">{ unreadCount} New</Badge>
                    </motion.div>
                  )}
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/student/notifications')}
                    className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              
              <AnimatePresence>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <Card className={`border-none shadow-lg overflow-hidden relative ${
                          !notification.isRead 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                            : 'bg-white'
                        }`}>
                          {!notification.isRead && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
                              animate={{ opacity: [0.1, 0.2, 0.1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <CardContent className="p-4 sm:p-5 relative z-10">
                            <div className="flex items-start gap-4">
                              <motion.div
                                animate={!notification.isRead ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="shrink-0 mt-1"
                              >
                                {!notification.isRead ? (
                                  <div className="h-3 w-3 bg-blue-500 rounded-full shadow-lg" />
                                ) : (
                                  <div className="h-3 w-3 bg-gray-300 rounded-full" />
                                )}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewNotification(notification)}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full font-medium transition-colors flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </motion.button>
                                {!notification.isRead && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full font-medium transition-colors"
                                  >
                                    Mark Read
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Card className="border-none shadow-lg">
                      <CardContent className="text-center py-16">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Bell className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-500 font-medium text-lg">No notifications</p>
                        <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;