import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { checkAuth } from '@/store/authSlice';
import { ViolationProvider } from '@/contexts/ViolationContext';

// Lazy load components for better performance
const GuestHomepage = lazy(() => import('@/pages/home/GuestHomepage'));
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
// Temporarily using regular import to debug dynamic import issue
import ExamTaking from '@/pages/student/ExamTaking';
const StudentAnalytics = lazy(() => import('@/pages/student/StudentAnalytics'));
const ExamResult = lazy(() => import('@/pages/student/ExamResult'));
// @ts-ignore
const StudentResults = lazy(() => import('@/pages/student/Results'));
// @ts-ignore
const StudentExamsList = lazy(() => import('@/pages/student/ExamsList'));
// @ts-ignore
const Notifications = lazy(() => import('@/pages/student/Notifications'));
// Temporarily using regular import to debug dynamic import issue
import InstructorDashboard from '@/pages/instructor/Dashboard';
const InstructorExamCreator = lazy(() => import('@/pages/instructor/ExamCreator'));
const InstructorQuestionBuilder = lazy(() => import('@/pages/instructor/QuestionBuilder'));
const QuestionBank = lazy(() => import('@/pages/instructor/QuestionBank'));
const ExamCreation = lazy(() => import('@/pages/instructor/ExamCreation'));
const ExamList = lazy(() => import('@/pages/instructor/ExamList'));
const EditExam = lazy(() => import('@/pages/instructor/EditExam'));
// Temporarily using regular import to debug dynamic import issue
import AdminDashboard from '@/pages/admin/Dashboard';
const AdminUserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const StudentsPage = lazy(() => import('@/components/admin/StudentsPage'));
const InstructorsPage = lazy(() => import('@/components/admin/InstructorsPage'));
const ActiveTodayPage = lazy(() => import('@/components/admin/ActiveTodayPage'));
// Commented out unused import to be used in the future
// const SystemAnalyticsPage = lazy(() => import('@/components/admin/SystemAnalyticsPage'));
const ExamsPage = lazy(() => import('@/components/admin/ExamsPage'));
const QuestionReview = lazy(() => import('@/pages/admin/QuestionReview'));
const CompletedExams = lazy(() => import('@/pages/instructor/CompletedExams'));
const StudentSubmissions = lazy(() => import('@/pages/instructor/StudentSubmissions'));
const SubmissionDetail = lazy(() => import('@/pages/instructor/SubmissionDetail'));
const InstructorAnalytics = lazy(() => import('@/pages/instructor/Analytics'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const GlobalAnalytics = lazy(() => import('@/pages/GlobalAnalytics'));
const StudentCompletedExams = lazy(() => import('@/pages/student/CompletedExams'));
const ExamGrading = lazy(() => import('@/pages/instructor/ExamGrading'));
const ProctoringReport = lazy(() => import('@/pages/instructor/ProctoringReport'));
const ExamSecurityCheck = lazy(() => import('@/pages/student/ExamSecurityCheck'));
const ExamVerification = lazy(() => import('@/pages/student/ExamVerification'));
const MyViolations = lazy(() => import('@/pages/student/MyViolations'));
const ViolationDashboard = lazy(() => import('@/pages/instructor/ViolationDashboard'));

function AppRoutes() {
  return (
    <Routes>
      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/exam-security/:examId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ExamSecurityCheck />
        </ProtectedRoute>
      } />
      <Route path="/student/exam-verification/:examId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ExamVerification />
        </ProtectedRoute>
      } />
      <Route path="/student/violations" element={
        <ProtectedRoute allowedRoles={['student']}>
          <MyViolations />
        </ProtectedRoute>
      } />
      <Route path="/student/exam/:id" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ExamTaking />
        </ProtectedRoute>
      } />
      <Route path="/student/exam/:id/result" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ExamResult />
        </ProtectedRoute>
      } />
      <Route path="/student/analytics" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/student/exams/completed" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentCompletedExams />
        </ProtectedRoute>
      } />
      <Route path="/student/results" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentResults />
        </ProtectedRoute>
      } />
      <Route path="/student/exams" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentExamsList />
        </ProtectedRoute>
      } />
      <Route path="/student/notifications" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Notifications />
        </ProtectedRoute>
      } />
      
      {/* Instructor Routes */}
      <Route path="/instructor/dashboard" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <InstructorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/instructor/create-exam" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <InstructorExamCreator />
        </ProtectedRoute>
      } />
      <Route path="/instructor/exam/:id/questions" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <InstructorQuestionBuilder />
        </ProtectedRoute>
      } />
      <Route path="/instructor/question-bank" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <QuestionBank />
        </ProtectedRoute>
      } />
      <Route path="/instructor/exam-creation" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <ExamCreation />
        </ProtectedRoute>
      } />
      <Route path="/instructor/exams" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <ExamList />
        </ProtectedRoute>
      } />
      <Route path="/instructor/exams/:id/edit" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <EditExam />
        </ProtectedRoute>
      } />
      <Route path="/instructor/analytics" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <InstructorAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/instructor/completed-exams" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <CompletedExams />
        </ProtectedRoute>
      } />
      <Route path="/instructor/completed-exams/:examId" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <StudentSubmissions />
        </ProtectedRoute>
      } />
      <Route path="/instructor/completed-exams/:examId/submissions" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <StudentSubmissions />
        </ProtectedRoute>
      } />
      <Route path="/instructor/completed-exams/:examId/submissions/:submissionId" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <SubmissionDetail />
        </ProtectedRoute>
      } />
      <Route path="/instructor/grading/:submissionId" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}>
          <ExamGrading />
        </ProtectedRoute>
      } />
      <Route path="/instructor/proctoring/:attemptId" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <ProctoringReport />
        </ProtectedRoute>
      } />
      <Route path="/instructor/violations" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <ViolationDashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUserManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <StudentsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/instructors" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <InstructorsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ActiveTodayPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/exams" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ExamsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/question-review" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <QuestionReview />
        </ProtectedRoute>
      } />
      <Route path="/admin/system-analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminAnalytics />
        </ProtectedRoute>
      } />
      
      {/* Global Routes (role-aware) */}
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['admin', 'instructor', 'student']}>
          <GlobalAnalytics />
        </ProtectedRoute>
      } />
      
      {/* Login Route */}
      <Route path="/login" element={<GuestHomepage initialAuthMode="login" />} />
      
      {/* Guest Homepage with integrated auth - Must be last before 404 */}
      <Route path="/" element={<GuestHomepage initialAuthMode="signup" />} />
      
      {/* Fallback to 404 */}
      <Route path="*" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Page not found</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      } />
    </Routes>
  );
}

function App() {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    // Check if user is authenticated on app startup
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <TooltipProvider>
      <ViolationProvider>
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </ErrorBoundary>
      </ViolationProvider>
    </TooltipProvider>
  );
}

export default App;
