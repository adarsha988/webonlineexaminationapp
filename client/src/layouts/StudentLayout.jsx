import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import LogoutModal from '../components/LogoutModal';
import NotificationDropdown from '../components/student/NotificationDropdown';
import ViolationBell from '../components/student/ViolationBell';
import { studentNotificationsAPI } from '@/api/studentExams';

const StudentLayout = ({ children }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const studentId = user._id || user.id;
      const response = await studentNotificationsAPI.getNotifications(studentId, 1, 10);
      if (response.success || response.data) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Animated Header */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/student/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Online Examination System
                </h1>
                <p className="text-xs text-gray-500 font-medium">Student Portal</p>
              </div>
            </motion.div>
            
            {/* User Info, Notifications & Logout */}
            <div className="flex items-center gap-3">
              {/* User Avatar & Name */}
              <motion.div 
                className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500">Student</span>
                </div>
              </motion.div>

              {/* Notification Dropdown */}
              <NotificationDropdown 
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={fetchNotifications}
              />

              {/* Violation Bell */}
              <ViolationBell />

              {/* Logout Button */}
              <motion.button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 rounded-xl font-medium text-sm border border-red-100 transition-all shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
      
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
      
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
};

export default StudentLayout;