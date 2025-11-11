import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, Clock, Plus, Database, Eye, Edit, CheckCircle, Award, Send, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import InstructorLayout from '../../layouts/InstructorLayout';
import { instructorExamAPI } from '../../api/instructorExams';

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalExams: 0,
      totalAttempts: 0,
      avgScore: 0,
      pendingGrades: 0
    },
    recentExams: []
  });
  const [completedExams, setCompletedExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
      if (!user?._id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await instructorExamAPI.getDashboardStats(user._id);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCompletedExams = async () => {
      if (!user?._id) return;
      
      try {
        setLoadingCompleted(true);
        const response = await fetch(`/api/instructor/grading/completed-exams/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Completed Exams API Response:', data);
          console.log('📊 First exam group:', data.data?.[0]);
          setCompletedExams(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching completed exams:', err);
      } finally {
        setLoadingCompleted(false);
      }
    };

    useEffect(() => {
      fetchDashboardData();
      fetchCompletedExams();
    }, [user, location.key]); // Re-fetch when location changes (navigation)

  const { stats, recentExams } = dashboardData;

  const StatCard = ({ icon: Icon, title, value, iconColor, gradient }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <motion.div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2"
              >
                {title}
              </motion.p>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
              >
                {value}
              </motion.p>
            </div>
            <motion.div 
              className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="h-8 w-8 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ExamCard = ({ exam }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'published':
        case 'upcoming':
          return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200';
        case 'completed':
          return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200';
        case 'draft':
          return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200';
        default:
          return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200';
      }
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case 'published':
          return 'Published';
        case 'upcoming':
          return 'Upcoming';
        case 'completed':
          return 'Completed';
        case 'draft':
          return 'Draft';
        default:
          return status;
      }
    };

    return (
      <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-blue-700 transition-all">{exam.title}</h3>
              <p className="text-sm text-gray-600 font-medium mt-2">
                📚 {exam.subject} • {exam.questionsCount || 0} Questions • {exam.totalMarks || 0} Marks
              </p>
              {exam.scheduledDate && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(exam.scheduledDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(exam.status)}`}>
              {getStatusLabel(exam.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{exam.duration || 0}</p>
              <p className="text-xs text-gray-600 font-semibold mt-1">Minutes</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{exam.attemptsCount || 0}</p>
              <p className="text-xs text-gray-600 font-semibold mt-1">Attempts</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {exam.averageScore ? `${exam.averageScore}%` : '-'}
              </p>
              <p className="text-xs text-gray-600 font-semibold mt-1">Avg Score</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button size="sm" className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-300" data-testid={`button-view-results-${exam.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Results
            </Button>
            <Link to={`/instructor/exam/${exam.id}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, description, action, variant = "outline", gradient }) => (
    <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-gray-50 overflow-hidden cursor-pointer">
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <InstructorLayout>
      {/* Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
        {/* Animated Mesh Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Animated Header with Enhanced Texture */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            {/* Background Texture Card */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl blur-3xl"></div>
            <motion.div
              className="relative bg-gradient-to-br from-white/80 via-indigo-50/40 to-purple-50/60 backdrop-blur-sm rounded-2xl border-2 border-indigo-100/50 shadow-2xl overflow-hidden p-6 sm:p-8"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
              
              <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        className="w-2 h-12 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        animate={{ height: [48, 56, 48] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome back, {user?.name}! 🎓
                      </h1>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium ml-5">
                      ✨ Manage your examinations and track student progress
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
                
                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 items-center">
                  <Link to="/instructor/exams">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="relative overflow-hidden border-2 border-indigo-300 hover:border-indigo-500 bg-white/80 backdrop-blur-sm hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/0 via-purple-100/50 to-indigo-100/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Eye className="h-4 w-4 mr-2 relative z-10" />
                        <span className="relative z-10 font-semibold">View All Exams</span>
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/instructor/exam-creation">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-indigo-300 hover:shadow-2xl hover:shadow-purple-400 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm group">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Plus className="h-4 w-4 mr-2 relative z-10" />
                        <span className="relative z-10 font-bold">Create Exam</span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={FileText}
              title="Total Exams"
              value={stats.totalExams}
              gradient="from-indigo-500 to-blue-600"
            />
            <StatCard
              icon={Users}
              title="Total Attempts"
              value={stats.totalAttempts}
              gradient="from-purple-500 to-pink-600"
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Score"
              value={`${stats.avgScore}%`}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={Clock}
              title="Pending"
              value={stats.pendingGrades}
              gradient="from-orange-500 to-red-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link to="/instructor/exam-creation">
                <QuickActionCard
                  icon={Plus}
                  title="New Exam"
                  description="Start creating a new examination"
                  action={() => {}}
                  gradient="from-indigo-500 to-blue-600"
                />
              </Link>
              
              <Link to="/instructor/question-bank">
                <QuickActionCard
                  icon={Database}
                  title="Question Bank"
                  description="Manage your question library"
                  action={() => {}}
                  gradient="from-purple-500 to-pink-600"
                />
              </Link>
            </div>
          </div>

          {/* Completed Exams Section */}
          <div className="mt-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  Completed Exams
                </h2>
                <p className="text-gray-600 text-lg mt-2 ml-14">Review student submissions and send reports</p>
              </div>
              <Link to="/instructor/completed-exams">
                <Button variant="outline" className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  View All Completed
                </Button>
              </Link>
            </div>

          {loadingCompleted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedExams.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Exams Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Once students complete your exams, they will appear here for review and grading.
                </p>
                <Link to="/instructor/exam-creation">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Exam
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedExams.map((examGroup) => (
                <Card key={examGroup.exam._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {examGroup.exam.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{examGroup.exam.subject}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{examGroup.stats.total}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{examGroup.stats.fullyGraded}</p>
                        <p className="text-xs text-muted-foreground">Graded</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{examGroup.stats.averageScore}%</p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                    </div>

                    {examGroup.stats.pendingGrading > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {examGroup.stats.pendingGrading} submission{examGroup.stats.pendingGrading > 1 ? 's' : ''} pending grading
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => {
                        console.log('🔍 Clicked View Students');
                        console.log('📝 Exam Group:', examGroup);
                        console.log('🆔 Exam ID:', examGroup.exam?._id);
                        const examId = examGroup.exam?._id;
                        if (examId) {
                          navigate(`/instructor/completed-exams/${examId}`);
                        } else {
                          console.error('❌ Exam ID is undefined!');
                        }
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Students ({examGroup.stats.total})
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;
