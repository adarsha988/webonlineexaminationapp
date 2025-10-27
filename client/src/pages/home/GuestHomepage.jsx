import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../../components/home/Header';
import HomePage from '../../components/home/HomePage';
import Footer from '../../components/home/Footer';
import AuthModal from '../../components/auth/AuthModal';
import { checkAuth } from '../../store/authSlice';

const GuestHomepage = ({ initialAuthMode = 'signup' }) => {
  console.log('🏠 GUEST HOMEPAGE: Component rendering with initialAuthMode:', initialAuthMode);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!!initialAuthMode);
  const [authMode, setAuthMode] = useState(initialAuthMode || 'login'); // 'login' or 'signup'
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check auth on mount if we have a token but no user data
    const token = localStorage.getItem('token');
    if (token && !user && !isLoading) {
      console.log('🔍 HOMEPAGE: Token exists but no user data - checking authentication');
      dispatch(checkAuth());
    } else if (!token && isAuthenticated) {
      // Token missing but state says authenticated - clear the state
      console.warn('⚠️ HOMEPAGE: No token but authenticated state - clearing');
      localStorage.removeItem('token');
      window.location.reload();
    }
  }, [dispatch, user, isLoading, isAuthenticated]);

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    // IMPORTANT: Only redirect if we have BOTH authentication AND user data
    if (isAuthenticated && user && user.role && !isLoading) {
      console.log('🏠 HOMEPAGE: Redirecting authenticated user:', user.role);
      const dashboardRoutes = {
        admin: '/admin/dashboard',
        instructor: '/instructor/dashboard',
        student: '/student/dashboard'
      };
      const targetRoute = dashboardRoutes[user.role] || '/student/dashboard';
      console.log('🏠 HOMEPAGE: Redirecting to:', targetRoute);
      navigate(targetRoute, { replace: true });
    } else if (isAuthenticated && !user && !isLoading) {
      // If authenticated but no user data, something went wrong - clear auth
      console.warn('⚠️ HOMEPAGE: Authenticated but no user data - clearing auth');
      localStorage.removeItem('token');
      window.location.reload();
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  const openAuthModal = (mode = 'login') => {
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
