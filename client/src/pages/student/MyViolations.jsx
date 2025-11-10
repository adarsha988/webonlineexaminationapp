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
  Clock,
  Shield,
  TrendingDown,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import StudentLayout from '@/layouts/StudentLayout';
import axios from 'axios';

const MyViolations = () => {
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  useEffect(() => {
    fetchMyViolations();
  }, []);

  const fetchMyViolations = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/proctoring/violations/student/${user._id}`, {
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
        description: "Failed to load your violations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (violationsData) => {
    const stats = {
      total: violationsData.length,
      high: violationsData.filter(v => v.severity === 'high').length,
      medium: violationsData.filter(v => v.severity === 'medium').length,
      low: violationsData.filter(v => v.severity === 'low').length
    };
    setStats(stats);
  };

  const getFilteredViolations = () => {
    if (filter === 'all') return violations;
    
    const now = new Date();
    return violations.filter(v => {
      const violationDate = new Date(v.timestamp);
      if (filter === 'today') {
        return violationDate.toDateString() === now.toDateString();
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return violationDate >= weekAgo;
      }
      return true;
    });
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

  const filteredViolations = getFilteredViolations();

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your violations...</p>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Violations
              </h1>
              <p className="text-gray-600 mt-1">Review your exam monitoring alerts</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
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
              <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white">
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
              <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Medium Severity</p>
                      <p className="text-3xl font-bold">{stats.medium}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Low Severity</p>
                      <p className="text-3xl font-bold">{stats.low}</p>
                    </div>
                    <Eye className="w-8 h-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filter */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </select>
                <span className="text-sm text-gray-600">
                  {filteredViolations.length} violation{filteredViolations.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Violations List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Violation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredViolations.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No violations found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {violations.length === 0
                      ? "Great job! You're following all exam protocols"
                      : "Try adjusting the filter"}
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
                                <Badge variant="outline" className="text-xs">
                                  {violation.eventType?.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge className={`${getSeverityColor(violation.severity)} border text-xs`}>
                                  {violation.severity?.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-800 mb-2 font-medium">
                                {violation.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatTimestamp(violation.timestamp)}
                                </span>
                                <span>•</span>
                                <span>{violation.examId?.title || 'Exam'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                How to Avoid Violations
              </h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Keep your face visible in the camera frame at all times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Look directly at your screen - avoid looking away</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Don't switch tabs or minimize your browser window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Keep your microphone unmuted throughout the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Ensure you're alone in the room - no multiple faces</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default MyViolations;
