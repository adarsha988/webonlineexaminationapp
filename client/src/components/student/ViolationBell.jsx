import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Camera,
  Users,
  Eye,
  Monitor,
  Mic,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useViolations } from '@/contexts/ViolationContext';

const ViolationBell = () => {
  const navigate = useNavigate();
  const { violations, unreadCount, markAsRead, markAllAsRead } = useViolations();
  const [isOpen, setIsOpen] = useState(false);

  const recentViolations = violations.slice(0, 5);

  const getViolationIcon = (eventType) => {
    const iconProps = { className: "w-4 h-4" };
    switch (eventType) {
      case 'no_face':
      case 'face_not_detected':
        return <Camera {...iconProps} />;
      case 'multiple_faces':
        return <Users {...iconProps} />;
      case 'tab_switch':
      case 'window_blur':
        return <Monitor {...iconProps} />;
      case 'gaze_away':
        return <Eye {...iconProps} />;
      case 'mic_muted':
        return <Mic {...iconProps} />;
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Violation Alerts
                  </h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-white text-orange-600">
                      {unreadCount} New
                    </Badge>
                  )}
                </div>
                <p className="text-sm opacity-90">
                  Monitoring alerts from your exams
                </p>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {recentViolations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No violations</p>
                    <p className="text-sm text-gray-400 mt-1">
                      You're following all exam protocols!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentViolations.map((violation) => (
                      <motion.div
                        key={violation.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !violation.read ? 'bg-orange-50/50' : ''
                        }`}
                        onClick={() => {
                          markAsRead(violation.id);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(violation.severity)}`}>
                            {getViolationIcon(violation.eventType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getSeverityColor(violation.severity)} border`}
                              >
                                {violation.severity?.toUpperCase()}
                              </Badge>
                              {!violation.read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {violation.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatTime(violation.timestamp)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {violations.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/student/violations');
                    }}
                    className="ml-auto flex items-center gap-1 text-xs"
                  >
                    View All
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViolationBell;
