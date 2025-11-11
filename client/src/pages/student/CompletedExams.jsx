import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import StudentLayout from '@/layouts/StudentLayout';
import { studentExamAPI } from '@/api/studentExams';

const CompletedExams = () => {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [completedExams, setCompletedExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (user) {
      fetchCompletedExams();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortExams();
  }, [completedExams, searchTerm, subjectFilter, sortBy]);

  const fetchCompletedExams = async () => {
    try {
      setLoading(true);
      const data = await studentExamAPI.getCompletedExams(user._id || user.id);
      setCompletedExams(data.exams || []);
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

  const filterAndSortExams = () => {
    let filtered = [...completedExams];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(exam => exam.subject === subjectFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'oldest':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'score-high':
          return (b.score || 0) - (a.score || 0);
        case 'score-low':
          return (a.score || 0) - (b.score || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredExams(filtered);
  };

  const handleViewResult = (examId) => {
    navigate(`/student/exam/${examId}/result`);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const calculateStats = () => {
    if (completedExams.length === 0) return { avgScore: 0, totalExams: 0, passedExams: 0 };
    
    const totalScore = completedExams.reduce((sum, exam) => sum + (exam.percentage || 0), 0);
    const avgScore = totalScore / completedExams.length;
    const passedExams = completedExams.filter(exam => (exam.percentage || 0) >= 60).length;
    
    return {
      avgScore: avgScore.toFixed(1),
      totalExams: completedExams.length,
      passedExams
    };
  };

  const stats = calculateStats();
  const subjects = [...new Set(completedExams.map(exam => exam.subject))];

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="border-none shadow-xl">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="h-32 border-none shadow-lg"></Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Animated Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Completed Exams 🎯
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Review your exam history and performance</p>
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
            <Button 
              onClick={() => navigate('/student/dashboard')}
              variant="outline"
              className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 shadow-lg"
            >
              Back to Dashboard
            </Button>
          </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Total Exams Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-8 w-8 opacity-80" />
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm opacity-90 mb-1"
                >
                  Total Exams
                </motion.p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="text-4xl font-bold"
                >
                  {stats.totalExams}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Score Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden relative">
              <motion.div
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 opacity-80" />
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Award className="h-5 w-5" />
                  </motion.div>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm opacity-90 mb-1"
                >
                  Average Score
                </motion.p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="text-4xl font-bold"
                >
                  {stats.avgScore}%
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pass Rate Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-none shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-8 w-8 opacity-80" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm opacity-90 mb-1"
                >
                  Pass Rate
                </motion.p>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="text-4xl font-bold"
                >
                  {stats.totalExams > 0 ? Math.round((stats.passedExams / stats.totalExams) * 100) : 0}%
                </motion.p>
                <p className="text-xs opacity-75 mt-1">
                  {stats.passedExams} of {stats.totalExams} passed
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-indigo-50/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/30 to-indigo-100/30 rounded-full blur-3xl"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <Filter className="h-5 w-5 text-indigo-600" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                    <Input
                      placeholder="Search exams by title or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-2 border-indigo-100 focus:border-indigo-400 rounded-xl shadow-sm hover:shadow-md transition-all"
                    />
                  </div>
                </div>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-full md:w-52 h-12 border-2 border-purple-100 focus:border-purple-400 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-52 h-12 border-2 border-blue-100 focus:border-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="score-high">Highest Score</SelectItem>
                    <SelectItem value="score-low">Lowest Score</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {completedExams.length === 0 ? 'No completed exams yet' : 'No exams match your filters'}
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  {completedExams.length === 0 
                    ? 'Complete some exams to see your results and performance history here.'
                    : 'Try adjusting your search or filter criteria to find the exams you\'re looking for.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam, index) => (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-gray-50 to-indigo-50/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/20 to-purple-100/20 rounded-full blur-2xl"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                              {exam.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                                <BookOpen className="h-4 w-4 text-indigo-500" />
                                <span className="font-medium">{exam.subject}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">
                                  {new Date(exam.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{exam.duration} min</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <Badge 
                                className={`text-base font-bold px-4 py-2 shadow-lg ${
                                  (exam.percentage || 0) >= 80 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                    : (exam.percentage || 0) >= 60 
                                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                                }`}
                              >
                                {exam.percentage ? `${exam.percentage.toFixed(1)}%` : 'Pending'}
                              </Badge>
                            </motion.div>
                            <div className="text-sm font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-lg shadow-sm">
                              {exam.score || 0} / {exam.totalMarks || 0} marks
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleViewResult(exam._id)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Result
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
      </div>
    </StudentLayout>
  );
};

export default CompletedExams;
