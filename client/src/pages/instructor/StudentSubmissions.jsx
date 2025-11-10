import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  CheckCircle, 
  Clock, 
  Eye,
  FileText,
  Award,
  Users,
  Download,
  RefreshCw,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import InstructorLayout from '../../layouts/InstructorLayout';
import api from '../../api/axios';

const StudentSubmissions = () => {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  
  console.log('🔍 StudentSubmissions Component Loaded');
  console.log('📝 Exam ID from URL:', examId);
  console.log('👤 User:', user);
  
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (examId) {
      fetchExamAndSubmissions();
    }
  }, [examId, refreshKey]);

  // Refresh data when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Page focused, refreshing data...');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchExamAndSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch real data from API
      const response = await api.get(`/api/instructor/grading/exam/${examId}/submissions`);
      
      console.log('📊 Exam submissions response:', response);
      
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.length > 0) {
          // Use real data from database
          setExam(response.data.data[0].examId);
          setSubmissions(response.data.data);
          console.log('✅ Loaded', response.data.data.length, 'submissions from database');
        } else {
          // No submissions found
          console.log('⚠️ No submissions found for this exam');
          setExam(null);
          setSubmissions([]);
          toast({
            title: "No Submissions",
            description: "No student submissions found for this exam yet.",
            variant: "default"
          });
        }
      } else {
        // API error
        console.error('❌ API returned unsuccessful response');
        setError('Failed to load submissions');
        toast({
          title: "Error",
          description: "Failed to load submissions. Please try again.",
          variant: "destructive"
        });
      }
      
    } catch (err) {
      console.error('❌ Error fetching exam submissions:', err);
      setError(err.message || 'Failed to load submissions');
      setExam(null);
      setSubmissions([]);
      toast({
        title: "Error",
        description: "Failed to connect to server. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  const getGradingStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Graded</Badge>;
      case 'partial':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getScoreColor = (score, totalMarks) => {
    if (!score) return 'text-gray-500';
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportResults = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export Started",
      description: "Exam results are being exported to CSV format.",
    });
  };

  const SubmissionCard = ({ submission }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{submission.studentId?.name || 'Unknown Student'}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {submission.studentId?.email || 'N/A'}
              </p>
            </div>
          </div>
          {getGradingStatusBadge(submission.gradingStatus)}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Score</p>
            <p className={`text-lg font-semibold ${getScoreColor(submission.score, submission.totalMarks || submission.maxScore || submission.examId?.totalMarks)}`}>
              {submission.score !== undefined && submission.score !== null ? 
                `${submission.score}/${submission.totalMarks || submission.maxScore || submission.examId?.totalMarks || 0}` : 
                'Not graded'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Percentage</p>
            <p className="text-lg font-semibold text-gray-900">{Math.round(submission.percentage || 0)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Violations</p>
            <p className={`text-lg font-semibold ${(submission.violations?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {submission.violations?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted At</p>
            <p className="text-sm text-gray-900">{formatDate(submission.submittedAt)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1"
            onClick={() => navigate(`/instructor/grading/${submission._id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {submission.gradingStatus === 'partial' ? 'Grade' : 'View'}
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/instructor/proctoring-report/${submission._id}`)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  );

  if (!examId) {
    return (
      <InstructorLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Exam</h2>
          <p className="text-gray-600 mb-4">The exam ID is missing or invalid.</p>
          <Link to="/instructor/completed-exams">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Completed Exams
            </Button>
          </Link>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link to="/instructor/completed-exams">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Completed Exams
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {exam?.title || 'Loading...'}
            </h1>
            <p className="text-gray-600 mt-1">Student submissions and grading</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setRefreshKey(prev => prev + 1)} 
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Exam Info */}
        {exam && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold text-gray-900">{exam.subject}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-semibold text-gray-900">{submissions.length}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="font-semibold text-gray-900">{exam.totalMarks || 100}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{exam.duration || 0} mins</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Graded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.filter(s => s.gradingStatus === 'complete').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.filter(s => s.gradingStatus === 'partial').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Submissions</h2>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Submissions</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchExamAndSubmissions}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : submissions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions</h3>
                <p className="text-gray-600">No student submissions found for this exam.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};

export default StudentSubmissions;
