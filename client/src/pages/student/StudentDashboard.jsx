import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
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
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { studentExamAPI, studentNotificationsAPI } from '@/api/studentExams';
import NotificationDropdown from '@/components/student/NotificationDropdown';
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
    console.log('📍 StudentDashboard mounted/updated:', { 
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
      console.log('🔄 Fetching dashboard data for student:', user?._id);
      setLoading(true);
      const studentId = user._id || user.id;
      console.log('📊 Student ID:', studentId);

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
          return { data: [] };
        })
      ]);

      // API responses received successfully

      console.log('📋 Dashboard data received:', {
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
        console.log('📊 Analytics data stored:', analyticsData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      console.log('✅ Dashboard loading complete');
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await studentExamAPI.startExam(examId, user._id);
      if (response.success) {
        navigate(`/student/exam/${examId}`);
        toast({
          title: "Exam Started",
          description: "Good luck with your exam!",
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

  const handleViewResult = (examId) => {
    navigate(`/student/exam/${examId}/result`);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await studentNotificationsAPI.markAsRead(user._id || user.id, notificationId);
      // Refresh notifications after marking as read
      const notificationsResponse = await studentNotificationsAPI.getNotifications(user._id || user.id, {
        page: 1,
        limit: 50,
        unreadOnly: false
      });
      
      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data);
        setUnreadCount(notificationsResponse.unreadCount);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
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

  console.log('🎨 StudentDashboard render:', { loading, user: !!user, upcomingExams: upcomingExams.length });

  if (!user) {
    console.log('❌ No user found, showing error');
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

  if (loading) {
    console.log('📊 Showing loading state');
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your exams today.
              </p>
            </div>
            <NotificationDropdown 
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>

          {/* Dashboard Content */}
          <Tabs defaultValue="exams" className="space-y-6">
            <TabsList>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

          <TabsContent value="exams" className="space-y-6">
            {/* Ongoing Exams */}
            {ongoingExams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Ongoing Exams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ongoingExams.map((exam) => (
                    <Card key={exam._id} className="border-yellow-200 bg-yellow-50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{exam.title}</CardTitle>
                            <CardDescription>{exam.subject}</CardDescription>
                          </div>
                          <Badge variant="default" className="bg-yellow-500">
                            In Progress
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            {formatTimeRemaining(exam.timeRemaining)}
                          </div>
                          <Button 
                            onClick={() => handleResumeExam(exam._id)}
                            className="w-full"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume Exam
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Upcoming Exams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming Exams
              </h2>
              {upcomingExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingExams.map((exam) => (
                    <ExamCard
                      key={exam._id}
                      exam={exam}
                      onStart={handleStartExam}
                      type="upcoming"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming exams</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Recent Completed Exams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recent Results
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student/exams/completed')}
                >
                  View All
                </Button>
              </div>
              {completedExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedExams.map((exam) => (
                    <ExamCard
                      key={exam._id}
                      exam={exam}
                      onViewResult={handleViewResult}
                      type="completed"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed exams yet</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>


          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/student/notifications')}
                >
                  View All
                </Button>
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Card key={notification._id} className={!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
