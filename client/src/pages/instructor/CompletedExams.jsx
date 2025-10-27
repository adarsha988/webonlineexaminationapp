import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import { completedExamsAPI } from '../../api/completedExams';
import { useToast } from '@/hooks/useToast';

const CompletedExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompletedExams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?._id) {
          throw new Error('User not authenticated');
        }

        const response = await completedExamsAPI.fetchCompletedExams(user._id);
        
        if (response.success) {
          setExams(response.exams || []);
        } else {
          throw new Error(response.message || 'Failed to fetch completed exams');
        }
      } catch (err) {
        console.error('Error loading completed exams:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load completed exams. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompletedExams();
  }, [user?._id, toast]);

  // Dummy data for testing until API is ready
  const dummyCompletedExams = [
    {
      id: '1',
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      date: '2024-01-15',
      duration: 120,
      totalMarks: 100,
      participantCount: 25,
      gradedCount: 20,
      status: 'completed',
      averageScore: 78.5
    },
    {
      id: '2',
      title: 'Physics Midterm',
      subject: 'Physics',
      date: '2024-01-10',
      duration: 90,
      totalMarks: 80,
      participantCount: 18,
      gradedCount: 18,
      status: 'completed',
      averageScore: 82.3
    },
    {
      id: '3',
      title: 'Chemistry Quiz',
      subject: 'Chemistry',
      date: '2024-01-08',
      duration: 60,
      totalMarks: 50,
      participantCount: 22,
      gradedCount: 15,
      status: 'completed',
      averageScore: 71.2
    }
  ];

  useEffect(() => {
    fetchCompletedExams();
  }, [user?._id]);

  const fetchCompletedExams = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get(`/api/exams/instructor/${user._id}/completed`);
      // setCompletedExams(response.data.exams || []);
      
      // Using dummy data for now
      setTimeout(() => {
        setCompletedExams(dummyCompletedExams);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching completed exams:', err);
      setError(err.message || 'Failed to load completed exams');
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load completed exams. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradingProgress = (gradedCount, totalCount) => {
    const percentage = (gradedCount / totalCount) * 100;
    return {
      percentage: Math.round(percentage),
      isComplete: gradedCount === totalCount
    };
  };

  const ExamCard = ({ exam }) => {
    const gradingProgress = getGradingProgress(exam.gradedCount, exam.participantCount);
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {exam.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{exam.subject}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(exam.date)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {exam.duration} mins
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {exam.participantCount} participants
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-2" />
              {exam.totalMarks} marks
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Grading Progress</span>
              <span className="text-sm text-gray-600">
                {exam.gradedCount}/{exam.participantCount} ({gradingProgress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  gradingProgress.isComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${gradingProgress.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-lg font-semibold text-gray-900">{exam.averageScore}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={gradingProgress.isComplete ? "default" : "secondary"}>
                {gradingProgress.isComplete ? "Fully Graded" : "Pending Grading"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/instructor/completed-exams/${exam.id}/submissions`}>
              <Button className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Submissions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between mb-4">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  );

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Completed Exams</h1>
            <p className="text-gray-600 mt-1">Review and grade student submissions</p>
          </div>
          <Link href="/instructor/exams">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Exams
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedExams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedExams.reduce((sum, exam) => sum + exam.participantCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fully Graded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedExams.filter(exam => 
                      exam.gradedCount === exam.participantCount
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams List */}
        <div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Exams</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchCompletedExams}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : completedExams.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Exams</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any completed exams yet. Completed exams will appear here once students finish taking them.
                </p>
                <Link href="/instructor/exams">
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    View All Exams
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};

export default CompletedExams;
