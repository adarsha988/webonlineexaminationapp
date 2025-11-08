import React, { useState, useEffect, useRef } from 'react';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Monitor
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const AIProctoringMonitor = ({ examId, studentId, sessionId, onViolation }) => {
  const [status, setStatus] = useState({
    face: 'loading', // 'loading', 'good', 'no_face', 'multiple_faces'
    gaze: 'good', // 'good', 'away'
    tabSwitch: 'good', // 'good', 'warning'
    overall: 'All good ✅'
  });
  
  const [model, setModel] = useState(null);
  const [violations, setViolations] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [warningTimers, setWarningTimers] = useState({
    noFace: null,
    multipleFaces: null,
    gazeAway: null
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const gazeCheckIntervalRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const noFaceStartTimeRef = useRef(null);
  const multipleFacesStartTimeRef = useRef(null);
  const gazeAwayStartTimeRef = useRef(null);

  // Load TensorFlow model and start camera
  useEffect(() => {
    let stream = null;

    const initializeProctoring = async () => {
      try {
        // Load BlazeFace model
        const loadedModel = await blazeface.load();
        setModel(loadedModel);

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setStatus(prev => ({ ...prev, face: 'good' }));
      } catch (error) {
        console.error('Failed to initialize proctoring:', error);
        setStatus(prev => ({ ...prev, face: 'error', overall: 'Camera access required ⚠️' }));
      }
    };

    initializeProctoring();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (gazeCheckIntervalRef.current) {
        clearInterval(gazeCheckIntervalRef.current);
      }
    };
  }, []);

  // Start face detection loop
  useEffect(() => {
    if (model && videoRef.current) {
      detectionIntervalRef.current = setInterval(() => {
        detectFaces();
      }, 1000); // Check every second
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [model]);

  // Monitor tab switching and window blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        logViolation('tab_switch', 'Student switched tabs or minimized browser');
        setStatus(prev => ({ 
          ...prev, 
          tabSwitch: 'warning',
          overall: 'Tab switched 🚫'
        }));
        
        // Reset tab switch warning after 3 seconds
        setTimeout(() => {
          setStatus(prev => ({ 
            ...prev, 
            tabSwitch: 'good'
          }));
          updateOverallStatus();
        }, 3000);
      }
    };

    const handleBlur = () => {
      logViolation('window_blur', 'Student switched focus away from exam window');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examId, studentId]);

  const detectFaces = async () => {
    if (!model || !videoRef.current || videoRef.current.readyState !== 4) {
      return;
    }

    try {
      const predictions = await model.estimateFaces(videoRef.current, false);
      
      if (predictions.length === 0) {
        handleNoFace();
      } else if (predictions.length > 1) {
        handleMultipleFaces();
      } else {
        handleSingleFace(predictions[0]);
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  const handleNoFace = () => {
    if (!noFaceStartTimeRef.current) {
      noFaceStartTimeRef.current = Date.now();
    }

    const duration = (Date.now() - noFaceStartTimeRef.current) / 1000;
    
    if (duration > 10) {
      // More than 10 seconds without face
      setStatus(prev => ({ 
        ...prev, 
        face: 'no_face',
        overall: 'No face detected ⚠️'
      }));
      
      if (duration > 10 && Math.floor(duration) % 10 === 0) {
        // Log every 10 seconds
        logViolation('no_face', `No face detected for ${Math.floor(duration)} seconds`);
      }
    }
  };

  const handleMultipleFaces = () => {
    if (!multipleFacesStartTimeRef.current) {
      multipleFacesStartTimeRef.current = Date.now();
    }

    const duration = (Date.now() - multipleFacesStartTimeRef.current) / 1000;
    
    if (duration > 10) {
      // More than 10 seconds with multiple faces
      setStatus(prev => ({ 
        ...prev, 
        face: 'multiple_faces',
        overall: 'Multiple faces ❌'
      }));
      
      if (duration > 10 && Math.floor(duration) % 10 === 0) {
        logViolation('multiple_faces', `Multiple faces detected for ${Math.floor(duration)} seconds`);
      }
    }
  };

  const handleSingleFace = (face) => {
    // Reset timers
    noFaceStartTimeRef.current = null;
    multipleFacesStartTimeRef.current = null;
    
    setStatus(prev => ({ 
      ...prev, 
      face: 'good'
    }));

    // Simple gaze detection based on face position
    checkGazeDirection(face);
    
    updateOverallStatus();
  };

  const checkGazeDirection = (face) => {
    // Check if video ref is still valid
    if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      return;
    }
    
    // Simple heuristic: if face is too far from center, mark as looking away
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    const faceCenter = {
      x: (face.topLeft[0] + face.bottomRight[0]) / 2,
      y: (face.topLeft[1] + face.bottomRight[1]) / 2
    };
    
    const videoCenter = {
      x: videoWidth / 2,
      y: videoHeight / 2
    };
    
    // Calculate distance from center
    const distanceX = Math.abs(faceCenter.x - videoCenter.x);
    const distanceY = Math.abs(faceCenter.y - videoCenter.y);
    
    // If face is significantly off-center, mark as looking away
    if (distanceX > videoWidth * 0.3 || distanceY > videoHeight * 0.3) {
      if (!gazeAwayStartTimeRef.current) {
        gazeAwayStartTimeRef.current = Date.now();
      }
      
      const duration = (Date.now() - gazeAwayStartTimeRef.current) / 1000;
      
      if (duration > 5) {
        setStatus(prev => ({ 
          ...prev, 
          gaze: 'away',
          overall: 'Looking away ⚠️'
        }));
        
        if (duration > 5 && Math.floor(duration) % 5 === 0) {
          logViolation('gaze_away', `Student looking away for ${Math.floor(duration)} seconds`);
        }
      }
    } else {
      gazeAwayStartTimeRef.current = null;
      setStatus(prev => ({ 
        ...prev, 
        gaze: 'good'
      }));
    }
  };

  const updateOverallStatus = () => {
    setStatus(prev => {
      if (prev.face === 'no_face') return prev;
      if (prev.face === 'multiple_faces') return prev;
      if (prev.gaze === 'away') return prev;
      if (prev.tabSwitch === 'warning') return prev;
      
      return { ...prev, overall: 'All good ✅' };
    });
  };

  const logViolation = async (type, description) => {
    const violation = {
      type,
      description,
      timestamp: new Date().toISOString()
    };

    setViolations(prev => [...prev, violation]);

    // Call parent callback
    if (onViolation) {
      onViolation(violation);
    }

    // Send to backend
    try {
      await axios.post('/api/proctoring/log', {
        examId,
        studentId,
        sessionId,
        eventType: type,
        description,
        severity: getSeverity(type),
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  };

  const getSeverity = (type) => {
    if (type === 'multiple_faces') return 'high';
    if (type === 'no_face') return 'medium';
    if (type === 'tab_switch') return 'high';
    if (type === 'gaze_away') return 'low';
    return 'medium';
  };

  const getStatusIcon = () => {
    if (status.face === 'no_face') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    if (status.face === 'multiple_faces') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status.tabSwitch === 'warning') return <Monitor className="w-4 h-4 text-red-500" />;
    if (status.gaze === 'away') return <Eye className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (status.face === 'no_face' || status.gaze === 'away') return 'bg-orange-50 border-orange-200 text-orange-700';
    if (status.face === 'multiple_faces' || status.tabSwitch === 'warning') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Floating Camera Feed Card */}
      <div className="relative">
        {/* Compact View */}
        {!isExpanded && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`cursor-pointer rounded-2xl shadow-2xl overflow-hidden border-2 transition-all duration-300 ${getStatusColor()}`}
            onClick={() => setIsExpanded(true)}
          >
            {/* Live Video Feed */}
            <div className="relative w-48 h-36 bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Status Overlay */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    status.face === 'good' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white text-xs font-semibold">LIVE</span>
                </div>
                {getStatusIcon()}
              </div>
              
              {/* AI Proctoring Label */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2">
                  <Camera className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">AI Monitoring</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl shadow-2xl border-2 overflow-hidden ${getStatusColor()} w-80`}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-white" />
                <span className="font-bold text-white">AI Proctoring</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Live Feed */}
            <div className="relative h-48 bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  status.face === 'good' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-white text-xs font-semibold">LIVE</span>
              </div>
            </div>

            {/* Status Panel */}
            <div className="p-4 bg-white/90 backdrop-blur-sm space-y-3">
              {/* Overall Status */}
              <div className="text-center py-2 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <span className="font-bold text-sm text-gray-900">{status.overall}</span>
              </div>

              {/* Detailed Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-white rounded-lg p-2 shadow-sm">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <Camera className="w-3.5 h-3.5" />
                    Face
                  </span>
                  <Badge variant={status.face === 'good' ? 'default' : 'destructive'} className="text-xs">
                    {status.face === 'good' ? '✓' : status.face === 'no_face' ? 'None' : 'Multiple'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs bg-white rounded-lg p-2 shadow-sm">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <Eye className="w-3.5 h-3.5" />
                    Gaze
                  </span>
                  <Badge variant={status.gaze === 'good' ? 'default' : 'destructive'} className="text-xs">
                    {status.gaze === 'good' ? '✓' : 'Away'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs bg-white rounded-lg p-2 shadow-sm">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <Monitor className="w-3.5 h-3.5" />
                    Focus
                  </span>
                  <Badge variant={status.tabSwitch === 'good' ? 'default' : 'destructive'} className="text-xs">
                    {tabSwitchCountRef.current > 0 ? `${tabSwitchCountRef.current}x` : '✓'}
                  </Badge>
                </div>
              </div>

              {/* Warnings */}
              {(status.face !== 'good' || status.gaze !== 'good' || status.tabSwitch !== 'good') && (
                <div className="mt-2 text-xs p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-1">
                  {status.face === 'no_face' && <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Ensure face is visible</p>}
                  {status.face === 'multiple_faces' && <p className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Multiple faces detected</p>}
                  {status.gaze === 'away' && <p className="flex items-center gap-1"><Eye className="w-3 h-3" /> Look at the screen</p>}
                  {status.tabSwitch === 'warning' && <p className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Don't switch tabs</p>}
                </div>
              )}

              {/* Violation Counter */}
              {violations.length > 0 && (
                <div className="text-center text-xs font-medium text-gray-600">
                  {violations.length} warning{violations.length !== 1 ? 's' : ''} logged
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Hidden canvas for face detection */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </motion.div>
  );
};

export default AIProctoringMonitor;
