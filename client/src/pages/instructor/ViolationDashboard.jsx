import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Eye, 
  Users, 
  Monitor, 
  Camera, 
  Mic,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
  Shield,
  Search,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';

const ViolationDashboard = () => {
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    uniqueStudents: 0,
    activeExams: 0
  });

  useEffect(() => {
    fetchViolations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchViolations(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [violations, filter, searchTerm, dateFilter]);

  const fetchViolations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const response = await axios.get('/api/proctoring/violations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setViolations(response.data.data || []);
        calculateStats(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch violations:', error);
      toast({
        title: "Error",
        description: "Failed to load violations data",
        variant: "destructive",
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const calculateStats = (violationsData) => {
    const stats = {
      total: violationsData.length,
      high: violationsData.filter(v => v.severity === 'high').length,
      medium: violationsData.filter(v => v.severity === 'medium').length,
      low: violationsData.filter(v => v.severity === 'low').length,
      uniqueStudents: new Set(violationsData.map(v => v.studentId?._id || v.studentId)).size,
      activeExams: new Set(violationsData.map(v => v.examId?._id || v.examId)).size
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...violations];

    // Severity filter
    if (filter !== 'all') {
      filtered = filtered.filter(v => v.severity === filter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.studentId?.name?.toLowerCase().includes(term) ||
        v.description?.toLowerCase().includes(term) ||
        v.eventType?.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(v => {
        const violationDate = new Date(v.timestamp);
        switch (dateFilter) {
          case 'today':
            return violationDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return violationDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return violationDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredViolations(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getViolationIcon = (eventType) => {
    switch (eventType) {
      case 'no_face':
      case 'face_not_detected':
        return <Camera className="w-4 h-4" />;
      case 'multiple_faces':
        return <Users className="w-4 h-4" />;
      case 'tab_switch':
      case 'window_blur':
        return <Monitor className="w-4 h-4" />;
      case 'gaze_away':
        return <Eye className="w-4 h-4" />;
      case 'mic_muted':
        return <Mic className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToCSV = () => {
    const csv = [
      ['Student', 'Exam', 'Type', 'Severity', 'Description', 'Timestamp'],
      ...filteredViolations.map(v => [
        v.studentId?.name || 'Unknown',
        v.examId?.title || 'Unknown',
        v.eventType,
        v.severity,
        v.description,
        formatTimestamp(v.timestamp)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading violations data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Violation Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage exam integrity violations</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchViolations(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Violations</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">High Severity</p>
                    <p className="text-3xl font-bold">{stats.high}</p>
                  </div>
                  <Shield className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Unique Students</p>
                    <p className="text-3xl font-bold">{stats.uniqueStudents}</p>
                  </div>
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Active Exams</p>
                    <p className="text-3xl font-bold">{stats.activeExams}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Severity Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {filteredViolations.length} result{filteredViolations.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Violation Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredViolations.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No violations found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {violations.length === 0 
                    ? "All students are following exam protocols"
                    : "Try adjusting your filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredViolations.map((violation, index) => (
                    <motion.div
                      key={violation._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getSeverityColor(violation.severity)}`}>
                            {getViolationIcon(violation.eventType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {violation.studentId?.name || 'Unknown Student'}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {violation.eventType?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {violation.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatTimestamp(violation.timestamp)}
                              </span>
                              <span>•</span>
                              <span>{violation.examId?.title || 'Unknown Exam'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getSeverityColor(violation.severity)} border`}>
                            {violation.severity?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViolationDashboard;
