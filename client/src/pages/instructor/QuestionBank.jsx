import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';
import { 
  Plus, 
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Save,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { questionBankAPI } from '../../api/questionBank';

const QuestionBank = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    type: 'mcq',
    subject: '',
    difficulty: 'medium',
    marks: 1,
    options: ['', '', '', ''],
    correctAnswer: '',
    tags: []
  });

  // Fetch questions
  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        scope: 'private'
      };
      const data = await questionBankAPI.getQuestions(params);

      setQuestions(data.questions || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle question creation
  const handleCreateQuestion = async () => {
    console.log('Create Question button clicked');
    console.log('Current question data:', newQuestion);
    
    if (!newQuestion.questionText.trim()) {
      toast({
        title: "Missing Question Text",
        description: "Please enter the question text.",
        variant: "destructive"
      });
      return;
    }

    if (!newQuestion.subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please select a subject.",
        variant: "destructive"
      });
      return;
    }

    if (newQuestion.type === 'mcq' && 
        (!newQuestion.correctAnswer || newQuestion.options.some(opt => !opt.trim()))) {
      toast({
        title: "Incomplete Multiple Choice",
        description: "Please fill in all options and select the correct answer.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Sending question data to API:', {
        ...newQuestion,
        scope: 'private'
      });
      
      const result = await questionBankAPI.createQuestion({
        ...newQuestion,
        scope: 'private'
      });
      
      console.log('API response:', result);
      
      toast({
        title: "Question Created",
        description: "Question created successfully."
      });
      
      // Reset form and close modal
      setNewQuestion({
        questionText: '',
        type: 'mcq',
        subject: '',
        difficulty: 'medium',
        marks: 1,
        options: ['', '', '', ''],
        correctAnswer: '',
        tags: []
      });
      setShowCreateModal(false);
      fetchQuestions(); // Refresh questions list
    } catch (error) {
      console.error('Create error details:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Create Failed",
        description: error.response?.data?.message || error.message || "Failed to create question.",
        variant: "destructive"
      });
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await questionBankAPI.deleteQuestion(questionId);
      toast({
        title: "Question Deleted",
        description: "Question deleted successfully."
      });
      fetchQuestions(); // Refresh questions list
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete question.",
        variant: "destructive"
      });
    }
  };

  // Handle option change for multiple choice questions
  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Add new option
  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  // Remove option
  const removeOption = (index) => {
    if (newQuestion.options.length > 2) {
      const newOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">Create and manage your questions</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden dialog-content-high-priority flex flex-col p-0 bg-white z-[1000]">

              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  Create New Question
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-2">
                  Fill in the details below to add a new question to your bank
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-5 overflow-y-auto flex-1 px-6 py-4 custom-scrollbar">
                {/* Question Text */}
                <div className="space-y-2 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <Label htmlFor="questionText" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Question Text *
                  </Label>
                  <Textarea
                    id="questionText"
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder="Enter your question here... (e.g., What is the capital of France?)" 
                    rows={4}
                    className="mt-1 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Subject and Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject *</Label>
                    <Select value={newQuestion.subject} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Question Type</Label>
                    <Select value={newQuestion.type} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="truefalse">True/False</SelectItem>
                        <SelectItem value="short">Short Answer</SelectItem>
                        <SelectItem value="long">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Difficulty and Marks Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">Difficulty</Label>
                    <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <Label htmlFor="marks" className="text-sm font-semibold text-gray-700">Marks</Label>
                    <Input
                      id="marks"
                      type="number"
                      min="1"
                      max="20"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                      className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Options for Multiple Choice */}
                {newQuestion.type === 'mcq' && (
                  <div className="space-y-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">?</span>
                      </div>
                      <Label className="text-sm font-bold text-gray-800">Answer Options *</Label>
                    </div>
                    <div className="space-y-3">
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                          <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full font-bold text-base shadow-md">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                            className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all border-gray-300"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: option }))}
                            className={newQuestion.correctAnswer === option 
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-green-500 shadow-md min-w-[110px]' 
                              : 'hover:bg-blue-50 hover:border-blue-400 min-w-[110px]'}
                          >
                            {newQuestion.correctAnswer === option ? '✓ Correct' : 'Mark Correct'}
                          </Button>
                          {newQuestion.options.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="w-full border-dashed border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500 transition-all py-3 text-blue-700 font-semibold"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Another Option
                      </Button>
                    </div>
                  </div>
                )}

                {/* Correct Answer for True/False */}
                {newQuestion.type === 'truefalse' && (
                  <div className="space-y-3 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                    <Label className="text-sm font-bold text-gray-800">Correct Answer *</Label>
                    <Select value={newQuestion.correctAnswer} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="True">True</SelectItem>
                        <SelectItem value="False">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-5 border-t-2 mt-6 flex-shrink-0 sticky bottom-0 bg-gradient-to-r from-gray-50 to-white px-6 pb-4 shadow-lg">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateQuestion}
                    className="min-w-[150px] bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Question
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any questions yet. Click "New Question" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{question.subject}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary">{question.type}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {question.questionText}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Marks: {question.marks}</span>
                          <span>Created: {new Date(question.createdAt).toLocaleDateString()}</span>
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex gap-1">
                              {question.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchQuestions(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchQuestions(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
