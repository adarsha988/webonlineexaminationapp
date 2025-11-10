import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Trash2, 
  Eye, 
  Calendar, 
  Award, 
  AlertCircle,
  CheckCheck,
  Filter,
  ArrowLeft,
  Inbox
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/layouts/StudentLayout';
import { studentNotificationsAPI } from '@/api/studentExams';
import { useToast } from '@/hooks/useToast';

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const studentId = user._id || user.id;
      const response = await studentNotificationsAPI.getNotifications(studentId, 1, 100);
      
      if (response.success || response.data) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const studentId = user._id || user.id;
      await studentNotificationsAPI.markAsRead(studentId, notificationId);
      await fetchNotifications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const studentId = user._id || user.id;
      await studentNotificationsAPI.markAllAsRead(studentId);
      await fetchNotifications();
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
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const studentId = user._id || user.id;
      await studentNotificationsAPI.deleteNotification(studentId, notificationId);
      await fetchNotifications();
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

  const handleViewNotification = (notification) => {
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
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam':
        return <Calendar className="h-6 w-6 text-blue-500" />;
      case 'result':
        return <Award className="h-6 w-6 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-6 w-6 text-purple-500" />;
      default:
        return <Bell className="h-6 w-6 text-indigo-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/student/dashboard')}
                  className="p-2 rounded-xl bg-white hover:bg-gray-50 shadow-md transition-all"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </motion.button>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Stay updated with your latest activities
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleMarkAllAsRead}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All as Read
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Stats and Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <Card className="px-4 py-2 border-none shadow-md bg-white">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Total: <span className="text-blue-600 font-bold">{notifications.length}</span>
                  </span>
                </div>
              </Card>
              
              <Card className="px-4 py-2 border-none shadow-md bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">
                    Unread: <span className="text-red-600 font-bold">{unreadCount}</span>
                  </span>
                </div>
              </Card>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                {['all', 'unread', 'read'].map((filterOption) => (
                  <motion.button
                    key={filterOption}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(filterOption)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filter === filterOption
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Notifications List */}
          <div className="space-y-4">
            {loading ? (
              // Loading Skeleton
              [...Array(5)].map((_, i) => (
                <Card key={i} className="p-6 border-none shadow-lg animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredNotifications.length > 0 ? (
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`p-6 border-none shadow-lg hover:shadow-2xl transition-all ${
                        !notification.isRead 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md"
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-900">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {notification.link && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewNotification(notification)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium shadow-md transition-all"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </motion.button>
                              )}
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteNotification(notification._id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-all group"
                              >
                                <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <Card className="max-w-md mx-auto p-8 border-none shadow-lg bg-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                  >
                    <Inbox className="h-10 w-10 text-gray-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {filter === 'all' 
                      ? "You're all caught up! We'll notify you when something new arrives."
                      : `You don't have any ${filter} notifications at the moment.`
                    }
                  </p>
                  {filter !== 'all' && (
                    <Button
                      onClick={() => setFilter('all')}
                      variant="outline"
                      className="border-2"
                    >
                      View All Notifications
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Notifications;
