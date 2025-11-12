import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import Header from '../../components/home/Header';
// @ts-ignore
import HomePage from '../../components/home/HomePage';
// @ts-ignore
import Footer from '../../components/home/Footer';
// @ts-ignore
import AuthModal from '../../components/auth/AuthModal';
import { checkAuth } from '../../store/authSlice';
// @ts-ignore
import type { RootState, AppDispatch } from '../../store/store';

interface GuestHomepageProps {
  initialAuthMode?: 'login' | 'signup';
}

const GuestHomepage = ({ initialAuthMode = 'signup' }: GuestHomepageProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!!initialAuthMode);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialAuthMode || 'login');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const hasRedirected = useRef(false);
  
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user && !isLoading && !hasRedirected.current) {
      dispatch(checkAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && user.role && !isLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      const dashboardRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard'
      };
      const targetRoute = dashboardRoutes[user.role] || '/student/dashboard';
      navigate(targetRoute, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isLoading]);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    // If we're on /login route and modal is closed, redirect to home
    if (initialAuthMode && window.location.pathname === '/login') {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenAuth={openAuthModal} />
      
      <main>
        <HomePage onOpenAuth={openAuthModal} />
      </main>

      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default GuestHomepage;
