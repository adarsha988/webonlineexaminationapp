import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import InstructorLayout from '../../layouts/InstructorLayout';
import { fetchExamById, fetchExamQuestions, addQuestion, updateExam } from '../../store/examSlice';

const QuestionBuilder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: examId } = useParams();
  const { toast } = useToast();
  
  const { currentExam, questions, isLoading } = useSelector((state) => state.exam);
  
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple_choice',
    text: '',
    description: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    sampleAnswers: [''],
    points: 1,
    order: 1,
  });

  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    if (examId) {
      dispatch(fetchExamById(examId));
      dispatch(fetchExamQuestions(examId));
    }
  }, [examId, dispatch]);

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentQuestion(prev => ({
        ...prev,
        order: questions.length + 1
      }));
    }
  }, [questions.length]);

  const handleInputChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSampleAnswerChange = (index, value) => {
    const newSampleAnswers = [...currentQuestion.sampleAnswers];
    newSampleAnswers[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      sampleAnswers: newSampleAnswers
    }));
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const addSampleAnswer = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      sampleAnswers: [...prev.sampleAnswers, '']
    }));
  };

  const removeSampleAnswer = (index) => {
    if (currentQuestion.sampleAnswers.length > 1) {
      const newSampleAnswers = currentQuestion.sampleAnswers.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        sampleAnswers: newSampleAnswers
      }));
    }
  };

  const handleSaveQuestion = async () => {
    if (!currentQuestion.text.trim()) {
      toast({
        title: 'Missing Question Text',
        description: 'Please enter the question text.',
        variant: 'destructive',
      });
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && 
        (!currentQuestion.correctAnswer || currentQuestion.options.some(opt => !opt.trim()))) {
      toast({
        title: 'Incomplete Multiple Choice',
        description: 'Please fill in all options and select the correct answer.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dispatch(addQuestion({
        examId,
        questionData: currentQuestion
      })).unwrap();

      toast({
        title: 'Question Added',
        description: 'Question has been added successfully.',
      });

      setCurrentQuestion({
        type: 'multiple_choice',
        text: '',
        description: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        sampleAnswers: [''],
        points: 1,
        order: questions.length + 2,
      });
      setEditingIndex(-1);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error || 'Failed to save question.',
        variant: 'destructive',
      });
    }
  };

  const handlePublishExam = async () => {
    if (questions.length === 0) {
      toast({
        title: 'No Questions',
        description: 'Please add at least one question before publishing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dispatch(updateExam({
        examId,
        examData: { status: 'active' }
      })).unwrap();

      toast({
        title: 'Exam Published',
        description: 'Your exam is now active and ready for students.',
      });

      navigate('/instructor/dashboard');
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: error || 'Failed to publish exam.',
        variant: 'destructive',
      });
    }
  };

  const renderQuestionForm = () => (
    <div className="space-y-6 relative z-10">
      {/* Question Type */}
      <div className="relative z-[60]">
        <Label htmlFor="question-type" className="text-sm font-semibold text-foreground">Question Type</Label>
        <Select 
          value={currentQuestion.type} 
          onValueChange={(value) => handleInputChange('type', value)}
        >
          <SelectTrigger id="question-type" className="mt-2 border rounded-md focus:ring-2 focus:ring-primary">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="z-[9999] bg-background shadow-lg border rounded-md">
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question Text */}
      <div>
        <Label htmlFor="question-text" className="text-sm font-semibold text-foreground">Question Text *</Label>
        <Textarea
          id="question-text"
          value={currentQuestion.text}
          onChange={(e) => handleInputChange('text', e.target.value)}
          placeholder="Enter your question..."
          className="mt-2 rounded-md border focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="question-description" className="text-sm font-semibold text-foreground">Additional Instructions</Label>
        <Textarea
          id="question-description"
          value={currentQuestion.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Optional additional instructions..."
          className="mt-2 rounded-md border focus:ring-2 focus:ring-primary"
          rows={2}
        />
      </div>

      {/* Points */}
      <div>
        <Label htmlFor="question-points" className="text-sm font-semibold text-foreground">Points</Label>
        <Input
          id="question-points"
          type="number"
          min="1"
          max="20"
          value={currentQuestion.points}
          onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 1)}
          className="mt-2 w-32 border rounded-md focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Multiple Choice Section */}
      {currentQuestion.type === 'multiple_choice' && (
        <div className="relative z-20">
          <Label className="text-sm font-semibold text-foreground">Answer Options</Label>
          <div className="mt-4 space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border rounded-md focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  variant={currentQuestion.correctAnswer === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('correctAnswer', option)}
                  className={`min-w-[90px] transition-all ${
                    currentQuestion.correctAnswer === option
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : ''
                  }`}
                >
                  {currentQuestion.correctAnswer === option ? '✓ Correct' : 'Mark'}
                </Button>
                {currentQuestion.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-3 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
      )}

      {/* True/False */}
      {currentQuestion.type === 'true_false' && (
        <div className="relative z-[50]">
          <Label htmlFor="correct-answer-select" className="text-sm font-semibold text-foreground">Correct Answer</Label>
          <Select 
            value={currentQuestion.correctAnswer} 
            onValueChange={(value) => handleInputChange('correctAnswer', value)}
          >
            <SelectTrigger id="correct-answer-select" className="mt-2 border rounded-md focus:ring-2 focus:ring-primary w-48">
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-background shadow-lg border rounded-md">
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Short Answer */}
      {currentQuestion.type === 'short_answer' && (
        <div>
          <Label className="text-sm font-semibold text-foreground">Sample Answers (for AI grading)</Label>
          <div className="mt-3 space-y-3">
            {currentQuestion.sampleAnswers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={answer}
                  onChange={(e) => handleSampleAnswerChange(index, e.target.value)}
                  placeholder={`Sample answer ${index + 1}`}
                  className="flex-1 border rounded-md focus:ring-2 focus:ring-primary"
                />
                {currentQuestion.sampleAnswers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSampleAnswer(index)}
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSampleAnswer}
              className="mt-2 w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Answer
            </Button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-4 border-t border-border">
        <Button onClick={handleSaveQuestion} disabled={isLoading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {editingIndex >= 0 ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </div>
  );

  if (isLoading || !currentExam) {
    return (
      <InstructorLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/instructor/dashboard')}
              className="rounded-lg shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{currentExam.title}</h1>
              <p className="text-sm text-muted-foreground">Add and manage questions for this exam</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="rounded-lg shadow-sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handlePublishExam} className="rounded-lg shadow-md bg-primary text-white hover:bg-primary/90">
              Publish Exam
            </Button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border border-border rounded-xl hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Add New Question</CardTitle>
              </CardHeader>
              <CardContent>
                {renderQuestionForm()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-md border rounded-xl">
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
                {questions.length > 0 ? (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              Q{index + 1}: {question.type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {question.text}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">
                            {question.points} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No questions added yet.</p>
                    <p className="text-sm mt-1">Start by adding your first question.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border rounded-xl">
              <CardHeader>
                <CardTitle>Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-medium text-foreground">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Points:</span>
                  <span className="font-medium text-foreground">
                    {questions.reduce((sum, q) => sum + q.points, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium text-foreground">{currentExam.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${
                    currentExam.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {currentExam.status === 'active' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default QuestionBuilder;
