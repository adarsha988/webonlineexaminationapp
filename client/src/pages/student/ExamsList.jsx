import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Search, Filter, Award, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentLayout from '@/layouts/StudentLayout';
import { studentExamAPI } from '@/api/studentExams';
import { useToast } from '@/hooks/useToast';

const ExamsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exams, setExams] = useState({
    upcoming: [],
    ongoing: [],
    completed: []
  });

  useEffect(() => {
    fetchAllExams();
  }, []);

  const fetchAllExams = async () => {
    try {
      setLoading(true);
      const response = await studentExamAPI.getAvailableExams(user._id || user.id);
      
      if (response.success) {
        // Categorize exams
        const now = new Date();
        const categorized = {
          upcoming: [],
          ongoing: [],
          completed: []
        };

        response.data.forEach(exam => {
          const scheduledDate = new Date(exam.scheduledDate);
          const endDate = new Date(exam.endDate);

          if (exam.studentStatus === 'submitted') {
            categorized.completed.push(exam);
          } else if (exam.studentStatus === 'in_progress') {
            categorized.ongoing.push(exam);
          } else if (scheduledDate <= now && endDate >= now) {
            categorized.ongoing.push(exam);
          } else if (scheduledDate > now) {
            categorized.upcoming.push(exam);
          }
        });

        setExams(categorized);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await studentExamAPI.startExam(examId, user._id);
      if (response.success) {
        navigate(`/student/exam/${examId}`);
        toast({
          title: "Exam Started",
          description: "Good luck with your exam!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start exam",
        variant: "destructive",
      });
    }
  };

  const handleResumeExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const handleViewResult = (examId) => {
    navigate(`/student/exam/${examId}/result`);
  };

  const filterExams = (examsList) => {
    if (!searchQuery) return examsList;
    return examsList.filter(exam =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const ExamCard = ({ exam, type }) => {
    const scheduledDate = new Date(exam.scheduledDate);
    const endDate = new Date(exam.endDate);
    const now = new Date();
    const daysUntil = Math.ceil((scheduledDate - now) / (1000 * 60 * 60 * 24));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        <Card className="border-0 bg-white/80 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden relative ring-1 ring-indigo-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-3 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {exam.title}
                </CardTitle>
                <p className="text-gray-600 font-medium mt-1 flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {exam.subject || 'General'}
                </p>
              </div>
              <Badge className={
                type === 'ongoing' ? 'bg-yellow-500' :
                type === 'completed' ? 'bg-green-500' :
                'bg-blue-500'
              }>
                {type === 'ongoing' ? '🔥 Live' :
                 type === 'completed' ? '✓ Done' :
                 daysUntil <= 1 ? '⏰ Tomorrow' : `📅 ${daysUntil}d`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {scheduledDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {exam.duration} min
                </div>
              </div>

              {exam.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{exam.description}</p>
              )}

              {type === 'completed' && exam.score !== undefined && (
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-600">Score: {exam.score}%</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {type === 'ongoing' && (
                  <Button 
                    onClick={() => handleResumeExam(exam._id)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume Exam
                  </Button>
                )}
                {type === 'upcoming' && (
                  <Button 
                    onClick={() => handleStartExam(exam._id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold"
                  >
                    Start Exam
                  </Button>
                )}
                {type === 'completed' && (
                  <Button 
                    onClick={() => handleViewResult(exam._id)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Results
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exams...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const allExams = [...exams.upcoming, ...exams.ongoing, ...exams.completed];

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 All Exams</h1>
            <p className="text-gray-600">Browse and manage your exams</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search exams by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg bg-white/80 backdrop-blur-xl border-white/60 shadow-xl"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl p-2 rounded-2xl">
              <TabsTrigger value="all" className="rounded-xl px-6">
                All ({allExams.length})
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="rounded-xl px-6">
                Ongoing ({exams.ongoing.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-xl px-6">
                Upcoming ({exams.upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-xl px-6">
                Completed ({exams.completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterExams([...exams.ongoing, ...exams.upcoming, ...exams.completed]).map((exam) => {
                  const type = exams.ongoing.includes(exam) ? 'ongoing' :
                               exams.upcoming.includes(exam) ? 'upcoming' : 'completed';
                  return <ExamCard key={exam._id} exam={exam} type={type} />;
                })}
              </div>
            </TabsContent>

            <TabsContent value="ongoing">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterExams(exams.ongoing).map((exam) => (
                  <ExamCard key={exam._id} exam={exam} type="ongoing" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterExams(exams.upcoming).map((exam) => (
                  <ExamCard key={exam._id} exam={exam} type="upcoming" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterExams(exams.completed).map((exam) => (
                  <ExamCard key={exam._id} exam={exam} type="completed" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ExamsList;
