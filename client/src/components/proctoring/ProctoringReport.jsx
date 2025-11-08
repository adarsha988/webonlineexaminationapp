import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  Download,
  Clock,
  User,
  Shield,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProctoringReport = ({ attemptId, studentName, examTitle }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);

  useEffect(() => {
    fetchProctoringReport();
  }, [attemptId]);

  const fetchProctoringReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proctoring/violations/${attemptId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching proctoring report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (score) => {
    if (score >= 75) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    if (score >= 25) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getIntegrityRating = (score) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 25) return 'Low Risk';
    return 'Clean';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      info: 'bg-gray-500'
    };
    return colors[severity] || colors.info;
  };

  const violationCategories = {
    'Face Detection Issues': ['face_not_detected', 'multiple_faces', 'face_replaced', 'face_mismatch'],
    'Gaze & Attention': ['gaze_away', 'person_left_frame'],
    'Audio Anomalies': ['multiple_voices', 'audio_anomaly'],
    'Browser Violations': ['tab_switch', 'copy_paste', 'unauthorized_action', 'right_click'],
    'Environment Issues': ['unauthorized_object', 'poor_lighting', 'camera_blocked']
  };

  const getViolationCategory = (eventType) => {
    for (const [category, types] of Object.entries(violationCategories)) {
      if (types.includes(eventType)) return category;
    }
    return 'Other';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proctoring report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center p-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">No proctoring data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold">Proctoring Report</h2>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {studentName} - {examTitle}
                </p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Integrity Score */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Integrity Score</span>
              </div>
              <div className={`text-3xl font-bold ${getRiskLevelColor(reportData.suspicionScore)}`}>
                {100 - (reportData.suspicionScore || 0)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {getIntegrityRating(reportData.suspicionScore)}
              </div>
            </div>

            {/* Total Violations */}
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Total Violations</span>
              </div>
              <div className="text-3xl font-bold text-red-600">
                {reportData.totalViolations || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {reportData.criticalViolations || 0} Critical
              </div>
            </div>

            {/* Monitoring Duration */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Duration</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                45m
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Monitored
              </div>
            </div>

            {/* Status */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Status</span>
              </div>
              <Badge className="text-lg px-3 py-1 bg-green-100 text-green-700">
                Completed
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Review Required
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            </TabsList>

            {/* Timeline View */}
            <TabsContent value="timeline" className="space-y-4 mt-4">
              <div className="space-y-3">
                {reportData.violationBreakdown && reportData.violationBreakdown.length > 0 ? (
                  reportData.violationBreakdown.map((violation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedViolation(violation)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(violation.severity)}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {violation._id}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {violation.count} occurrence{violation.count > 1 ? 's' : ''}
                        </p>
                        <Badge className="mt-2" variant="outline">
                          {getViolationCategory(violation._id)}
                        </Badge>
                      </div>
                      <Eye className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>No violations detected</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Violations Breakdown */}
            <TabsContent value="violations" className="mt-4">
              <div className="space-y-4">
                {Object.entries(violationCategories).map(([category, types]) => {
                  const categoryViolations = reportData.violationBreakdown?.filter(v => 
                    types.includes(v._id)
                  ) || [];
                  
                  if (categoryViolations.length === 0) return null;

                  const totalCount = categoryViolations.reduce((sum, v) => sum + v.count, 0);

                  return (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{category}</h4>
                        <Badge>{totalCount} total</Badge>
                      </div>
                      <div className="space-y-2">
                        {categoryViolations.map((violation, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <span className="text-sm text-gray-600">
                              {violation._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-sm font-medium">{violation.count}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* AI Analysis */}
            <TabsContent value="analysis" className="mt-4">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    AI Behavior Analysis
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Face Detection Rate:</span>
                      <span className="font-medium text-blue-900">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Gaze Consistency:</span>
                      <span className="font-medium text-blue-900">92.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Audio Anomalies:</span>
                      <span className="font-medium text-blue-900">Low</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Browser Behavior:</span>
                      <span className="font-medium text-blue-900">Normal</span>
                    </div>
                  </div>
                </div>

                <div className={`border-2 rounded-lg p-6 ${
                  reportData.suspicionScore > 50 ? 'bg-red-50 border-red-200' :
                  reportData.suspicionScore > 25 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <h4 className="font-semibold mb-3">Recommendation</h4>
                  <p className="text-sm">
                    {reportData.suspicionScore > 50 ? (
                      <>
                        <strong className="text-red-900">High Risk:</strong>
                        <span className="text-red-800"> This exam should be flagged for detailed review. Multiple violations detected suggest potential academic dishonesty.</span>
                      </>
                    ) : reportData.suspicionScore > 25 ? (
                      <>
                        <strong className="text-yellow-900">Medium Risk:</strong>
                        <span className="text-yellow-800"> Some violations detected. Manual review recommended to verify legitimacy of flagged events.</span>
                      </>
                    ) : (
                      <>
                        <strong className="text-green-900">Low Risk:</strong>
                        <span className="text-green-800"> Exam appears legitimate with minimal violations. No immediate concerns detected.</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline">
                    Mark as Reviewed
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Approve Exam
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700">
                    Flag for Investigation
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProctoringReport;
