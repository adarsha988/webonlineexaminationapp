import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Video, 
  Mic, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Eye,
  Shield,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIProctoringSetup = ({ examId, onSetupComplete, onSetupFailed }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupProgress, setSetupProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  
  // Camera and media states
  const [cameraStream, setCameraStream] = useState(null);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  
  // Verification states
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [environmentChecked, setEnvironmentChecked] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const steps = [
    { id: 1, title: 'Camera & Microphone', icon: Camera, status: 'pending' },
    { id: 2, title: 'Face Verification', icon: User, status: 'pending' },
    { id: 3, title: 'Environment Check', icon: Eye, status: 'pending' }
  ];

  // Request camera and microphone access
  const requestMediaAccess = async () => {
    try {
      setIsProcessing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraAccess(true);
      setMicrophoneAccess(true);
      setSetupProgress(33);
      setCurrentStep(2);
      setErrors([]);
    } catch (error) {
      console.error('Media access error:', error);
      setErrors(prev => [...prev, {
        step: 'Camera/Microphone',
        message: 'Please allow camera and microphone access to continue'
      }]);
      setCameraAccess(false);
      setMicrophoneAccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture face for verification
  const captureFace = async () => {
    try {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) {
        throw new Error('Video or canvas not ready');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const faceImageData = canvas.toDataURL('image/jpeg');

      // Simulate face detection (in production, use AI service like Face-API.js)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const detected = Math.random() > 0.1; // 90% success rate for demo
      setFaceDetected(detected);

      if (detected) {
        // Simulate face verification against registered image
        await new Promise(resolve => setTimeout(resolve, 1000));
        const verified = Math.random() > 0.15; // 85% match rate
        setFaceVerified(verified);

        if (verified) {
          setSetupProgress(66);
          setCurrentStep(3);
          setErrors([]);
        } else {
          setErrors(prev => [...prev, {
            step: 'Face Verification',
            message: 'Face does not match registered image. Please try again.'
          }]);
        }
      } else {
        setErrors(prev => [...prev, {
          step: 'Face Detection',
          message: 'No face detected. Please ensure good lighting and face the camera.'
        }]);
      }
    } catch (error) {
      console.error('Face capture error:', error);
      setErrors(prev => [...prev, {
        step: 'Face Capture',
        message: 'Failed to capture face. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Environment check
  const checkEnvironment = async () => {
    try {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Simulate environment analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const multipleFaces = Math.random() > 0.9; // 10% chance of multiple faces
      const suspiciousObjects = Math.random() > 0.95; // 5% chance of objects
      
      if (multipleFaces || suspiciousObjects) {
        setErrors(prev => [...prev, {
          step: 'Environment Check',
          message: multipleFaces 
            ? 'Multiple people detected. Please ensure you are alone.' 
            : 'Suspicious objects detected. Please clear your workspace.'
        }]);
      } else {
        setEnvironmentChecked(true);
        setSetupProgress(100);
        setErrors([]);
        
        // Setup complete
        setTimeout(() => {
          if (onSetupComplete) {
            onSetupComplete({
              cameraAccess: true,
              microphoneAccess: true,
              faceVerified: true,
              environmentClean: true
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Environment check error:', error);
      setErrors(prev => [...prev, {
        step: 'Environment Check',
        message: 'Failed to check environment. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Shield className="h-8 w-8" />
            AI Proctoring Setup
          </CardTitle>
          <p className="text-blue-100 mt-2">
            Complete the following steps to verify your identity and environment
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Setup Progress</span>
              <span>{setupProgress}%</span>
            </div>
            <Progress value={setupProgress} className="h-2" />
          </div>

          {/* Steps Indicator */}
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = setupProgress >= (index + 1) * 33;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="text-center">
                  <div className={`
                    mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-100 text-green-600' : 
                      isCurrent ? 'bg-blue-100 text-blue-600' : 
                      'bg-gray-100 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                  </div>
                  <p className="text-xs font-medium">{step.title}</p>
                </div>
              );
            })}
          </div>

          {/* Errors Display */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{error.step}:</strong> {error.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Preview */}
          {cameraAccess && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Status Indicators */}
              <div className="absolute top-4 right-4 space-y-2">
                <Badge className={cameraAccess ? 'bg-green-500' : 'bg-red-500'}>
                  <Camera className="h-3 w-3 mr-1" />
                  Camera
                </Badge>
                <Badge className={microphoneAccess ? 'bg-green-500' : 'bg-red-500'}>
                  <Mic className="h-3 w-3 mr-1" />
                  Microphone
                </Badge>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-4">
            {currentStep === 1 && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Camera & Microphone Access</h3>
                <p className="text-gray-600">
                  We need access to your camera and microphone to monitor the exam.
                </p>
                <Button 
                  onClick={requestMediaAccess}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Requesting Access...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mr-2" />
                      Grant Access
                    </>
                  )}
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Face Verification</h3>
                <p className="text-gray-600">
                  Look directly at the camera. We'll verify your identity.
                </p>
                <Button 
                  onClick={captureFace}
                  disabled={isProcessing || !cameraAccess}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Verifying Face...
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 mr-2" />
                      Capture & Verify Face
                    </>
                  )}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Environment Check</h3>
                <p className="text-gray-600">
                  We'll scan your surroundings to ensure a fair testing environment.
                </p>
                <Button 
                  onClick={checkEnvironment}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Checking Environment...
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      Check Environment
                    </>
                  )}
                </Button>
              </div>
            )}

            {environmentChecked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center space-y-4 py-8"
              >
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold text-green-600">Setup Complete!</h3>
                <p className="text-gray-600">
                  All verification steps passed. You can now proceed to the exam.
                </p>
              </motion.div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Important Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Ensure good lighting and a clear background</li>
              <li>Remove any unauthorized materials from your desk</li>
              <li>Stay alone in the room during the exam</li>
              <li>Keep your face visible to the camera at all times</li>
              <li>Do not switch tabs or open other applications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIProctoringSetup;
