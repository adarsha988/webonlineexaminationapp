import api from './axios';

/**
 * API functions for completed exams management
 */
const API_BASE_URL = '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

export const completedExamsAPI = {
  /**
   * Fetch all completed exams for an instructor
   * @param {string} instructorId - The instructor's ID
   * @returns {Promise} API response with completed exams
   */
  fetchCompletedExams: async (instructorId) => {
    try {
      const response = await api.get(`/instructor/${instructorId}/exams/completed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed exams:', error);
      throw error;
    }
  },

  /**
   * Get instructor's completed exams with grading information
   * @param {string} instructorId - The instructor's ID
   * @returns {Promise} API response with completed exams
   */
  getInstructorCompletedExams: async (instructorId) => {
    try {
      const response = await api.get(`/api/instructor/grading/completed-exams/${instructorId}`);
      return response;
    } catch (error) {
      console.error('Error fetching instructor completed exams:', error);
      throw error;
    }
  },

  /**
   * Fetch exam details with submissions
   * @param {string} examId - The exam ID
   * @returns {Promise} API response with exam and submissions
   */
  getExamSubmissions: async (examId) => {
    try {
      const response = await api.get(`/api/exams/${examId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam submissions:', error);
      throw error;
    }
  },

  /**
   * Fetch detailed submission for grading
   * @param {string} examId - The exam ID
   * @param {string} submissionId - The submission ID
   * @returns {Promise} API response with submission details
   */
  getSubmissionDetail: async (examId, submissionId) => {
    try {
      const response = await api.get(`/api/exams/${examId}/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      throw error;
    }
  },

  /**
   * Save marks and feedback for a submission
   * @param {string} examId - The exam ID
   * @param {string} submissionId - The submission ID
   * @param {Object} gradingData - Marks and feedback data
   * @returns {Promise} API response
   */
  saveMarks: async (examId, submissionId, gradingData) => {
    try {
      const response = await api.put(`/api/exams/${examId}/submissions/${submissionId}/marks`, gradingData);
      return response.data;
    } catch (error) {
      console.error('Error saving marks:', error);
      throw error;
    }
  },

  /**
   * Generate report for a student's submission
   * @param {string} examId - The exam ID
   * @param {string} submissionId - The submission ID
   * @returns {Promise} API response with report data
   */
  generateReport: async (examId, submissionId) => {
    try {
      const response = await api.post(`/api/exams/${examId}/submissions/${submissionId}/report`);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  /**
   * Send report card to student via email
   * @param {string} examId - The exam ID
   * @param {string} submissionId - The submission ID
   * @returns {Promise} API response
   */
  sendReportCard: async (examId, submissionId) => {
    try {
      const response = await api.post(`/api/exams/${examId}/submissions/${submissionId}/send-report`);
      return response.data;
    } catch (error) {
      console.error('Error sending report card:', error);
      throw error;
    }
  },

  /**
   * Export exam results to CSV
   * @param {string} examId - The exam ID
   * @returns {Promise} API response with CSV data
   */
  exportResults: async (examId) => {
    try {
      const response = await api.get(`/api/exams/${examId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting results:', error);
      throw error;
    }
  },

  /**
   * Get grading statistics for an exam
   * @param {string} examId - The exam ID
   * @returns {Promise} API response with statistics
   */
  getGradingStats: async (examId) => {
    try {
      const response = await api.get(`/api/exams/${examId}/grading-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grading stats:', error);
      throw error;
    }
  }
};
