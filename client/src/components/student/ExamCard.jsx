import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, Play, Eye, Award, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ExamCard = ({ exam, onStart, onViewResult, type = 'upcoming' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [examStatus, setExamStatus] = useState('upcoming');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Determine exam status based on current time
  useEffect(() => {
    const now = currentTime;
    const startTime = new Date(exam.scheduledDate);
    const endTime = new Date(exam.endDate);
    
    if (exam.studentStatus === 'completed' || exam.status === 'completed') {
      setExamStatus('completed');
    } else if (now < startTime) {
      setExamStatus('upcoming');
    } else if (now >= startTime && now <= endTime) {
      setExamStatus('ongoing');
    } else if (now > endTime) {
      setExamStatus('expired');
    }
  }, [currentTime, exam]);

  const getTimeUntilStart = () => {
    const now = currentTime;
    const startTime = new Date(exam.scheduledDate);
    const diff = startTime - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeRemaining = () => {
    const now = currentTime;
    const endTime = new Date(exam.endDate);
    const diff = endTime - now;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
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

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = () => {
    switch (examStatus) {
      case 'upcoming':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Starts {getTimeUntilStart()}
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Play className="h-3 w-3 mr-1" />
            Available Now
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionButton = () => {
    switch (examStatus) {
      case 'upcoming':
        return (
          <Button disabled className="w-full" variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Starts {getTimeUntilStart()}
          </Button>
        );
      case 'ongoing':
        return (
          <Button 
            onClick={() => onStart(exam._id)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Exam
          </Button>
        );
      case 'expired':
        return (
          <Button disabled className="w-full" variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            Exam Expired
          </Button>
        );
      case 'completed':
        return (
          <Button disabled className="w-full" variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Exam Completed
          </Button>
        );
      default:
        return (
          <Button disabled className="w-full" variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            Unavailable
          </Button>
        );
    }
  };

  const renderUpcomingExam = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{exam.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <BookOpen className="h-4 w-4" />
                {exam.subject}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {formatDate(exam.scheduledDate)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatDuration(exam.duration)} duration
            </div>
            {examStatus === 'ongoing' && getTimeRemaining() && (
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <AlertCircle className="h-4 w-4" />
                {getTimeRemaining()}
              </div>
            )}
            <div className="text-sm text-gray-600">
              <span className="font-medium">{exam.questions?.length || 0}</span> questions
            </div>
            {getActionButton()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCompletedExam = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{exam.examId?.title || exam.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <BookOpen className="h-4 w-4" />
                {exam.examId?.subject || exam.subject}
              </CardDescription>
            </div>
            {exam.grade && (
              <Badge className={getGradeColor(exam.grade)}>
                {exam.grade}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="font-semibold text-lg">
                {exam.score || 0}/{exam.examId?.totalMarks || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="font-semibold text-lg text-blue-600">
                {exam.percentage || 0}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Completed: {formatDate(exam.submittedAt)}
            </div>
            {exam.feedback && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Feedback:</span>
                <p className="text-gray-600 mt-1">{exam.feedback}</p>
              </div>
            )}
            <Button 
              onClick={() => onViewResult(exam.examId?._id || exam._id)}
              variant="outline"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (type === 'completed') {
    return renderCompletedExam();
  }
  
  // For both upcoming and ongoing exams, use the enhanced renderUpcomingExam
  return renderUpcomingExam();
};

export default ExamCard;
