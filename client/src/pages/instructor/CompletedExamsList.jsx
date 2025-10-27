import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { 
  Search,
  Eye,
  Users,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Filter,
  Calendar
} from 'lucide-react';
import InstructorLayout from '@/layouts/InstructorLayout';

const CompletedExamsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [completedExams, setCompletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompletedExams();
    }
  }, [user]);

  const fetchCompletedExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/grading/completed-exams/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompletedExams(data.data);
      } else {
        throw new Error('Failed to fetch completed exams');
      }
    } catch (error) {
      console.error('Error fetching completed exams:', error);
      toast({
        title: "Error",
        description: "Failed to load completed exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSubmissions = async (examId) => {
    try {
      setLoadingSubmissions(true);
      const response = await fetch(`/api/instructor/grading/exam/${examId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data);
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load exam submissions",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    fetchExamSubmissions(exam.exam._id);
  };

  const handleGradeSubmission = (submissionId) => {
    navigate(`/instructor/grading/${submissionId}`);
  };

  const getGradingStatusBadge = (submission) => {
    if (submission.gradingStatus === 'complete') {
      return <Badge className="bg-green-100 text-green-800">Fully Graded</Badge>;
    } else if (submission.gradingStatus === 'partial') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Grading</Badge>;
    } else {
      return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredExams = completedExams.filter(examGroup =>
    examGroup.exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examGroup.exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Completed Exams</h1>
            <p className="text-gray-600">Review and grade student submissions</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exams List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Exams</h2>
            
            {filteredExams.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Exams</h3>
                  <p className="text-gray-600">No students have completed your exams yet.</p>
                </CardContent>
              </Card>
            ) : (
              filteredExams.map((examGroup, index) => (
                <motion.div
                  key={examGroup.exam._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedExam?.exam._id === examGroup.exam._id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleExamClick(examGroup)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{examGroup.exam.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <BookOpen className="h-4 w-4" />
                            {examGroup.exam.subject}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {examGroup.stats.total} submissions
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {examGroup.stats.fullyGraded}
                          </div>
                          <div className="text-xs text-gray-600">Fully Graded</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {examGroup.stats.pendingGrading}
                          </div>
                          <div className="text-xs text-gray-600">Pending</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {examGroup.stats.averageScore}%
                          </div>
                          <div className="text-xs text-gray-600">Avg Score</div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/instructor/completed-exams/${examGroup.exam._id}`);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Students ({examGroup.stats.total})
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {selectedExam ? `${selectedExam.exam.title} - Submissions` : 'Select an Exam'}
            </h2>
            
            {!selectedExam ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Exam</h3>
                  <p className="text-gray-600">Choose an exam from the left to view student submissions.</p>
                </CardContent>
              </Card>
            ) : loadingSubmissions ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading submissions...</p>
                </CardContent>
              </Card>
            ) : submissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Submissions</h3>
                  <p className="text-gray-600">No students have submitted this exam yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission, index) => (
                  <motion.div
                    key={submission._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{submission.studentId.name}</h4>
                              <p className="text-sm text-gray-600">{submission.studentId.email}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold">
                                {submission.score || 0}/{submission.examId.totalMarks}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({submission.percentage || 0}%)
                              </span>
                            </div>
                            {getGradingStatusBadge(submission)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            Submitted: {formatDate(submission.submittedAt)}
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleGradeSubmission(submission._id)}
                            className={submission.gradingStatus === 'partial' 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {submission.gradingStatus === 'partial' ? 'Grade' : 'Review'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default CompletedExamsList;
