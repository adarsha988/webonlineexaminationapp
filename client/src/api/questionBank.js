import axios from 'axios';

// Create axios instance with relative URLs to use Vite proxy
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Question Bank API functions
export const questionBankAPI = {
  // Get questions with filters and pagination
  getQuestions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.scope && { scope: params.scope }),
        ...(params.sharedBankId && { sharedBankId: params.sharedBankId }),
        ...(params.search && { search: params.search }),
        ...(params.subject && { subject: params.subject }),
        ...(params.difficulty && { difficulty: params.difficulty }),
        ...(params.type && { type: params.type }),
        ...(params.status && { status: params.status }),
      });

      const response = await api.get(`/api/questions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error.response?.data || error;
    }
  },

  // Create new question
  createQuestion: async (questionData) => {
    try {
      const response = await api.post('/api/questions', questionData);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error.response?.data || error;
    }
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/api/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error.response?.data || error;
    }
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/api/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error.response?.data || error;
    }
  },

  // Bulk import questions
  importQuestions: async (file, scope = 'private', sharedBankId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scope', scope);
      if (sharedBankId) {
        formData.append('sharedBankId', sharedBankId);
      }

      const response = await api.post('/api/questions/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing questions:', error);
      throw error.response?.data || error;
    }
  },

  // Export questions
  exportQuestions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        format: params.format || 'csv',
        ...(params.scope && { scope: params.scope }),
        ...(params.sharedBankId && { sharedBankId: params.sharedBankId }),
        ...(params.subject && { subject: params.subject }),
        ...(params.difficulty && { difficulty: params.difficulty }),
        ...(params.type && { type: params.type }),
        ...(params.status && { status: params.status }),
      });

      const response = await api.get(`/api/questions/export?${queryParams}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `questions_export.${params.format || 'csv'}`;
      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      console.error('Error exporting questions:', error);
      throw error.response?.data || error;
    }
  },

  // Download import template
  downloadTemplate: async (format = 'csv') => {
    try {
      const response = await api.get(`/api/questions/template?format=${format}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `question_import_template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Template downloaded successfully' };
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error.response?.data || error;
    }
  },

  // Get shared banks
  getSharedBanks: async () => {
    try {
      const response = await api.get('/api/shared-banks');
      return response.data;
    } catch (error) {
      console.error('Error fetching shared banks:', error);
      throw error.response?.data || error;
    }
  },

  // Get approved questions from shared banks
  getApprovedQuestions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.search && { search: params.search }),
        ...(params.subject && { subject: params.subject }),
        ...(params.difficulty && { difficulty: params.difficulty }),
        ...(params.type && { type: params.type }),
      });

      const response = await api.get(`/api/shared-banks/approved-questions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approved questions:', error);
      throw error.response?.data || error;
    }
  }
};

export default questionBankAPI;
