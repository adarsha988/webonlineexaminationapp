import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, User, Volume2, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const SecurityVerification = ({ onVerificationComplete, examId, examTitle }) => {
  const [verificationStep, setVerificationStep] = useState('instructions'); // instructions, permissions, face-check, audio-check, ready
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false
  });
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Load face detection model
    const loadModel = async () => {
      try {
        await tf.ready();
        const blazefaceModel = await blazeface.load();
        setModel(blazefaceModel);
      } catch (error) {
        console.error('Failed to load face detection model:', error);
      }
    };
    loadModel();

    return () => {
      cleanupMedia();
    };
  }, []);

  const cleanupMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const requestMediaPermissions = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setStream(mediaStream);
      setPermissions({ camera: true, microphone: true });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to load before proceeding
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded with dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          // Give it a moment to fully initialize
          setTimeout(() => {
            setVerificationStep('face-check');
          }, 500);
        };
      }

      // Setup audio monitoring
      setupAudioMonitoring(mediaStream);
    } catch (err) {
      console.error('Permission error:', err);
      setError('Camera and microphone access are required for this exam. Please allow access and try again.');
      setPermissions({ camera: false, microphone: false });
    } finally {
      setIsVerifying(false);
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
      console.error('Audio setup error:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average);
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  const detectFace = async () => {
    if (!model || !videoRef.current) {
      setError('Camera not ready. Please wait...');
      return;
    }

    // Wait for video to be ready with valid dimensions
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setError('Video is loading. Please wait a moment...');
      // Retry after a short delay
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          detectFace();
        }
      }, 500);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      console.log('Starting face detection. Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
      
      const predictions = await model.estimateFaces(videoRef.current, false);
      
      console.log('Face detection predictions:', predictions.length);
      
      if (predictions.length === 1) {
        setFaceDetected(true);
        setError('');
        setTimeout(() => {
          setVerificationStep('audio-check');
        }, 1500);
      } else if (predictions.length === 0) {
        setError('No face detected. Please ensure your face is clearly visible.');
        setFaceDetected(false);
      } else {
        setError('Multiple faces detected. Please ensure only you are visible.');
        setFaceDetected(false);
      }
    } catch (error) {
      console.error('Face detection error:', error);
      setError('Face detection failed. Please ensure your face is clearly visible and try again.');
      setFaceDetected(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const completeVerification = () => {
    const verificationData = {
      permissions,
      faceDetected,
      audioLevel,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`
      }
    };

    onVerificationComplete(verificationData, stream);
  };

  const renderInstructions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Security Verification Required</h2>
        <p className="text-gray-600">Before you begin your exam, complete the following security steps</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            1
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center mb-2">
              <Camera className="w-5 h-5 mr-2 text-blue-600" />
              Allow Camera and Microphone Access
            </h3>
            <p className="text-sm text-gray-700">
              When prompted, click <strong>"Allow"</strong> to enable your camera and microphone.
              These permissions are required for identity verification and continuous monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            2
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center mb-2">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Face Detection Check
            </h3>
            <p className="text-sm text-gray-700">
              Ensure your face is clearly visible within the camera frame.
              Good lighting and a neutral background help improve accuracy.
              Once your face is verified, you'll be able to continue to the exam.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            3
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center mb-2">
              <Volume2 className="w-5 h-5 mr-2 text-green-600" />
              Audio Environment Check
            </h3>
            <p className="text-sm text-gray-700">
              Make sure your surroundings are quiet.
              Background noise or multiple voices may trigger alerts.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
            4
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center mb-2">
              <Eye className="w-5 h-5 mr-2 text-red-600" />
              Do Not Minimize or Switch Tabs
            </h3>
            <p className="text-sm text-gray-700">
              Any attempt to leave the exam window will be logged automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
            <p className="text-sm text-yellow-800">
              The system will automatically request camera and mic access, capture your face for identity verification,
              and proceed to the exam once verification is successful.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setVerificationStep('permissions')}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] font-semibold text-lg shadow-lg"
      >
        Start Verification
      </button>
    </motion.div>
  );

  const renderPermissionsRequest = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <Camera className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Camera & Microphone Access</h2>
        <p className="text-gray-600">Click the button below to grant permissions</p>
      </div>

      <div className="space-y-4">
        <div className={`p-6 rounded-xl border-2 transition-all ${
          permissions.camera 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className={`w-6 h-6 ${permissions.camera ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <h3 className="font-semibold">Camera</h3>
                <p className="text-sm text-gray-600">Required for face detection</p>
              </div>
            </div>
            {permissions.camera && <CheckCircle2 className="w-6 h-6 text-green-600" />}
          </div>
        </div>

        <div className={`p-6 rounded-xl border-2 transition-all ${
          permissions.microphone 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mic className={`w-6 h-6 ${permissions.microphone ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <h3 className="font-semibold">Microphone</h3>
                <p className="text-sm text-gray-600">Required for audio monitoring</p>
              </div>
            </div>
            {permissions.microphone && <CheckCircle2 className="w-6 h-6 text-green-600" />}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={requestMediaPermissions}
        disabled={isVerifying || (permissions.camera && permissions.microphone)}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
      >
        {isVerifying ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Requesting Permissions...
          </span>
        ) : permissions.camera && permissions.microphone ? (
          'Permissions Granted ✓'
        ) : (
          'Allow Camera & Microphone'
        )}
      </button>
    </motion.div>
  );

  const renderFaceCheck = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
          <User className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Face Detection Check</h2>
        <p className="text-gray-600">Position yourself in the frame and look at the camera</p>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-200 bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-2xl mx-auto min-h-[400px] object-cover"
        />
        
        <div className="absolute top-4 left-4 right-4">
          <div className={`p-4 rounded-xl backdrop-blur-md ${
            faceDetected 
              ? 'bg-green-500/90' 
              : 'bg-blue-500/90'
          }`}>
            <div className="flex items-center justify-between text-white">
              <span className="font-semibold">
                {faceDetected ? '✓ Face Detected' : 'Detecting face...'}
              </span>
              {isVerifying && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Face detection frame guide */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-80 border-4 border-white/50 rounded-full" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure your face is well-lit and centered in the frame</li>
          <li>• Remove any hats, sunglasses, or face coverings</li>
          <li>• Look directly at the camera</li>
          <li>• Keep a neutral background</li>
        </ul>
      </div>

      <button
        onClick={detectFace}
        disabled={isVerifying || faceDetected}
        className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Detecting...
          </span>
        ) : faceDetected ? (
          'Face Verified ✓'
        ) : (
          'Verify Face'
        )}
      </button>
    </motion.div>
  );

  const renderAudioCheck = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <Volume2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audio Environment Check</h2>
        <p className="text-gray-600">Checking for background noise levels</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-700">Audio Level:</span>
          <span className={`font-bold ${
            audioLevel < 30 ? 'text-green-600' : 
            audioLevel < 60 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {audioLevel < 30 ? 'Quiet ✓' : 
             audioLevel < 60 ? 'Moderate' : 
             'Loud'}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              audioLevel < 30 ? 'bg-green-500' : 
              audioLevel < 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(audioLevel, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-sm text-gray-600 mt-4 text-center">
          {audioLevel < 30 
            ? 'Your environment is quiet. Perfect for the exam!' 
            : audioLevel < 60 
            ? 'Some background noise detected. Try to reduce it if possible.' 
            : 'High background noise detected. Please find a quieter location.'}
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h4 className="font-semibold text-green-900 mb-2">Environment Guidelines:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Find a quiet room with minimal background noise</li>
          <li>• Close windows and doors to reduce external sounds</li>
          <li>• Turn off TVs, radios, and other noise sources</li>
          <li>• Inform others not to disturb you during the exam</li>
        </ul>
      </div>

      <button
        onClick={() => setVerificationStep('ready')}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all font-semibold text-lg shadow-lg"
      >
        Continue to Exam
      </button>
    </motion.div>
  );

  const renderReady = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-6 shadow-2xl"
        >
          <CheckCircle2 className="w-14 h-14 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Verified! 🎉</h2>
        <p className="text-gray-600 text-lg">You're ready to begin your exam</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <span className="text-gray-800">Camera access granted</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <span className="text-gray-800">Microphone access granted</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <span className="text-gray-800">Face successfully verified</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <span className="text-gray-800">Audio environment checked</span>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
        <div className="flex items-start">
          <Lock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Exam Monitoring Active</h4>
            <p className="text-sm text-yellow-800">
              Your exam session will be monitored for security purposes. Remember to keep your face visible
              and avoid switching tabs or minimizing the browser window.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="font-bold text-gray-900 text-xl mb-3">Exam Details:</h3>
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <p className="text-lg font-semibold text-blue-600 mb-2">{examTitle}</p>
          <p className="text-sm text-gray-600">Exam ID: {examId}</p>
        </div>
      </div>

      <button
        onClick={completeVerification}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-[1.02] font-bold text-xl shadow-2xl"
      >
        Start Exam Now →
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <AnimatePresence mode="wait">
            {verificationStep === 'instructions' && renderInstructions()}
            {verificationStep === 'permissions' && renderPermissionsRequest()}
            {verificationStep === 'face-check' && renderFaceCheck()}
            {verificationStep === 'audio-check' && renderAudioCheck()}
            {verificationStep === 'ready' && renderReady()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SecurityVerification;
