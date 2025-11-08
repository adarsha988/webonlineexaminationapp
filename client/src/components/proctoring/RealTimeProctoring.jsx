import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Mic, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';

const RealTimeProctoring = ({ attemptId, examId, onViolation, onTerminate }) => {
  const [status, setStatus] = useState({
    cameraActive: false,
    micActive: false,
    faceDetected: false,
    gazeOnScreen: true,
    violations: 0,
    riskLevel: 'low'
  });

  const [warnings, setWarnings] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const gazeIntervalRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // Initialize monitoring
  useEffect(() => {
    initializeMonitoring();
    setupBrowserMonitoring();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMonitoring = async () => {
    try {
      // Get camera and microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus(prev => ({
        ...prev,
        cameraActive: true,
        micActive: true
      }));

      // Start monitoring intervals
      startFaceDetection();
      startGazeTracking();
      startAudioMonitoring();
      startHeartbeat();
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      logViolation('camera_access_denied', 'critical', 'Camera access was denied');
    }
  };

  // Face detection every 3 seconds
  const startFaceDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      try {
        const faceDetected = await detectFace();
        
        setStatus(prev => ({ ...prev, faceDetected }));

        if (!faceDetected) {
          handleNoFaceDetected();
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 3000);
  };

  // Gaze tracking every 2 seconds
  const startGazeTracking = () => {
    gazeIntervalRef.current = setInterval(async () => {
      try {
        const gazeOnScreen = await checkGaze();
        
        setStatus(prev => ({ ...prev, gazeOnScreen }));

        if (!gazeOnScreen) {
          handleGazeAway();
        }
      } catch (error) {
        console.error('Gaze tracking error:', error);
      }
    }, 2000);
  };

  // Audio monitoring every 5 seconds
  const startAudioMonitoring = () => {
    audioIntervalRef.current = setInterval(async () => {
      try {
        const audioData = await analyzeAudio();
        
        if (audioData.multipleVoices) {
          logViolation('multiple_voices', 'high', 'Multiple voices detected');
        }
        
        if (audioData.highNoise) {
          logViolation('audio_anomaly', 'medium', 'Unusual background noise detected');
        }
      } catch (error) {
        console.error('Audio monitoring error:', error);
      }
    }, 5000);
  };

  // Send heartbeat to server every 30 seconds
  const startHeartbeat = () => {
    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`/api/proctoring/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            attemptId,
            timestamp: new Date().toISOString(),
            status: status
          })
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  };

  // Simulated face detection (in production, use Face-API.js or similar)
  const detectFace = async () => {
    return new Promise((resolve) => {
      // Simulate AI detection
      const detected = Math.random() > 0.05; // 95% detection rate
      setTimeout(() => resolve(detected), 100);
    });
  };

  // Simulated gaze tracking
  const checkGaze = async () => {
    return new Promise((resolve) => {
      const onScreen = Math.random() > 0.1; // 90% on screen
      setTimeout(() => resolve(onScreen), 100);
    });
  };

  // Simulated audio analysis
  const analyzeAudio = async () => {
    return new Promise((resolve) => {
      const multipleVoices = Math.random() > 0.95; // 5% chance
      const highNoise = Math.random() > 0.90; // 10% chance
      setTimeout(() => resolve({ multipleVoices, highNoise }), 100);
    });
  };

  // Handle no face detected
  const handleNoFaceDetected = () => {
    addWarning('No face detected. Please ensure your face is visible.');
    logViolation('face_not_detected', 'high', 'Student face not visible to camera');
  };

  // Handle gaze away
  const handleGazeAway = () => {
    addWarning('Please keep your eyes on the screen.');
    logViolation('gaze_away', 'medium', 'Student looking away from screen');
  };

  // Add warning message
  const addWarning = (message) => {
    setWarnings(prev => {
      const newWarnings = [...prev, {
        id: Date.now(),
        message,
        timestamp: new Date()
      }];
      
      // Keep only last 3 warnings
      return newWarnings.slice(-3);
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setWarnings(prev => prev.filter(w => Date.now() - w.id > 10000));
    }, 10000);
  };

  // Log violation to backend
  const logViolation = async (type, severity, description) => {
    try {
      const response = await fetch('/api/proctoring/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          examId,
          attemptId,
          eventType: type,
          severity,
          description,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(prev => ({
          ...prev,
          violations: prev.violations + 1,
          riskLevel: data.integrityRating === 'High Risk' ? 'high' :
                     data.integrityRating === 'Medium Risk' ? 'medium' : 'low'
        }));

        // Notify parent component
        if (onViolation) {
          onViolation({
            type,
            severity,
            totalViolations: data.suspicionScore
          });
        }

        // Check if exam should be terminated
        if (data.suspicionScore > 75 && onTerminate) {
          onTerminate('Too many violations detected');
        }
      }
    } catch (error) {
      console.error('Error logging violation:', error);
    }
  };

  // Browser monitoring
  const setupBrowserMonitoring = () => {
    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch', 'high', 'Student switched browser tabs');
        addWarning('Tab switching detected! This is a violation.');
      }
    };

    // Prevent copy-paste
    const handleCopy = (e) => {
      e.preventDefault();
      logViolation('copy_paste', 'medium', 'Copy attempt detected');
      addWarning('Copying is not allowed during the exam.');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      logViolation('copy_paste', 'medium', 'Paste attempt detected');
      addWarning('Pasting is not allowed during the exam.');
    };

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      logViolation('right_click', 'low', 'Right-click attempt detected');
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
        logViolation('unauthorized_action', 'high', 'Attempted to open developer tools');
        addWarning('Unauthorized keyboard shortcut detected.');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  // Cleanup
  const cleanup = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Proctoring Status Panel */}
      <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">AI Proctoring Active</span>
          </div>
          <Badge 
            className={
              status.riskLevel === 'high' ? 'bg-red-500' :
              status.riskLevel === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }
          >
            {status.riskLevel.toUpperCase()}
          </Badge>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Camera className={`h-4 w-4 ${status.cameraActive ? 'text-green-600' : 'text-red-600'}`} />
              <span>Camera</span>
            </div>
            {status.cameraActive ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Mic className={`h-4 w-4 ${status.micActive ? 'text-green-600' : 'text-red-600'}`} />
              <span>Microphone</span>
            </div>
            {status.micActive ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className={`h-4 w-4 ${status.faceDetected ? 'text-green-600' : 'text-red-600'}`} />
              <span>Face Detection</span>
            </div>
            {status.faceDetected ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>

        {/* Violations Count */}
        {status.violations > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Violations</span>
              <Badge variant="destructive">{status.violations}</Badge>
            </div>
          </div>
        )}

        {/* Video Preview */}
        <div className="mt-3 relative bg-black rounded overflow-hidden" style={{ height: '120px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      {/* Warnings */}
      {warnings.map(warning => (
        <Alert key={warning.id} variant="destructive" className="w-80 animate-in slide-in-from-right">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warning.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default RealTimeProctoring;
