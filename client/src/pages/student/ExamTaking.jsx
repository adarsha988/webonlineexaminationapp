import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Circle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { studentExamAPI } from '@/api/studentExams';
import AIProctoringMonitor from '@/components/proctoring/AIProctoringMonitor';
import ExamLayout from '@/layouts/ExamLayout';

const ExamTaking = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [examSession, setExamSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [violations, setViolations] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [proctoringEnabled, setProctoringEnabled] = useState(true); // AI Proctoring enabled by default
  
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const visibilityRef = useRef(true);

  // Check verification status - redirect if not verified
  useEffect(() => {
    const verificationKey = `exam_verified_${examId}`;
    const verificationData = sessionStorage.getItem(verificationKey);
    
    if (!verificationData) {
      console.log('❌ Not verified, redirecting to verification...');
      toast({
        title: "Verification Required",
        description: "Please complete camera and microphone verification first",
        variant: "destructive",
      });
      navigate(`/student/exam-verification/${examId}`, { replace: true });
    } else {
      const parsed = JSON.parse(verificationData);
      const verificationAge = Date.now() - new Date(parsed.timestamp).getTime();
      // Verification expires after 5 minutes
      if (verificationAge > 5 * 60 * 1000) {
        console.log('❌ Verification expired, redirecting...');
        sessionStorage.removeItem(verificationKey);
        toast({
          title: "Verification Expired",
          description: "Please verify your devices again",
          variant: "destructive",
        });
        navigate(`/student/exam-verification/${examId}`, { replace: true });
      }
    }
  }, [examId, navigate, toast]);

  // Load exam session
  useEffect(() => {
    if (user && examId) {
      loadExamSession();
    }
  }, [user, examId]);

  // Enhanced timer effect with auto-submit
  useEffect(() => {
    if (timeRemaining > 0 && !isAutoSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto-submit when time runs out
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, isAutoSubmitting]);

  // Auto-save effect
  useEffect(() => {
    if (examSession && Object.keys(answers).length > 0) {
      autoSaveRef.current = setInterval(() => {
        autoSaveAnswers();
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [answers, examSession]);

  // Visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && visibilityRef.current) {
        reportViolation('tab_switch', 'Student switched tabs or minimized window');
        visibilityRef.current = false;
      } else if (!document.hidden) {
        visibilityRef.current = true;
      }
    };

    const handleBlur = () => {
      if (visibilityRef.current) {
        reportViolation('window_blur', 'Student switched focus away from exam window');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      reportViolation('right_click', 'Student attempted to right-click');
    };

    const handleKeyDown = (e) => {
      // Prevent common shortcuts
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
        e.preventDefault();
        reportViolation('copy_paste', `Student attempted ${e.key === 'c' ? 'copy' : e.key === 'v' ? 'paste' : 'select all'}`);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        reportViolation('dev_tools', 'Student attempted to open developer tools');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadExamSession = async () => {
    try {
      setLoading(true);
      console.log('Loading exam session:', { examId, userId: user?._id });
      
      // First try to get existing session
      try {
        const response = await studentExamAPI.getExamSession(examId, user?._id);
        console.log('Existing session response:', response);
        
        if (response.success) {
          // Check if exam is already submitted
          if (response.session.status === 'submitted' || response.session.status === 'completed') {
            toast({
              title: "Exam Already Submitted",
              description: "This exam has already been submitted. Redirecting to dashboard.",
              variant: "destructive",
            });
            navigate('/student/dashboard');
            return;
          }
          
          setExamSession(response.session);
          
          // Initialize answers from existing session
          const existingAnswers = {};
          if (response.session.answers) {
            response.session.answers.forEach(answer => {
              if (answer.answer !== null && answer.answer !== undefined) {
                const questionId = answer.questionId?._id || answer.questionId;
                if (questionId) {
                  existingAnswers[questionId] = answer.answer;
                }
              }
            });
          }
          setAnswers(existingAnswers);
          
          // Calculate time remaining
          const exam = response.session.examId;
          const startTime = new Date(response.session.startedAt);
          const now = new Date();
          const elapsedMinutes = (now - startTime) / (1000 * 60);
          const remainingMinutes = Math.max(0, exam.duration - elapsedMinutes);
          setTimeRemaining(remainingMinutes * 60); // Convert to seconds
          
          return; // Session loaded successfully
        }
      } catch (sessionError) {
        // If 404, no existing session - this is normal for new exams
        if (sessionError.message?.includes('404') || sessionError.response?.status === 404) {
          // Continue to start new session below
        } else {
          throw sessionError; // Re-throw other errors
        }
      }
      
      // No existing session found, start a new one
      console.log('Starting new exam session');
      const startResponse = await studentExamAPI.startExam(examId, user?._id);
      console.log('New session response:', startResponse);
      if (startResponse.success) {
        setExamSession(startResponse.session);
        // Set initial time remaining
        const duration = startResponse.exam.duration; // in minutes
        setTimeRemaining(duration * 60); // Convert to seconds
        // Initialize empty answers
        setAnswers({});
      } else {
        throw new Error(startResponse.message || 'Failed to start exam');
      }
      
    } catch (error) {
      
      // If 404 error, likely the data was reset - redirect to login
      if (error.response?.status === 404) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Failed to load exam",
          variant: "destructive",
        });
        navigate('/student/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const autoSaveAnswers = useCallback(async () => {
    if (!examSession || saving) return;
    
    try {
      setSaving(true);
      const questions = examSession?.examId?.questions || [];
      const currentQuestion = questions[currentQuestionIndex];
      
      // Debug logging
      console.log('Auto-save attempt:', {
        examId,
        userId: user?._id,
        currentQuestionIndex,
        questionId: currentQuestion?._id,
        hasAnswer: currentQuestion?._id ? answers[currentQuestion._id] !== undefined : false,
        answerValue: currentQuestion?._id ? answers[currentQuestion._id] : 'N/A'
      });
      
      if (currentQuestion && currentQuestion._id && answers[currentQuestion._id] !== undefined) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        await studentExamAPI.saveAnswer(examId, user?._id, currentQuestion._id, answers[currentQuestion._id], timeSpent);
        setLastSavedAt(new Date());
        console.log('Auto-save successful');
      } else {
        console.log('Auto-save skipped - no answer to save');
      }
    } catch (error) {
      console.error('Auto-save failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
    } finally {
      setSaving(false);
    }
  }, [examSession, answers, currentQuestionIndex, examId, user?._id, saving, questionStartTime]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuestionNavigation = (index) => {
    // Save current question time before switching
    if (examSession) {
      const questions = examSession?.examId?.questions || [];
      const currentQuestion = questions[currentQuestionIndex];
      
      if (currentQuestion && currentQuestion._id && answers[currentQuestion._id] !== undefined) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        studentExamAPI.saveAnswer(examId, user?._id, currentQuestion._id, answers[currentQuestion._id], timeSpent);
      }
    }
    
    setCurrentQuestionIndex(index);
    setQuestionStartTime(Date.now());
  };

  const handleManualSave = async () => {
    await autoSaveAnswers();
    toast({
      title: "Saved",
      description: "Your answers have been saved successfully.",
    });
  };

  const handleAutoSubmit = async () => {
    if (isAutoSubmitting) return;
    
    setIsAutoSubmitting(true);
    
    toast({
      title: "Time's Up!",
      description: "Exam time has expired. Auto-submitting your answers...",
      variant: "destructive",
    });

    try {
      const finalAnswers = Object.entries(answers)
        .filter(([questionId, answer]) => questionId && answer !== undefined)
        .map(([questionId, answer]) => ({
          questionId,
          answer,
          timeSpent: Math.floor((Date.now() - questionStartTime) / 1000)
        }));

      console.log('📤 AUTO-SUBMITTING EXAM:', { examId, userId: user?._id, answersCount: finalAnswers.length });
      const response = await studentExamAPI.submitExam(examId, user?._id, finalAnswers);
      console.log('✅ AUTO-SUBMIT RESPONSE:', response);
      
      if (response.success) {
        // Clear timers immediately
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        
        toast({
          title: "Exam Auto-Submitted Successfully!",
          description: `Your score: ${response.result?.score || 0}/${response.result?.totalMarks || 0} (${Math.round(response.result?.percentage || 0)}%)`,
        });
        
        // Navigate back to dashboard with success message
        console.log('🚀 AUTO-SUBMIT: NAVIGATING TO DASHBOARD');
        setTimeout(() => {
          navigate('/student/dashboard', { 
            replace: true,
            state: { 
              message: 'Exam auto-submitted due to time expiry!',
              examTitle: examSession?.examId?.title,
              score: response.result
            }
          });
        }, 2000);
      } else {
        // If response is not successful, still redirect
        console.warn('⚠️ AUTO-SUBMIT RESPONSE NOT SUCCESSFUL:', response);
        setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('❌ AUTO-SUBMIT FAILED:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      toast({
        title: "Auto-Submit Failed",
        description: "Failed to auto-submit exam. Redirecting to dashboard...",
        variant: "destructive",
      });
      
      // Even on error, redirect to dashboard
      setTimeout(() => {
        console.log('🚀 AUTO-SUBMIT: REDIRECTING TO DASHBOARD AFTER ERROR');
        navigate('/student/dashboard', { replace: true });
      }, 2000);
    }
  };

  const handleSubmit = async () => {
    if (isAutoSubmitting) {
      toast({
        title: "Auto-Submit in Progress",
        description: "Exam is being auto-submitted due to time expiry. Please wait...",
        variant: "destructive",
      });
      return;
    }

    try {
      setShowSubmitDialog(false); // Close dialog immediately
      
      // Show loading state
      toast({
        title: "Submitting...",
        description: "Please wait while we submit your exam.",
      });
      
      const finalAnswers = Object.entries(answers)
        .filter(([questionId, answer]) => questionId && answer !== undefined)
        .map(([questionId, answer]) => ({
          questionId,
          answer,
          timeSpent: Math.floor((Date.now() - questionStartTime) / 1000)
        }));

      console.log('📤 SUBMITTING EXAM:', { examId, userId: user?._id, answersCount: finalAnswers.length });
      const response = await studentExamAPI.submitExam(examId, user?._id, finalAnswers);
      console.log('✅ SUBMIT RESPONSE:', response);
      
      if (response.success) {
        // Clear timers immediately
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        
        toast({
          title: "Exam Submitted Successfully!",
          description: `Your score: ${response.result?.score || 0}/${response.result?.totalMarks || 0} (${Math.round(response.result?.percentage || 0)}%)`,
        });
        
        // Navigate back to dashboard with success message
        console.log('🚀 NAVIGATING TO DASHBOARD');
        setTimeout(() => {
          navigate('/student/dashboard', { 
            replace: true,
            state: { 
              message: 'Exam submitted successfully!',
              examTitle: examSession?.examId?.title,
              score: response.result
            }
          });
        }, 1500);
      } else {
        // If response is not successful, still redirect after showing error
        console.warn('⚠️ SUBMIT RESPONSE NOT SUCCESSFUL:', response);
        toast({
          title: "Submission Issue",
          description: "Exam submitted but there may be an issue. Redirecting to dashboard...",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('❌ SUBMIT FAILED:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit exam. Redirecting to dashboard...",
        variant: "destructive",
      });
      
      // Even on error, redirect to dashboard after a delay
      setTimeout(() => {
        console.log('🚀 REDIRECTING TO DASHBOARD AFTER ERROR');
        navigate('/student/dashboard', { replace: true });
      }, 2000);
      
      setShowSubmitDialog(false);
    }
  };

  const reportViolation = async (type, details) => {
    try {
      console.log('📝 REPORTING VIOLATION (ExamTaking):', { examId, studentId: user?._id, type, details });
      const response = await studentExamAPI.reportViolation(examId, user?._id, type, details);
      console.log('✅ VIOLATION REPORTED SUCCESSFULLY (ExamTaking):', response);
      setViolations(prev => [...prev, { type, details, timestamp: new Date() }]);
    } catch (error) {
      console.error('❌ FAILED TO REPORT VIOLATION (ExamTaking):', error.response?.data || error.message);
    }
  };

  const handleProctoringViolation = (violation) => {
    // Handle violations detected by AI proctoring monitor
    setViolations(prev => [...prev, violation]);
    
    // Show toast notification for critical violations
    if (violation.type === 'multiple_faces' || violation.type === 'tab_switch') {
      toast({
        title: "Warning",
        description: violation.description,
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const questions = examSession?.examId?.questions || [];
    const question = questions[index];
    if (!question || !question._id) return 'unanswered';
    
    const hasAnswer = answers[question._id] !== undefined && answers[question._id] !== null && answers[question._id] !== '';
    
    if (index === currentQuestionIndex) return 'current';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  const renderQuestion = (question) => {
    if (!question || !question._id) {
      return <div className="text-center py-8 text-gray-500">Question not available</div>;
    }
    
    const answer = answers[question._id];

    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer || ''}
              onValueChange={(value) => handleAnswerChange(question._id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'truefalse':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer || ''}
              onValueChange={(value) => handleAnswerChange(question._id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id="true" />
                <Label htmlFor="true" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id="false" />
                <Label htmlFor="false" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'short':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Enter your answer here..."
            className="min-h-[100px]"
          />
        );

      case 'long':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Enter your detailed answer here..."
            className="min-h-[200px]"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading || !examSession || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!examSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Exam Not Available</h2>
            <p className="text-gray-600 mb-4">Unable to load the exam session.</p>
            <Button onClick={() => navigate('/student/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe access to questions array
  const questions = examSession?.examId?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(key => 
    key && answers[key] !== undefined && answers[key] !== null && answers[key] !== ''
  ).length;

  // Component render logic

  // If no questions are loaded, show error
  if (examSession && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">This exam has no questions configured.</p>
            <Button onClick={() => navigate('/student/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ExamLayout 
      examTitle={examSession?.examId?.title}
      timeRemaining={timeRemaining}
      progress={progress}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen relative"
      >
        {/* AI Proctoring Monitor - Floating Camera Feed */}
        {proctoringEnabled && examSession && (
          <AIProctoringMonitor 
            examId={examId}
            studentId={user?._id}
            sessionId={examSession._id}
            onViolation={handleProctoringViolation}
          />
        )}

        {/* Action Bar - Floating at top */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-20 z-40 mx-4 sm:mx-6 lg:mx-8 mt-4"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Left: Question Info */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Question {currentQuestionIndex + 1}</span>
                  <span className="text-gray-400 mx-2">/</span>
                  <span>{questions.length}</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-blue-600 font-medium">Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Saved</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualSave} 
                  disabled={saving}
                  className="shadow-sm hover:shadow-md transition-all"
                >
                  <Save className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button 
                  onClick={() => setShowSubmitDialog(true)}
                  size="sm"
                  className={`shadow-lg hover:shadow-xl transition-all font-semibold ${
                    timeRemaining <= 300 ? 'bg-red-600 hover:bg-red-700 animate-pulse' :
                    timeRemaining <= 600 ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={isAutoSubmitting}
                >
                  <Send className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{isAutoSubmitting ? 'Submitting...' : 'Submit'}</span>
                </Button>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  {answeredCount} Answered
                </span>
                <span className="font-bold text-blue-600">{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full shadow-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Question Navigation Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-36 shadow-xl bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-4">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <Button
                        key={index}
                        variant={status === 'current' ? 'default' : 'outline'}
                        size="sm"
                        className={`h-10 w-10 p-0 font-semibold transition-all hover:scale-110 ${
                          status === 'answered' ? 'bg-green-100 border-2 border-green-400 text-green-700 hover:bg-green-200' :
                          status === 'current' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' :
                          'bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-400'
                        }`}
                        onClick={() => handleQuestionNavigation(index)}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded shadow-sm"></div>
                    <span className="font-medium text-gray-700">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border-2 border-green-400 rounded"></div>
                    <span className="font-medium text-gray-700">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="font-medium text-gray-700">Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Question Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-gray-200 rounded-2xl">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {currentQuestion?.type?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion?.marks || 0} {(currentQuestion?.marks || 0) === 1 ? 'mark' : 'marks'}
                      </Badge>
                      {currentQuestion?.difficulty && (
                        <Badge variant="outline" className={
                          currentQuestion.difficulty === 'easy' ? 'text-green-600' :
                          currentQuestion.difficulty === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {currentQuestion.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Question Text */}
                <div className="prose max-w-none bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <p className="text-lg text-gray-900 leading-relaxed font-medium">
                    {currentQuestion?.questionText || 'Loading question...'}
                  </p>
                </div>

                {/* Answer Area */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Your Answer:</h4>
                  {currentQuestion ? renderQuestion(currentQuestion) : <div>Loading question...</div>}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 py-3 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === (questions.length || 1) - 1}
                    className="flex-1 py-3 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Submit Confirmation Dialog - Enhanced */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="rounded-2xl border-2 border-gray-200 shadow-2xl backdrop-blur-sm bg-white/95 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center text-gray-900">
              Submit Your Exam?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-700">
                  You have answered <span className="font-bold text-green-600">{answeredCount}</span> out of <span className="font-bold">{questions.length}</span> questions.
                </p>
              </div>
              {answeredCount < questions.length && (
                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-xl p-4">
                  <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount > 1 ? 's' : ''}.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 pt-2">
                ⚠️ Once submitted, you <strong>cannot</strong> make any changes to your answers.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel className="flex-1 py-3 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit} 
              className="flex-1 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </motion.div>
    </ExamLayout>
  );
};

export default ExamTaking;
