import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Check, CheckCheck, Trash2, Eye, Calendar, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { studentNotificationsAPI } from '@/api/studentExams';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = ({ notifications, unreadCount, onMarkAsRead }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = async (notificationId) => {
    try {
      if (!user?._id && !user?.id) {
        console.error('User not found');
        return;
      }
      await studentNotificationsAPI.markAsRead(user._id || user.id, notificationId);
      onMarkAsRead();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      if (!user?._id && !user?.id) {
        toast({
          title: "Error",
          description: "User not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      await studentNotificationsAPI.deleteNotification(user._id || user.id, notificationId);
      onMarkAsRead(); // Refresh notifications
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!user?._id && !user?.id) {
        toast({
          title: "Error",
          description: "User not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      await studentNotificationsAPI.markAllAsRead(user._id || user.id);
      onMarkAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleViewNotification = (notification, event) => {
    event.stopPropagation();
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    setIsOpen(false);
    
    // Check if notification is about exam results
    if (notification.type === 'exam_result' || notification.type === 'result' || 
        notification.message.toLowerCase().includes('result') || 
        notification.title.toLowerCase().includes('result')) {
      // Extract exam ID from notification metadata or message
      const examId = notification.metadata?.examId || notification.examId;
      if (examId) {
        navigate(`/student/exam/${examId}/result`);
      } else {
        // Fallback to general results page
        navigate('/student/exams/completed');
      }
    } else if (notification.type === 'exam_reminder' || notification.type === 'exam') {
      // Navigate to exam if it's a reminder
      const examId = notification.metadata?.examId || notification.examId;
      if (examId) {
        navigate(`/student/exam/${examId}`);
      } else {
        navigate('/student/dashboard');
      }
    } else if (notification.link) {
      // Use provided link
      navigate(notification.link);
    } else {
      // Default fallback - go to notifications tab on dashboard
      navigate('/student/dashboard');
      // Use a timeout to switch to notifications tab
      setTimeout(() => {
        const notificationsTab = document.querySelector('[value="notifications"]');
        if (notificationsTab) {
          notificationsTab.click();
        }
      }, 100);
    }
    
    toast({
      title: "Viewing notification",
      description: notification.title,
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam':
      case 'exam_reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'result':
      case 'exam_result':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-indigo-500" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all shadow-md hover:shadow-lg border border-blue-100"
      >
        <Bell className="h-5 w-5 text-blue-600" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <span className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-bold text-lg">Notifications</h3>
                  </div>
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAllAsRead}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all backdrop-blur-sm"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <>
                    {notifications.slice(0, 5).map((notification, index) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center"
                          >
                            {getNotificationIcon(notification.type)}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => handleViewNotification(notification, e)}
                                  className={`flex items-center gap-1 px-3 py-1 text-white text-xs font-medium rounded-lg shadow-md transition-all ${
                                    notification.type === 'exam_result' || notification.type === 'result' || 
                                    notification.message.toLowerCase().includes('result') || 
                                    notification.title.toLowerCase().includes('result')
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                                  }`}
                                >
                                  <Eye className="h-3 w-3" />
                                  {notification.type === 'exam_result' || notification.type === 'result' || 
                                   notification.message.toLowerCase().includes('result') || 
                                   notification.title.toLowerCase().includes('result')
                                    ? 'View Result'
                                    : 'View'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all group"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* View All Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/student/notifications');
                      }}
                      className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all border-t border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        View All Notifications →
                      </span>
                    </motion.button>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
                    >
                      <Bell className="h-8 w-8 text-gray-400" />
                    </motion.div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      No notifications yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      We'll notify you when something arrives
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;