import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/home/Header';
import HomePage from '../../components/home/HomePage';
import Footer from '../../components/home/Footer';
import AuthModal from '../../components/auth/AuthModal';
import { checkAuth } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store/store';

interface GuestHomepageProps {
  initialAuthMode?: 'login' | 'signup';
}

const GuestHomepage = ({ initialAuthMode = 'signup' }: GuestHomepageProps) => {
  console.log('🏠 GUEST HOMEPAGE: Component rendering with initialAuthMode:', initialAuthMode);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!!initialAuthMode);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialAuthMode || 'login');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const hasRedirected = useRef(false);
  
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check auth ONLY on mount if we have a token but no user data
    const token = localStorage.getItem('token');
    if (token && !user && !isLoading && !hasRedirected.current) {
      console.log('🔍 HOMEPAGE: Token exists but no user data - checking authentication');
      dispatch(checkAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (isAuthenticated && user && user.role && !isLoading && !hasRedirected.current) {
      console.log('🏠 HOMEPAGE: Redirecting authenticated user:', user.role);
      hasRedirected.current = true;
      
      const dashboardRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard'
      };
      const targetRoute = dashboardRoutes[user.role] || '/student/dashboard';
      console.log('🏠 HOMEPAGE: Redirecting to:', targetRoute);
      
      setTimeout(() => {
        navigate(targetRoute, { replace: true });
      }, 0);
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
