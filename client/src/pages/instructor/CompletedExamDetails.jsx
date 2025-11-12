import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, User, Clock, CheckCircle, FileText, Award, Send, Eye, Edit2, Download } from 'lucide-react';
import InstructorLayout from '@/layouts/InstructorLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const CompletedExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReport, setSendingReport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/grading/exam/${examId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Exam submissions data:', data);
        
        // Extract exam details from first submission or create structure
        if (data.data && data.data.length > 0) {
          console.log('First submission:', data.data[0]);
          setExam(data.data[0].examId);
          setSubmissions(data.data);
        } else {
          console.log('No submissions found for this exam');
          setExam(null);
          setSubmissions([]);
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch exam details');
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
      toast({
        title: "Error",
        description: "Failed to load exam details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/instructor/grading/${submissionId}`);
  };

  const handleSendReport = async (submission) => {
    try {
      setSendingReport(true);
      const response = await fetch(`/api/instructor/grading/submission/${submission._id}/send-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: reportMessage || `Your exam "${exam.title}" has been graded. Check your dashboard for results.`,
          instructorId: user._id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Report Sent",
          description: `Report sent to ${submission.studentId?.name || data.data.studentName} successfully!`,
        });
        setSelectedStudent(null);
        setReportMessage('');
        fetchExamDetails(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send report');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send report",
        variant: "destructive",
      });
    } finally {
      setSendingReport(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/instructor')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instructor Dashboard
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{exam?.title}</h1>
              <p className="text-gray-600 mt-1">{exam?.subject}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {submissions.length} Submissions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam?.duration} minutes
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {exam?.questions?.length || 0} questions
                </span>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.length > 0
                      ? Math.round(submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / submissions.length)
                      : 0}%
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.length > 0
                      ? Math.max(...submissions.map(s => s.percentage || 0))
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.length > 0
                      ? Math.round((submissions.filter(s => s.percentage >= (exam?.passingMarks || 40)).length / submissions.length) * 100)
                      : 0}%
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>View and manage student exam submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                <p className="text-gray-600">Students haven't submitted this exam yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <motion.tr
                        key={submission._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.studentId?.name || 'Unknown Student'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.studentId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${getScoreColor(submission.percentage)}`}>
                            {submission.score}/{submission.totalMarks} ({submission.percentage}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getGradeColor(submission.percentage)}>
                            {submission.percentage >= 80 ? 'A' :
                             submission.percentage >= 60 ? 'B' :
                             submission.percentage >= 40 ? 'C' : 'F'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={submission.reportSent ? 'default' : 'outline'}>
                            {submission.reportSent ? 'Report Sent' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSubmission(submission._id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Check Exam
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant={submission.reportSent ? 'outline' : 'default'}
                                  size="sm"
                                  onClick={() => setSelectedStudent(submission)}
                                >
                                  <Send className="w-4 h-4 mr-1" />
                                  {submission.reportSent ? 'Resend' : 'Send Report'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send Report to {submission.studentId?.name}</DialogTitle>
                                  <DialogDescription>
                                    Send the exam results and feedback to the student via email
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Score Summary</label>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                      <p className="text-sm"><strong>Score:</strong> {submission.score}/{submission.totalMarks} ({submission.percentage}%)</p>
                                      <p className="text-sm"><strong>Grade:</strong> {submission.percentage >= 80 ? 'A' : submission.percentage >= 60 ? 'B' : submission.percentage >= 40 ? 'C' : 'F'}</p>
                                      <p className="text-sm"><strong>Status:</strong> {submission.percentage >= (exam?.passingMarks || 40) ? 'Passed' : 'Failed'}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Custom Message (Optional)</label>
                                    <Textarea
                                      placeholder="Add a personal message to the student..."
                                      value={reportMessage}
                                      onChange={(e) => setReportMessage(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedStudent(null);
                                      setReportMessage('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleSendReport(submission)}
                                    disabled={sendingReport}
                                  >
                                    {sendingReport ? 'Sending...' : 'Send Report'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
};

export default CompletedExamDetails;
