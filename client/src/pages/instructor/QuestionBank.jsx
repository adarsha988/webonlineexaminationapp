import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { questionBankAPI } from '../../api/questionBank';

const QuestionBank = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
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
  const [editQuestion, setEditQuestion] = useState({
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

  // Handle view question
  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowViewModal(true);
  };

  // Handle edit question
  const handleEditQuestion = (question) => {
    setEditQuestion({
      _id: question._id,
      questionText: question.questionText,
      type: question.type,
      subject: question.subject,
      difficulty: question.difficulty,
      marks: question.marks,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      tags: question.tags || []
    });
    setShowEditModal(true);
  };

  // Handle update question
  const handleUpdateQuestion = async () => {
    if (!editQuestion.questionText.trim()) {
      toast({
        title: "Missing Question Text",
        description: "Please enter the question text.",
        variant: "destructive"
      });
      return;
    }

    if (!editQuestion.subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please select a subject.",
        variant: "destructive"
      });
      return;
    }

    if (editQuestion.type === 'mcq' && 
        (!editQuestion.correctAnswer || editQuestion.options.some(opt => !opt.trim()))) {
      toast({
        title: "Incomplete Multiple Choice",
        description: "Please fill in all options and select the correct answer.",
        variant: "destructive"
      });
      return;
    }

    try {
      await questionBankAPI.updateQuestion(editQuestion._id, {
        questionText: editQuestion.questionText,
        type: editQuestion.type,
        subject: editQuestion.subject,
        difficulty: editQuestion.difficulty,
        marks: editQuestion.marks,
        options: editQuestion.options,
        correctAnswer: editQuestion.correctAnswer,
        tags: editQuestion.tags
      });
      
      toast({
        title: "Question Updated",
        description: "Question updated successfully."
      });
      
      setShowEditModal(false);
      fetchQuestions(); // Refresh questions list
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || error.message || "Failed to update question.",
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

  // Handle option change for edit modal
  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editQuestion.options];
    newOptions[index] = value;
    setEditQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Add new option for edit modal
  const addEditOption = () => {
    setEditQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  // Remove option for edit modal
  const removeEditOption = (index) => {
    if (editQuestion.options.length > 2) {
      const newOptions = editQuestion.options.filter((_, i) => i !== index);
      setEditQuestion(prev => ({
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/instructor/dashboard')}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-600 mt-1">Create and manage your questions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5" />
                New Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 bg-white border-2 border-blue-200 shadow-2xl">
              {/* Modern Header with Icon */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200">
                <DialogHeader className="px-8 pt-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                        Create New Question
                      </DialogTitle>
                      <DialogDescription className="text-base text-gray-600">
                        Build your question bank with detailed assessments
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              {/* Scrollable Content Area */}
              <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Question Text Section */}
                <div className="group">
                  <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">1</div>
                    Question Text
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      value={newQuestion.questionText}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                      placeholder="Enter your question here... e.g., What is the capital of France?"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none bg-white shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                {/* Configuration Grid */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">2</div>
                    Question Configuration
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Subject */}
                    <div className="relative">
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Subject <span className="text-red-500">*</span></Label>
                      <Select value={newQuestion.subject} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, subject: value }))}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                          <SelectItem value="mathematics" className="cursor-pointer">Mathematics</SelectItem>
                          <SelectItem value="science" className="cursor-pointer"> Science</SelectItem>
                          <SelectItem value="english" className="cursor-pointer">English</SelectItem>
                          <SelectItem value="history" className="cursor-pointer">History</SelectItem>
                          <SelectItem value="physics" className="cursor-pointer">Physics</SelectItem>
                          <SelectItem value="chemistry" className="cursor-pointer">Chemistry</SelectItem>
                          <SelectItem value="biology" className="cursor-pointer"> Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type */}
                    <div className="relative">
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Question Type</Label>
                      <Select value={newQuestion.type} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                          <SelectItem value="mcq" className="cursor-pointer">Multiple Choice</SelectItem>
                          <SelectItem value="truefalse" className="cursor-pointer">True/False</SelectItem>
                          <SelectItem value="short" className="cursor-pointer">Short Answer</SelectItem>
                          <SelectItem value="long" className="cursor-pointer">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Difficulty */}
                    <div className="relative">
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Difficulty Level</Label>
                      <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                          <SelectItem value="easy" className="cursor-pointer">Easy</SelectItem>
                          <SelectItem value="medium" className="cursor-pointer"> Medium</SelectItem>
                          <SelectItem value="hard" className="cursor-pointer">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Marks */}
                    <div className="relative">
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Points</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={newQuestion.marks}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                        className="h-12 border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* MCQ Options */}
                {newQuestion.type === 'mcq' && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-inner">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                      Answer Options
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-3">
                      {newQuestion.options.map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-md">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1 h-11 border-0 focus:ring-2 focus:ring-blue-500 rounded-lg bg-gray-50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: option }))}
                            className={`min-w-[120px] h-11 rounded-lg font-semibold transition-all duration-200 ${
                              newQuestion.correctAnswer === option
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 hover:from-green-600 hover:to-emerald-700 shadow-lg'
                                : 'bg-white hover:bg-blue-50 hover:border-blue-400'
                            }`}
                          >
                            {newQuestion.correctAnswer === option ? '✓ Correct' : 'Set Correct'}
                          </Button>
                          {newQuestion.options.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="h-11 w-11 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addOption}
                        className="w-full h-12 border-2 border-dashed border-blue-400 rounded-xl hover:bg-blue-50 hover:border-blue-600 transition-all text-blue-600 font-semibold"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Another Option
                      </Button>
                    </div>
                  </div>
                )}

                {/* True/False */}
                {newQuestion.type === 'truefalse' && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-inner">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                      Correct Answer
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select value={newQuestion.correctAnswer} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: value }))}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white shadow-sm">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                        <SelectItem value="True" className="cursor-pointer">✓ True</SelectItem>
                        <SelectItem value="False" className="cursor-pointer">✗ False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Modern Footer with Actions */}
              <div className="flex-shrink-0 px-8 py-6 bg-white border-t-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 h-12 rounded-xl border-2 hover:bg-gray-50 transition-all font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateQuestion}
                      className="px-8 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Create Question
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Question Dialog */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-blue-200 shadow-2xl">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                  View Question
                </DialogTitle>
              </DialogHeader>
              
              {selectedQuestion && (
                <div className="space-y-6 py-6">
                  {/* Question Details */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Question</Label>
                      <p className="mt-2 text-lg text-gray-900 bg-gray-50 p-4 rounded-lg border">{selectedQuestion.questionText}</p>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Subject</Label>
                        <Badge variant="outline" className="mt-2">{selectedQuestion.subject}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Type</Label>
                        <Badge variant="secondary" className="mt-2">{selectedQuestion.type}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Difficulty</Label>
                        <Badge className={`mt-2 ${getDifficultyColor(selectedQuestion.difficulty)}`}>{selectedQuestion.difficulty}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Marks</Label>
                        <p className="mt-2 text-lg font-bold text-blue-600">{selectedQuestion.marks}</p>
                      </div>
                    </div>

                    {/* Options for MCQ */}
                    {selectedQuestion.type === 'mcq' && selectedQuestion.options && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600 mb-3 block">Answer Options</Label>
                        <div className="space-y-2">
                          {selectedQuestion.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                                option === selectedQuestion.correctAnswer
                                  ? 'bg-green-50 border-green-500'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="flex-1 text-gray-900">{option}</span>
                              {option === selectedQuestion.correctAnswer && (
                                <Badge className="bg-green-500">✓ Correct</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* True/False Answer */}
                    {selectedQuestion.type === 'truefalse' && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Correct Answer</Label>
                        <Badge className="mt-2 bg-green-500 text-white">{selectedQuestion.correctAnswer}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setShowViewModal(false)} className="px-6">
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Question Dialog */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 bg-white border-2 border-indigo-200 shadow-2xl">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-b-2 border-indigo-200">
                <DialogHeader className="px-8 pt-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Edit className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                        Edit Question
                      </DialogTitle>
                      <DialogDescription className="text-base text-gray-600">
                        Update your question details
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="group">
                  <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">1</div>
                    Question Text
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={editQuestion.questionText}
                    onChange={(e) => setEditQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder="Enter your question here..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 resize-none bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">2</div>
                    Configuration
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase">Subject *</Label>
                      <Select value={editQuestion.subject} onValueChange={(value) => setEditQuestion(prev => ({ ...prev, subject: value }))}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
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

                    <div>
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase">Type</Label>
                      <Select value={editQuestion.type} onValueChange={(value) => setEditQuestion(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="truefalse">True/False</SelectItem>
                          <SelectItem value="short">Short Answer</SelectItem>
                          <SelectItem value="long">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase">Difficulty</Label>
                      <Select value={editQuestion.difficulty} onValueChange={(value) => setEditQuestion(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase">Points</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={editQuestion.marks}
                        onChange={(e) => setEditQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                        className="h-12 border-2 border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {editQuestion.type === 'mcq' && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                      Answer Options *
                    </Label>
                    <div className="space-y-3">
                      {editQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200">
                          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <Input
                            value={option}
                            onChange={(e) => handleEditOptionChange(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1 h-11"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setEditQuestion(prev => ({ ...prev, correctAnswer: option }))}
                            className={`min-w-[120px] h-11 rounded-lg ${
                              editQuestion.correctAnswer === option
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : 'bg-white'
                            }`}
                          >
                            {editQuestion.correctAnswer === option ? '✓ Correct' : 'Set Correct'}
                          </Button>
                          {editQuestion.options.length > 2 && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => removeEditOption(index)}
                              className="h-11 w-11 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addEditOption}
                        className="w-full h-12 border-2 border-dashed border-indigo-400 rounded-xl"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                {editQuestion.type === 'truefalse' && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                      Correct Answer *
                    </Label>
                    <Select value={editQuestion.correctAnswer} onValueChange={(value) => setEditQuestion(prev => ({ ...prev, correctAnswer: value }))}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent className="!z-[99999]" position="popper" sideOffset={5}>
                        <SelectItem value="True">✓ True</SelectItem>
                        <SelectItem value="False">✗ False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 px-8 py-6 bg-white border-t-2 border-indigo-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 h-12 rounded-xl border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateQuestion}
                      className="px-8 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Update Question
                    </Button>
                  </div>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewQuestion(question)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                          className="hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
