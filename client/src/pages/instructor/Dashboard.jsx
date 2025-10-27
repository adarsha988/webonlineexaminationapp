import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, Clock, Plus, Database, Eye, Edit, CheckCircle, Award, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const StatCard = ({ icon: Icon, title, value, iconColor }) => (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ExamCard = ({ exam }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'published':
        case 'upcoming':
          return 'bg-green-100 text-green-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        case 'draft':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
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
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
              <p className="text-sm text-muted-foreground">
                {exam.subject} • {exam.questionsCount || 0} Questions • {exam.totalMarks || 0} Marks
              </p>
              {exam.scheduledDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled: {new Date(exam.scheduledDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
              {getStatusLabel(exam.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{exam.duration || 0}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{exam.attemptsCount || 0}</p>
              <p className="text-xs text-muted-foreground">Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {exam.averageScore ? `${exam.averageScore}%` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1" data-testid={`button-view-results-${exam.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Results
            </Button>
            <Link to={`/instructor/exam/${exam.id}/edit`}>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Exam
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, description, action, variant = "outline" }) => (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <Button variant={variant} size="sm" className="w-full" onClick={action}>
          <Icon className="h-4 w-4 mr-2" />
          {title}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage your examinations and track student progress</p>
          </div>
          <div className="flex gap-2">
            <Link to="/instructor/exams">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View All Exams
              </Button>
            </Link>
            <Link to="/instructor/exam-creation">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            title="Total Exams"
            value={stats.totalExams}
            iconColor="text-primary"
          />
          <StatCard
            icon={Users}
            title="Total Attempts"
            value={stats.totalAttempts}
            iconColor="text-secondary"
          />
          <StatCard
            icon={TrendingUp}
            title="Avg Score"
            value={`${stats.avgScore}%`}
            iconColor="text-accent"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingGrades}
            iconColor="text-destructive"
          />
        </div>

        {/* Quick Actions */}
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/instructor/exam-creation">
              <QuickActionCard
                icon={Plus}
                title="New Exam"
                description="Start creating a new examination"
                action={() => {}}
                variant="default"
              />
            </Link>
            
            <Link to="/instructor/question-bank">
              <QuickActionCard
                icon={Database}
                title="View Bank"
                description="Manage your question library"
                action={() => {}}
              />
            </Link>
          </div>
        </div>

        {/* Completed Exams Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Completed Exams
              </h2>
              <p className="text-muted-foreground mt-1">Review student submissions and send reports</p>
            </div>
            <Link to="/instructor/completed-exams">
              <Button variant="outline">
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
    </InstructorLayout>
  );
};

export default InstructorDashboard;
