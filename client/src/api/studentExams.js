import api from './axios';

const API_BASE_URL = '/api';

// Student Exam API calls
export const studentExamAPI = {
  // Get exam lists
  getUpcomingExams: async (studentId) => {
    const response = await api.get(`${API_BASE_URL}/student/${studentId}/exams/upcoming`);
    return response.data;
  },

  getOngoingExams: async (studentId) => {
    const response = await api.get(`${API_BASE_URL}/student/${studentId}/exams/ongoing`);
    return response.data;
  },

  getCompletedExams: async (studentId, page = 1, limit = 10) => {
    const response = await api.get(`${API_BASE_URL}/student/${studentId}/exams/completed?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Exam session management
  startExam: async (examId, studentId, sessionData = {}) => {
    const response = await api.post(`${API_BASE_URL}/exam-sessions/${examId}/start`, {
      studentId,
      sessionData: {
        ipAddress: sessionData.ipAddress || 'unknown',
        userAgent: navigator.userAgent,
        browserFingerprint: sessionData.browserFingerprint || 'unknown'
      }
    });
    return response.data;
  },

  getExamSession: async (examId, studentId) => {
    const response = await api.get(`${API_BASE_URL}/exam-sessions/${examId}/session?studentId=${studentId}`);
    return response.data;
  },

  saveAnswer: async (examId, studentId, questionId, answer, timeSpent = 0) => {
    const response = await api.patch(`${API_BASE_URL}/exam-sessions/${examId}/answer`, {
      studentId,
      questionId,
      answer,
      timeSpent
    });
    return response.data;
  },

  submitExam: async (examId, studentId, finalAnswers = []) => {
    const response = await api.post(`${API_BASE_URL}/exam-sessions/${examId}/submit`, {
      studentId,
      finalAnswers
    });
    return response.data;
  },

  getExamResult: async (examId, studentId) => {
    const response = await api.get(`${API_BASE_URL}/exams/${examId}/result?studentId=${studentId}`);
    return response.data;
  },

  // Violation reporting
  reportViolation: async (examId, studentId, violationType, description = '') => {
    const response = await api.post(`${API_BASE_URL}/exam-sessions/${examId}/violation`, {
      studentId,
      violationType,
      description,
      timestamp: new Date().toISOString()
    });
    return response.data;
  }
};

// Student Analytics API calls
export const studentAnalyticsAPI = {
  getOverview: async (studentId, limit = 5) => {
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/overview?limit=${limit}`);
    return response.data;
  },

  getScoresOverTime: async (studentId, months = 6) => {
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/scores-over-time?months=${months}`);
    return response.data;
  },

  getSubjectBreakdown: async (studentId) => {
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/subject-breakdown`);
    return response.data;
  },

  getComparativeAnalysis: async (studentId, examId) => {
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/comparative/${examId}`);
    return response.data;
  },

  getDifficultyAnalysis: async (studentId) => {
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/difficulty-analysis`);
    return response.data;
  },

  getTrends: async (studentId, period = 'month') => {
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/trends?period=${period}`);
    return response.data;
  },

  exportAnalytics: async (studentId, format = 'csv') => {
    // Note: This needs special handling for blob responses
    const response = await api.get(`${API_BASE_URL}/analytics/student/${studentId}/export?format=${format}`);
    
    if (format === 'csv') {
      // Create download link for CSV
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student-analytics.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Analytics exported successfully' };
    }
    
    return response.data;
  }
};

// Student Notifications API calls
export const studentNotificationsAPI = {
  getNotifications: async (studentId, page = 1, limit = 20, unreadOnly = false) => {
    const response = await api.get(`${API_BASE_URL}/student/${studentId}/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
    return response.data;
  },

  markAsRead: async (studentId, notificationId) => {
    const response = await api.patch(`${API_BASE_URL}/student/${studentId}/notifications/${notificationId}/read`);
    return response.data;
  },

  deleteNotification: async (studentId, notificationId) => {
    const response = await api.delete(`${API_BASE_URL}/student/${studentId}/notifications/${notificationId}`);
    return response.data;
  },

  markAllAsRead: async (studentId) => {
    const response = await api.patch(`${API_BASE_URL}/notifications/read-all?studentId=${studentId}`);
    return response.data;
  }
};
