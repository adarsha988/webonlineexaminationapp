import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Camera,
  Monitor,
  Users,
  Clock,
  Shield,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import InstructorLayout from '../../layouts/InstructorLayout';
import axios from 'axios';

const ProctoringReport = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  const [submission, setSubmission] = useState(null);
  const [proctoringLogs, setProctoringLogs] = useState([]);
  const [violationSummary, setViolationSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'violations', 'warnings'

  useEffect(() => {
    if (submissionId) {
      fetchProctoringData();
    }
  }, [submissionId]);

  const fetchProctoringData = async () => {
    try {
      setLoading(true);

      // Fetch submission details
      const submissionResponse = await axios.get(`/api/instructor/grading/submission/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (submissionResponse.data.success) {
        setSubmission(submissionResponse.data.data);
      }

      // Fetch proctoring logs (if there's an attempt ID)
      // For now, we'll simulate this data
      const mockLogs = generateMockLogs();
      setProctoringLogs(mockLogs);

      const mockSummary = generateMockSummary(mockLogs);
      setViolationSummary(mockSummary);

    } catch (error) {
      console.error('Error fetching proctoring data:', error);
      toast({
        title: "Error",
        description: "Failed to load proctoring report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    const eventTypes = [
      { type: 'session_start', severity: 'info', description: 'Proctoring session started' },
      { type: 'no_face', severity: 'medium', description: 'No face detected for 12 seconds' },
      { type: 'tab_switch', severity: 'high', description: 'Student switched tabs' },
      { type: 'gaze_away', severity: 'low', description: 'Student looking away for 7 seconds' },
      { type: 'window_blur', severity: 'medium', description: 'Student switched focus away from exam' },
      { type: 'multiple_faces', severity: 'high', description: 'Multiple faces detected for 15 seconds' },
      { type: 'tab_switch', severity: 'high', description: 'Student switched tabs' },
      { type: 'session_end', severity: 'info', description: 'Proctoring session ended' }
    ];

    return eventTypes.map((event, index) => ({
      _id: `log_${index}`,
      eventType: event.type,
      severity: event.severity,
      description: event.description,
      timestamp: new Date(Date.now() - (eventTypes.length - index) * 5 * 60 * 1000).toISOString(),
      metadata: {
        duration: event.type.includes('face') || event.type.includes('gaze') ? 
          Math.floor(Math.random() * 20) + 5 : null
      }
    }));
  };

  const generateMockSummary = (logs) => {
    const violations = logs.filter(log => 
      ['no_face', 'multiple_faces', 'tab_switch', 'window_blur', 'gaze_away'].includes(log.eventType)
    );

    const violationsByType = violations.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity === 'high').length,
      suspicionScore: Math.min((violations.length * 15) + (violations.filter(v => v.severity === 'high').length * 10), 100),
      integrityRating: Math.max(100 - (violations.length * 15), 0),
      violationsByType
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'no_face':
      case 'multiple_faces':
      case 'face_mismatch':
        return <Camera className="w-5 h-5" />;
      case 'gaze_away':
        return <Eye className="w-5 h-5" />;
      case 'tab_switch':
      case 'window_blur':
      case 'fullscreen_exit':
        return <Monitor className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getIntegrityBadge = (rating) => {
    if (rating >= 80) return { text: 'High Integrity', color: 'bg-green-100 text-green-800' };
    if (rating >= 50) return { text: 'Moderate Integrity', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Low Integrity', color: 'bg-red-100 text-red-800' };
  };

  const filteredLogs = proctoringLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'violations') return ['no_face', 'multiple_faces', 'tab_switch', 'window_blur', 'gaze_away'].includes(log.eventType);
    if (filter === 'warnings') return log.severity === 'medium' || log.severity === 'high';
    return true;
  });

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link to={`/instructor/grading/${submissionId}`}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submission
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Proctoring Report</h1>
            <p className="text-gray-600 mt-1">
              {submission?.studentId?.name || 'Student'} • {submission?.examId?.title || 'Exam'}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        {violationSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className={`h-8 w-8 ${
                    violationSummary.integrityRating >= 80 ? 'text-green-600' :
                    violationSummary.integrityRating >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Integrity Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {violationSummary.integrityRating}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Suspicion Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {violationSummary.suspicionScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Violations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {violationSummary.totalViolations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Critical</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {violationSummary.criticalViolations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Violation Breakdown */}
        {violationSummary && Object.keys(violationSummary.violationsByType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Violation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(violationSummary.violationsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventIcon(type)}
                      <span className="font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                    </div>
                    <Badge variant="outline">{count} occurrence{count !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Events ({proctoringLogs.length})
          </Button>
          <Button 
            variant={filter === 'violations' ? 'default' : 'outline'}
            onClick={() => setFilter('violations')}
            size="sm"
          >
            Violations Only ({proctoringLogs.filter(log => 
              ['no_face', 'multiple_faces', 'tab_switch', 'window_blur', 'gaze_away'].includes(log.eventType)
            ).length})
          </Button>
          <Button 
            variant={filter === 'warnings' ? 'default' : 'outline'}
            onClick={() => setFilter('warnings')}
            size="sm"
          >
            Warnings ({proctoringLogs.filter(log => 
              log.severity === 'medium' || log.severity === 'high'
            ).length})
          </Button>
        </div>

        {/* Timeline of Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Event Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-semibold">No issues detected</p>
                  <p className="text-sm">The student maintained proper exam conduct</p>
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div 
                    key={log._id} 
                    className={`relative pl-8 pb-4 ${index !== filteredLogs.length - 1 ? 'border-l-2 border-gray-200' : ''}`}
                  >
                    <div className={`absolute left-0 -ml-3 w-6 h-6 rounded-full border-4 border-white ${
                      log.severity === 'high' || log.severity === 'critical' ? 'bg-red-500' :
                      log.severity === 'medium' ? 'bg-orange-500' :
                      log.severity === 'low' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    
                    <div className={`p-4 rounded-lg border ${getSeverityColor(log.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getEventIcon(log.eventType)}
                          <div>
                            <p className="font-semibold capitalize">
                              {log.eventType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm opacity-75">{log.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs opacity-70 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.timestamp)}
                        </span>
                        {log.metadata?.duration && (
                          <span>Duration: {log.metadata.duration}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        {violationSummary && (
          <Card className={
            violationSummary.integrityRating >= 80 ? 'border-green-200 bg-green-50' :
            violationSummary.integrityRating >= 50 ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {violationSummary.integrityRating >= 80 ? (
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {violationSummary.integrityRating >= 80 ? 'Good Exam Conduct' :
                     violationSummary.integrityRating >= 50 ? 'Moderate Concerns' :
                     'Significant Concerns'}
                  </h3>
                  <p className="text-sm">
                    {violationSummary.integrityRating >= 80 ? 
                      'The student demonstrated good exam conduct with minimal issues. The submission appears legitimate.' :
                     violationSummary.integrityRating >= 50 ?
                      'Some violations were detected. Consider reviewing the submission more carefully or contacting the student.' :
                      'Multiple significant violations were detected. This submission should be carefully reviewed and may require investigation.'}
                  </p>
                  <div className="mt-3">
                    <Badge className={getIntegrityBadge(violationSummary.integrityRating).color}>
                      {getIntegrityBadge(violationSummary.integrityRating).text}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </InstructorLayout>
  );
};

export default ProctoringReport;
