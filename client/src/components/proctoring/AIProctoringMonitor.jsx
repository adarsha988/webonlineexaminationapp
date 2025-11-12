import React, { useState, useEffect, useRef } from 'react';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Monitor,
  Minimize2,
  Maximize2,
  Mic,
  MicOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useViolations } from '@/contexts/ViolationContext';
import axios from 'axios';

const AIProctoringMonitor = ({ examId, studentId, sessionId, onViolation }) => {
  const { addViolation } = useViolations();
  const [status, setStatus] = useState({
    face: 'loading', // 'loading', 'good', 'no_face', 'multiple_faces'
    gaze: 'good', // 'good', 'away'
    tabSwitch: 'good', // 'good', 'warning'
    mic: 'good', // 'good', 'muted'
    overall: 'All good ✅'
  });
  
  const [model, setModel] = useState(null);
  const [violations, setViolations] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [warningTimers, setWarningTimers] = useState({
    noFace: null,
    multipleFaces: null,
    gazeAway: null
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionFrameRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const noFaceStartTimeRef = useRef(null);
  const multipleFacesStartTimeRef = useRef(null);
  const gazeAwayStartTimeRef = useRef(null);
  const lastViolationLogRef = useRef({});
  const micMutedStartTimeRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  // Play violation alert sound
  const playViolationAlert = () => {
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Alert beep configuration
      oscillator.frequency.value = 800; // 800 Hz beep
      oscillator.type = 'sine';
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
      
      // Speak violation message
      const utterance = new SpeechSynthesisUtterance('Violation detected');
      utterance.rate = 1.2;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to play violation alert:', error);
    }
  };

  // Load TensorFlow model and start camera
  useEffect(() => {
    const initializeProctoring = async () => {
      try {
        // Ensure TensorFlow is ready
        await tf.ready();
        
        // Load BlazeFace model
        const loadedModel = await blazeface.load();
        setModel(loadedModel);

        // Request camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          },
          audio: true
        });

        // Store stream reference
        streamRef.current = stream;

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio monitoring
        setupAudioMonitoring(stream);

        setStatus(prev => ({ ...prev, face: 'good', mic: 'good' }));
      } catch (error) {
        console.error('Failed to initialize proctoring:', error);
        setStatus(prev => ({ ...prev, face: 'error', overall: 'Camera access required ⚠️' }));
      }
    };

    initializeProctoring();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionFrameRef.current) {
        cancelAnimationFrame(detectionFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Ensure video stream stays attached when expanding/collapsing
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isExpanded, isMinimized]);

  // Setup audio monitoring
  const setupAudioMonitoring = (stream) => {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = actx.createAnalyser();
      const microphone = actx.createMediaStreamSource(stream);
      
      analyserNode.smoothingTimeConstant = 0.8;
      analyserNode.fftSize = 1024;
      
      microphone.connect(analyserNode);
      
      setAudioContext(actx);
      setAnalyser(analyserNode);
      
      // Start monitoring audio level
      monitorAudioLevel(analyserNode);
    } catch (error) {
      console.error('Audio monitoring setup error:', error);
    }
  };

  const monitorAudioLevel = (analyserNode) => {
    const checkAudio = () => {
      if (!analyserNode) return;

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Check if microphone is muted (very low audio level)
      if (average < 1) {
        if (!micMutedStartTimeRef.current) {
          micMutedStartTimeRef.current = Date.now();
        }
        
        const duration = (Date.now() - micMutedStartTimeRef.current) / 1000;
        setStatus(prev => ({ ...prev, mic: 'muted' }));
        
        // Log violation after 10 seconds of continuous mute
        if (duration >= 10 && !shouldThrottle('mic_muted', 10000)) {
          logViolation('mic_muted', `Microphone inactive for ${Math.floor(duration)} seconds`);
        }
      } else {
        micMutedStartTimeRef.current = null;
        setStatus(prev => ({ ...prev, mic: 'good' }));
      }
      
      setTimeout(checkAudio, 1000); // Check every second for faster detection
    };
    
    checkAudio();
  };

  // Start face detection loop using requestAnimationFrame for instant detection
  useEffect(() => {
    if (model && videoRef.current) {
      const runDetection = async () => {
        await detectFaces();
        // Continue loop
        detectionFrameRef.current = requestAnimationFrame(runDetection);
      };
      runDetection();
    }

    return () => {
      if (detectionFrameRef.current) {
        cancelAnimationFrame(detectionFrameRef.current);
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

  // Throttle violation logging to prevent spam
  const shouldThrottle = (violationType, throttleMs = 10000) => {
    const now = Date.now();
    const lastLog = lastViolationLogRef.current[violationType] || 0;
    
    if (now - lastLog < throttleMs) {
      return true; // Skip this log
    }
    
    lastViolationLogRef.current[violationType] = now;
    return false;
  };

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
      // Silently handle detection errors to keep monitoring smooth
    }
  };

  const handleNoFace = () => {
    if (!noFaceStartTimeRef.current) {
      noFaceStartTimeRef.current = Date.now();
      setStatus(prev => ({ 
        ...prev, 
        face: 'no_face',
        overall: 'No face detected ⚠️'
      }));
    } else {
      const duration = (Date.now() - noFaceStartTimeRef.current) / 1000;
      
      // Log after 1 second (faster trigger) and throttle subsequent logs
      if (duration >= 1 && !shouldThrottle('no_face', 5000)) {
        logViolation('no_face', `No face detected for ${Math.floor(duration)} seconds`);
      }
    }
  };

  const handleMultipleFaces = () => {
    if (!multipleFacesStartTimeRef.current) {
      multipleFacesStartTimeRef.current = Date.now();
      setStatus(prev => ({
        ...prev,
        face: 'multiple_faces',
        overall: 'Multiple faces detected 🚫'
      }));
      // Log immediately for high-severity violation
      if (!shouldThrottle('multiple_faces', 5000)) {
        logViolation('multiple_faces', 'Multiple faces detected in frame');
      }
    } else {
      const duration = (Date.now() - multipleFacesStartTimeRef.current) / 1000;
      if (duration >= 3 && !shouldThrottle('multiple_faces', 5000)) {
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
    checkGaze(face);
    
    updateOverallStatus();
  };

  const checkGaze = (face) => {
    const video = videoRef.current;
    if (!video) return;

    const videoCenterX = video.videoWidth / 2;
    const videoCenterY = video.videoHeight / 2;
    
    const [x, y] = face.topLeft;
    const [x2, y2] = face.bottomRight;
    const faceCenterX = (x + x2) / 2;
    const faceCenterY = (y + y2) / 2;
    
    const offsetX = Math.abs(faceCenterX - videoCenterX);
    const offsetY = Math.abs(faceCenterY - videoCenterY);
    
    const threshold = video.videoWidth * 0.30; // 30% threshold for more accuracy
    
    if (offsetX > threshold || offsetY > threshold) {
      if (!gazeAwayStartTimeRef.current) {
        gazeAwayStartTimeRef.current = Date.now();
        setStatus(prev => ({
          ...prev,
          gaze: 'away',
          overall: 'Looking away from screen ⚠️'
        }));
      } else {
        const duration = (Date.now() - gazeAwayStartTimeRef.current) / 1000;
        // Trigger after 1.5 seconds (faster than before)
        if (duration >= 1.5 && !shouldThrottle('gaze_away', 3000)) {
          logViolation('gaze_away', `Looking away from screen for ${Math.floor(duration)} seconds`);
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
    const severity = getSeverity(type);
    const violation = {
      eventType: type,
      description,
      severity,
      timestamp: new Date().toISOString()
    };

    setViolations(prev => [...prev, violation]);

    // Show notification popup via context
    addViolation(violation);

    // Play audio alert for violation
    playViolationAlert();

    // Call parent callback
    if (onViolation) {
      onViolation(violation);
    }

    // Send to backend
    try {
      console.log('🚨 SENDING VIOLATION TO BACKEND:', {
        examId,
        studentId,
        sessionId,
        eventType: type,
        description,
        severity,
        timestamp: new Date().toISOString()
      });
      
      const response = await axios.post('/api/proctoring/log', {
        examId,
        studentId,
        sessionId,
        eventType: type,
        description,
        severity,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('✅ VIOLATION LOGGED SUCCESSFULLY:', response.data);
    } catch (error) {
      console.error('❌ FAILED TO LOG VIOLATION:', error.response?.data || error.message);
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
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: 0,
        left: 0,
        right: window.innerWidth - 200,
        bottom: window.innerHeight - 200
      }}
      initial={{ opacity: 0, x: window.innerWidth - 250, y: window.innerHeight - 200 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed z-50 cursor-move"
      style={{ touchAction: 'none' }}
    >
      {/* Floating Camera Feed Card */}
      <div className="relative">
        {/* Compact View */}
        {!isExpanded && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            animate={{
              scale: isMinimized ? 0.5 : 1,
              x: isMinimized ? 100 : 0,
              y: isMinimized ? 100 : 0,
              opacity: isMinimized ? 0.7 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`rounded-2xl shadow-2xl overflow-hidden border-2 transition-all duration-300 ${getStatusColor()}`}
            style={{ transformOrigin: 'bottom right' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Live Video Feed - Always visible, just transformed */}
            <div className="relative w-48 h-36 bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Drag Handle & Status Overlay */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm cursor-move">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    status.face === 'good' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white text-xs font-semibold">LIVE</span>
                  <span className="text-white/70 text-xs ml-1">⋮⋮</span>
                </div>
                {getStatusIcon()}
              </div>
              
              {/* AI Proctoring Label & Controls */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-medium">AI Monitoring</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {status.mic === 'muted' && <MicOff className="w-3 h-3 text-red-400" />}
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(!isMinimized);
                      }}
                      className="p-0.5 hover:bg-white/20 rounded transition-colors cursor-pointer"
                      title={isMinimized ? "Maximize" : "Minimize"}
                    >
                      {isMinimized ? (
                        <Maximize2 className="w-3 h-3 text-white" />
                      ) : (
                        <Minimize2 className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="p-0.5 hover:bg-white/20 rounded transition-colors cursor-pointer"
                      title="Expand"
                    >
                      <Maximize2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
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
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between cursor-move">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm mr-1">⋮⋮</span>
                <Camera className="w-5 h-5 text-white" />
                <span className="font-bold text-white">AI Proctoring</span>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
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
                style={{ transform: 'scaleX(-1)' }}
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

                <div className="flex items-center justify-between text-xs bg-white rounded-lg p-2 shadow-sm">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <Mic className="w-3.5 h-3.5" />
                    Microphone
                  </span>
                  <Badge variant={status.mic === 'good' ? 'default' : 'destructive'} className="text-xs">
                    {status.mic === 'good' ? '✓' : 'Muted'}
                  </Badge>
                </div>
              </div>

              {/* Warnings */}
              {(status.face !== 'good' || status.gaze !== 'good' || status.tabSwitch !== 'good' || status.mic !== 'good') && (
                <div className="mt-2 text-xs p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-1">
                  {status.face === 'no_face' && <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Ensure face is visible</p>}
                  {status.face === 'multiple_faces' && <p className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Multiple faces detected</p>}
                  {status.gaze === 'away' && <p className="flex items-center gap-1"><Eye className="w-3 h-3" /> Look at the screen</p>}
                  {status.tabSwitch === 'warning' && <p className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Don't switch tabs</p>}
                  {status.mic === 'muted' && <p className="flex items-center gap-1"><MicOff className="w-3 h-3" /> Unmute your microphone</p>}
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
