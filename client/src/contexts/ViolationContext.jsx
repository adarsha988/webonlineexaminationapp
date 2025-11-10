import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Camera, Users, Eye, Monitor, Mic } from 'lucide-react';

const ViolationContext = createContext();

export const useViolations = () => {
  const context = useContext(ViolationContext);
  if (!context) {
    throw new Error('useViolations must be used within ViolationProvider');
  }
  return context;
};

export const ViolationProvider = ({ children }) => {
  const { toast } = useToast();
  const [violations, setViolations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getViolationIcon = (eventType) => {
    const iconProps = { className: "w-5 h-5" };
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

  const getViolationColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const addViolation = useCallback((violation) => {
    const newViolation = {
      ...violation,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setViolations(prev => [newViolation, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title: (
        <div className="flex items-center gap-2">
          {getViolationIcon(violation.eventType)}
          <span>Violation Detected</span>
        </div>
      ),
      description: (
        <div className="mt-2">
          <p className="font-semibold">{violation.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            This has been reported to your instructor
          </p>
        </div>
      ),
      variant: getViolationColor(violation.severity),
      duration: 5000
    });
  }, [toast]);

  const markAsRead = useCallback((violationId) => {
    setViolations(prev =>
      prev.map(v =>
        v.id === violationId ? { ...v, read: true } : v
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setViolations(prev => prev.map(v => ({ ...v, read: true })));
    setUnreadCount(0);
  }, []);

  const clearViolations = useCallback(() => {
    setViolations([]);
    setUnreadCount(0);
  }, []);

  const value = {
    violations,
    unreadCount,
    addViolation,
    markAsRead,
    markAllAsRead,
    clearViolations
  };

  return (
    <ViolationContext.Provider value={value}>
      {children}
    </ViolationContext.Provider>
  );
};

export default ViolationContext;
