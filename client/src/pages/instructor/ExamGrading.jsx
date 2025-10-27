import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  FileText,
  Award
} from 'lucide-react';
import InstructorLayout from '@/layouts/InstructorLayout';

const ExamGrading = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [gradedAnswers, setGradedAnswers] = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/grading/submission/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmission(data.data);
        
        // Initialize graded answers for manual grading questions
        const initialGrades = {};
        data.data.answers.forEach(answer => {
          if (answer.gradingStatus === 'pending_manual_grading') {
            initialGrades[answer.questionId] = {
              score: 0,
              feedback: answer.feedback || ''
            };
          }
        });
        setGradedAnswers(initialGrades);
      } else {
        throw new Error('Failed to fetch submission details');
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (questionId, score, maxScore) => {
    const numericScore = Math.max(0, Math.min(maxScore, parseFloat(score) || 0));
    setGradedAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        score: numericScore
      }
    }));
  };

  const handleFeedbackChange = (questionId, feedbackText) => {
    setGradedAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        feedback: feedbackText
      }
    }));
  };

  const handleSubmitGrading = async () => {
    try {
      setGrading(true);
      
      const gradingData = Object.entries(gradedAnswers).map(([questionId, grading]) => ({
        questionId,
        score: grading.score,
        feedback: grading.feedback
      }));

      const response = await fetch(`/api/instructor/grading/submission/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gradedAnswers: gradingData,
          feedback: feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Grading Complete!",
          description: `Final score: ${data.data.score}/${submission.examId.totalMarks} (${data.data.percentage}%)`,
        });
        
        // Refresh submission data
        await fetchSubmissionDetails();
      } else {
        throw new Error('Failed to submit grading');
      }
    } catch (error) {
      console.error('Error submitting grading:', error);
      toast({
        title: "Error",
        description: "Failed to submit grading",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckCircle className="h-4 w-4" />;
      case 'true_false':
        return <XCircle className="h-4 w-4" />;
      case 'short_answer':
      case 'essay':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getGradingStatusBadge = (status) => {
    switch (status) {
      case 'auto_graded':
        return <Badge className="bg-green-100 text-green-800">Auto-Graded</Badge>;
      case 'manually_graded':
        return <Badge className="bg-blue-100 text-blue-800">Manually Graded</Badge>;
      case 'pending_manual_grading':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Grading</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </InstructorLayout>
    );
  }

  if (!submission) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
              <p className="text-gray-600 mb-4">The requested submission could not be found.</p>
              <Button onClick={() => navigate('/instructor/dashboard')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </InstructorLayout>
    );
  }

  const totalQuestions = submission.answers.length;
  const pendingGrading = submission.answers.filter(a => a.gradingStatus === 'pending_manual_grading').length;
  const autoGraded = submission.answers.filter(a => a.gradingStatus === 'auto_graded').length;
  const manuallyGraded = submission.answers.filter(a => a.gradingStatus === 'manually_graded').length;

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/instructor/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{submission.examId.title}</h1>
              <p className="text-gray-600">Grading submission by {submission.studentId.name}</p>
            </div>
          </div>
          
          {pendingGrading > 0 && (
            <Button 
              onClick={handleSubmitGrading}
              disabled={grading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {grading ? 'Saving...' : 'Complete Grading'}
            </Button>
          )}
        </div>

        {/* Submission Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Submission Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{submission.studentId.name}</div>
                <div className="text-sm text-gray-600">Student</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {submission.score || 0}/{submission.examId.totalMarks}
                </div>
                <div className="text-sm text-gray-600">Current Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{submission.percentage || 0}%</div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {pendingGrading}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Pending Grading</div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Badge className="bg-green-100 text-green-800">
                {autoGraded} Auto-Graded
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {manuallyGraded} Manually Graded
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                {pendingGrading} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div className="space-y-4">
          {submission.answers.map((answer, index) => (
            <motion.div
              key={answer.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${
                answer.gradingStatus === 'pending_manual_grading' 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getQuestionTypeIcon(answer.questionType)}
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Badge variant="outline">{answer.questionType}</Badge>
                    </div>
                    {getGradingStatusBadge(answer.gradingStatus)}
                  </div>
                  <CardDescription className="text-base">
                    {answer.questionText}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Student Answer */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Student Answer:</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {answer.studentAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                      </div>
                    </div>

                    {/* Correct Answer (for auto-graded questions) */}
                    {(answer.questionType === 'multiple_choice' || answer.questionType === 'true_false') && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Correct Answer:</h4>
                        <div className="p-3 bg-green-50 rounded-lg text-green-800">
                          {answer.correctAnswer}
                        </div>
                      </div>
                    )}

                    {/* Grading Section */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          Score: <span className="font-semibold">{answer.score}/{answer.maxScore}</span>
                        </div>
                        {answer.feedback && (
                          <div className="text-sm text-gray-600">
                            Feedback: <span className="italic">{answer.feedback}</span>
                          </div>
                        )}
                      </div>

                      {/* Manual Grading Controls */}
                      {answer.gradingStatus === 'pending_manual_grading' && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={answer.maxScore}
                            step="0.5"
                            value={gradedAnswers[answer.questionId]?.score || 0}
                            onChange={(e) => handleScoreChange(answer.questionId, e.target.value, answer.maxScore)}
                            className="w-20"
                            placeholder="Score"
                          />
                          <span className="text-sm text-gray-600">/ {answer.maxScore}</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Feedback Input */}
                    {answer.gradingStatus === 'pending_manual_grading' && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Feedback:</h4>
                        <Textarea
                          value={gradedAnswers[answer.questionId]?.feedback || ''}
                          onChange={(e) => handleFeedbackChange(answer.questionId, e.target.value)}
                          placeholder="Provide feedback for this answer..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Overall Feedback */}
        {pendingGrading > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
              <CardDescription>
                Provide general feedback for the entire exam submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide overall feedback for the student's performance..."
                rows={4}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </InstructorLayout>
  );
};

export default ExamGrading;
