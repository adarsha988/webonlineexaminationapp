import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Mic,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Eye,
  Lock,
  Unlock,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ExamVerification = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { toast } = useToast();
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false
  });
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const requestMediaAccess = async () => {
    if (isRequesting) return;
    
    try {
      setIsRequesting(true);
      setError('');
      setPermissions({ camera: false, microphone: false });

      console.log('📹 Requesting camera and microphone access...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      console.log('✅ Media access granted');
      streamRef.current = mediaStream;

      // Setup video preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check video track
      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();
      
      console.log('📊 Tracks:', { video: videoTracks.length, audio: audioTracks.length });

      if (videoTracks.length > 0 && videoTracks[0].enabled) {
        setPermissions(prev => ({ ...prev, camera: true }));
        console.log('✅ Camera active');
      }

      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        setPermissions(prev => ({ ...prev, microphone: true }));
        setupAudioMonitoring(mediaStream);
        console.log('✅ Microphone active');
      }

      toast({
        title: "✅ Access Granted",
        description: "Camera and microphone are now active",
      });

    } catch (err) {
      console.error('❌ Media access error:', err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'You denied permission. Please click "Allow" when prompted.'
        : err.name === 'NotFoundError'
        ? 'No camera or microphone found on your device.'
        : 'Failed to access camera/microphone. Please check your device settings.';
      
      setError(errorMessage);
      setPermissions({ camera: false, microphone: false });
      
      toast({
        title: "❌ Permission Denied",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const setupAudioMonitoring = (mediaStream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      monitorAudioLevel();
    } catch (error) {
      console.error('Audio monitoring setup error:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const updateLevel = () => {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalized = Math.min(100, (average / 128) * 100);
      
      setAudioLevel(normalized);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleContinue = () => {
    if (!permissions.camera || !permissions.microphone) {
      toast({
        title: "❌ Verification Failed",
        description: "Both camera and microphone must be active to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Verification complete, navigating to exam...');
    setIsVerified(true);
    
    // Store verification data with timestamp and exam ID
    sessionStorage.setItem(`exam_verified_${examId}`, JSON.stringify({
      verified: true,
      timestamp: new Date().toISOString(),
      examId: examId
    }));
    
    // Keep stream alive and navigate to exam
    // Stream will be reused by monitoring component
    navigate(`/student/exam/${examId}`, {
      state: {
        verified: true,
        hasMedia: true
      },
      replace: true
    });
  };

  const retryAccess = () => {
    console.log('🔄 Retrying media access...');
    cleanup();
    setPermissions({ camera: false, microphone: false });
    setError('');
    setTimeout(() => requestMediaAccess(), 300);
  };

  // Auto-verify when both are active
  useEffect(() => {
    if (permissions.camera && permissions.microphone && !isVerified) {
      console.log('✅ Both devices verified');
    }
  }, [permissions, isVerified]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Exam Verification
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Please verify your camera and microphone before starting the exam
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-none overflow-hidden">
            <CardContent className="p-8">
              {/* Video Preview */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Preview
                </h2>
                <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-96 object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <Badge className={`${permissions.camera ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {permissions.camera ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Camera Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Camera Not Detected
                        </span>
                      )}
                    </Badge>
                    
                    {isRequesting && (
                      <Badge className="bg-blue-500 text-white animate-pulse">
                        Requesting...
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Status */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {/* Camera Status */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`p-6 rounded-xl border-2 ${
                    permissions.camera
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-full ${
                      permissions.camera ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Camera</h3>
                      <p className="text-sm text-gray-600">
                        {permissions.camera ? 'Detected & Active' : 'Not Detected'}
                      </p>
                    </div>
                  </div>
                  {permissions.camera ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Ready for monitoring</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Required for exam</span>
                    </div>
                  )}
                </motion.div>

                {/* Microphone Status */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`p-6 rounded-xl border-2 ${
                    permissions.microphone
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-full ${
                      permissions.microphone ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Microphone</h3>
                      <p className="text-sm text-gray-600">
                        {permissions.microphone ? 'Detected & Active' : 'Not Detected'}
                      </p>
                    </div>
                  </div>
                  {permissions.microphone ? (
                    <>
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Audio monitoring ready</span>
                      </div>
                      {/* Audio Level Indicator */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600">Audio Level</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600"
                            animate={{ width: `${audioLevel}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Required for exam</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-red-900 mb-1">Permission Required</h4>
                          <p className="text-sm text-red-800">{error}</p>
                          <Button
                            onClick={retryAccess}
                            className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Retry Access
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Requirements Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">AI Monitoring Active</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Face detection will track your presence</li>
                      <li>• Gaze tracking monitors screen focus</li>
                      <li>• Audio monitoring detects environment changes</li>
                      <li>• Violations are logged and reported to instructors</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Allow Camera & Mic Button - Shows first */}
                {(!permissions.camera || !permissions.microphone) && (
                  <Button
                    onClick={requestMediaAccess}
                    disabled={isRequesting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg py-6"
                  >
                    {isRequesting ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Shield className="w-5 h-5" />
                        </motion.div>
                        Requesting Permission...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Allow Camera & Microphone
                      </span>
                    )}
                  </Button>
                )}

                {/* Continue to Exam - Shows when both verified */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate('/student/dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!permissions.camera || !permissions.microphone}
                    className={`flex-1 ${
                      permissions.camera && permissions.microphone
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white font-bold text-lg py-6`}
                  >
                    {permissions.camera && permissions.microphone ? (
                      <span className="flex items-center gap-2">
                        <Unlock className="w-5 h-5" />
                        Continue to Exam
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Grant Permissions First
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamVerification;
