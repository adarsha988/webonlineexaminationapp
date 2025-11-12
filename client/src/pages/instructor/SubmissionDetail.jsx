import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  CheckCircle, 
  Clock, 
  Save,
  FileText,
  Award,
  Send,
  Download,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import InstructorLayout from '../../layouts/InstructorLayout';
import api from '../../api/axios';

const SubmissionDetail = () => {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { examId, submissionId } = useParams();
  
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);


  // Dummy data for testing
  const dummySubmission = {
    id: submissionId,
    examId: examId,
    studentId: 'std003',
    studentName: 'Mike Davis',
    studentEmail: 'mike.davis@example.com',
    submissionStatus: 'completed',
    submittedAt: '2024-01-15T11:15:00Z',
    timeSpent: 120,
    exam: {
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      totalMarks: 100,
      duration: 120
    }
  };

  const dummyAnswers = [
    {
      id: '1',
      questionId: 'q1',
      questionText: 'What is the derivative of x²?',
      questionType: 'mcq',
      options: ['2x', 'x²', '2', 'x'],
      correctAnswer: '2x',
      studentAnswer: '2x',
      marks: 5,
      maxMarks: 5,
      isCorrect: true
    },
    {
      id: '2',
      questionId: 'q2',
      questionText: 'Solve the equation: 2x + 5 = 15',
      questionType: 'short',
      studentAnswer: 'x = 5',
      correctAnswer: 'x = 5',
      marks: null,
      maxMarks: 10,
      isCorrect: null
    },
    {
      id: '3',
      questionId: 'q3',
      questionText: 'Explain the concept of limits in calculus with an example.',
      questionType: 'essay',
      studentAnswer: 'A limit in calculus represents the value that a function approaches as the input approaches some value. For example, the limit of (x²-1)/(x-1) as x approaches 1 is 2, even though the function is undefined at x=1.',
      maxMarks: 15,
      marks: null,
      isCorrect: null
    },
    {
      id: '4',
      questionId: 'q4',
      questionText: 'What is the integral of 3x²?',
      questionType: 'mcq',
      options: ['x³', '6x', 'x³ + C', '3x³'],
      correctAnswer: 'x³ + C',
      studentAnswer: '3x³',
      marks: 0,
      maxMarks: 5,
      isCorrect: false
    }
  ];

  useEffect(() => {
    if (examId && submissionId) {
      fetchSubmissionDetail();
    }
  }, [examId, submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API calls when backend is ready
      // const response = await api.get(`/api/exams/${examId}/submissions/${submissionId}`);
      // setSubmission(response.data.submission);
      // setAnswers(response.data.answers || []);
      
      // Using dummy data for now
      setTimeout(() => {
        setSubmission(dummySubmission);
        setAnswers(dummyAnswers);
        
        // Initialize marks and feedback from existing data
        const initialMarks = {};
        const initialFeedback = {};
        dummyAnswers.forEach(answer => {
          if (answer.marks !== null) {
            initialMarks[answer.id] = answer.marks;
          }
          initialFeedback[answer.id] = '';
        });
        setMarks(initialMarks);
        setFeedback(initialFeedback);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching submission detail:', err);
      setError(err.message || 'Failed to load submission details');
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load submission details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarksChange = (answerId, value) => {
    const numValue = parseFloat(value) || 0;
    const answer = answers.find(a => a.id === answerId);
    if (numValue <= answer.maxMarks) {
      setMarks(prev => ({ ...prev, [answerId]: numValue }));
    }
  };

  const handleFeedbackChange = (answerId, value) => {
    setFeedback(prev => ({ ...prev, [answerId]: value }));
  };

  const calculateTotalMarks = () => {
    return answers.reduce((total, answer) => {
      if (answer.questionType === 'mcq') {
        return total + (answer.isCorrect ? answer.maxMarks : 0);
      }
      return total + (marks[answer.id] || 0);
    }, 0);
  };

  const getTotalMaxMarks = () => {
    return answers.reduce((total, answer) => total + answer.maxMarks, 0);
  };

  const saveMarks = async () => {
    try {
      setIsSaving(true);
      
      // TODO: Replace with actual API call when backend is ready
      // await api.put(`/api/exams/${examId}/submissions/${submissionId}/marks`, {
      //   marks,
      //   feedback
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Marks saved successfully!",
      });
      
    } catch (err) {
      console.error('Error saving marks:', err);
      toast({
        title: "Error",
        description: "Failed to save marks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateReport = async () => {
    try {
      // TODO: Implement report generation
      toast({
        title: "Report Generated",
        description: "Student report has been generated successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendReportCard = async () => {
    try {
      // TODO: Implement email sending
      toast({
        title: "Report Card Sent",
        description: `Report card has been sent to ${submission.studentEmail}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send report card. Please try again.",
        variant: "destructive"
      });
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

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <CheckCircle className="h-4 w-4" />;
      case 'short':
        return <Edit3 className="h-4 w-4" />;
      case 'essay':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getQuestionTypeBadge = (type) => {
    const variants = {
      mcq: 'default',
      short: 'secondary',
      essay: 'outline'
    };
    const labels = {
      mcq: 'Multiple Choice',
      short: 'Short Answer',
      essay: 'Essay'
    };
    return (
      <Badge variant={variants[type] || 'outline'}>
        {getQuestionTypeIcon(type)}
        <span className="ml-1">{labels[type] || type}</span>
      </Badge>
    );
  };

  const AnswerCard = ({ answer, index }) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
              {getQuestionTypeBadge(answer.questionType)}
              <Badge variant="outline" className="ml-auto">
                {answer.maxMarks} marks
              </Badge>
            </div>
            <CardTitle className="text-lg">{answer.questionText}</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* MCQ Options */}
        {answer.questionType === 'mcq' && answer.options && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Options:</Label>
            <div className="grid grid-cols-2 gap-2">
              {answer.options.map((option, idx) => (
                <div 
                  key={idx}
                  className={`p-2 rounded border text-sm ${
                    option === answer.correctAnswer 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : option === answer.studentAnswer && option !== answer.correctAnswer
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {option}
                  {option === answer.correctAnswer && <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />}
                  {option === answer.studentAnswer && option !== answer.correctAnswer && <span className="ml-2 text-red-600">✗</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Answer */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Student's Answer:</Label>
          <div className={`p-3 rounded border ${
            answer.questionType === 'mcq' 
              ? answer.isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className="text-sm">{answer.studentAnswer || 'No answer provided'}</p>
          </div>
        </div>

        {/* Correct Answer for non-MCQ */}
        {answer.questionType !== 'mcq' && answer.correctAnswer && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Expected Answer:</Label>
            <div className="p-3 rounded border bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">{answer.correctAnswer}</p>
            </div>
          </div>
        )}

        {/* Grading Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Marks Input for subjective questions */}
          {answer.questionType !== 'mcq' && (
            <div>
              <Label htmlFor={`marks-${answer.id}`} className="text-sm font-medium text-gray-700 mb-2 block">
                Marks (out of {answer.maxMarks})
              </Label>
              <Input
                id={`marks-${answer.id}`}
                type="number"
                min="0"
                max={answer.maxMarks}
                step="0.5"
                value={marks[answer.id] || ''}
                onChange={(e) => handleMarksChange(answer.id, e.target.value)}
                placeholder="Enter marks"
              />
            </div>
          )}

          {/* MCQ Auto-graded display */}
          {answer.questionType === 'mcq' && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Auto-graded</Label>
              <div className={`p-2 rounded border text-center font-medium ${
                answer.isCorrect 
                  ? 'bg-green-100 border-green-200 text-green-800' 
                  : 'bg-red-100 border-red-200 text-red-800'
              }`}>
                {answer.isCorrect ? `${answer.maxMarks}/${answer.maxMarks}` : `0/${answer.maxMarks}`}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className={answer.questionType === 'mcq' ? 'md:col-span-1' : 'md:col-span-2'}>
            <Label htmlFor={`feedback-${answer.id}`} className="text-sm font-medium text-gray-700 mb-2 block">
              Feedback (Optional)
            </Label>
            <Textarea
              id={`feedback-${answer.id}`}
              value={feedback[answer.id] || ''}
              onChange={(e) => handleFeedbackChange(answer.id, e.target.value)}
              placeholder="Add feedback for the student..."
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!examId || !submissionId) {
    return (
      <InstructorLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Submission</h2>
          <p className="text-gray-600 mb-4">The submission ID is missing or invalid.</p>
          <Link href="/instructor/dashboard">
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Instructor Dashboard
            </Button>
          </Link>
        </div>
      </InstructorLayout>
    );
  }

  if (isLoading) {
    return (
      <InstructorLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="mb-6">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (error) {
    return (
      <InstructorLayout>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Submission</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSubmissionDetail}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link href={`/instructor/completed-exams/${examId}/submissions`}>
              <Button 
                variant="outline" 
                className="mb-2 border-2 border-indigo-300 hover:border-indigo-500 bg-white/80 backdrop-blur-sm hover:bg-indigo-50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submissions
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
            <p className="text-gray-600 mt-1">{submission?.exam?.title}</p>
          </div>
        </div>

        {/* Student Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-semibold text-gray-900">{submission?.studentName}</p>
                  <p className="text-xs text-gray-500">{submission?.studentEmail}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="font-semibold text-gray-900">{submission?.timeSpent} mins</p>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Current Score</p>
                  <p className="font-semibold text-gray-900">
                    {calculateTotalMarks()}/{getTotalMaxMarks()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-semibold text-gray-900">{formatDate(submission?.submittedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions & Answers</h2>
          {answers.map((answer, index) => (
            <AnswerCard key={answer.id} answer={answer} index={index} />
          ))}
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={saveMarks} 
                disabled={isSaving}
                className="flex-1 min-w-[200px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Marks'}
              </Button>
              
              <Button 
                onClick={generateReport} 
                variant="outline"
                className="flex-1 min-w-[200px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              
              <Button 
                onClick={sendReportCard} 
                variant="outline"
                className="flex-1 min-w-[200px]"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Report Card
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-900">Total Score</p>
                  <p className="text-sm text-blue-700">
                    {calculateTotalMarks()} out of {getTotalMaxMarks()} marks 
                    ({Math.round((calculateTotalMarks() / getTotalMaxMarks()) * 100)}%)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round((calculateTotalMarks() / getTotalMaxMarks()) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
};

export default SubmissionDetail;
