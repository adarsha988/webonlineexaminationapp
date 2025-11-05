import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SecurityVerification from '../../components/proctoring/SecurityVerification';

/**
 * ExamSecurityCheck Page
 * 
 * This page is shown before the actual exam begins.
 * It guides students through the security verification process:
 * 1. Shows security instructions
 * 2. Requests camera and microphone permissions
 * 3. Performs face detection verification
 * 4. Checks audio environment
 * 5. Redirects to exam once all checks pass
 */
const ExamSecurityCheck = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [examData, setExamData] = useState({
    id: examId || 'EXAM001',
    title: 'Final Examination - Computer Science'
  });

  const handleVerificationComplete = (verificationData, mediaStream) => {
    console.log('Verification completed:', verificationData);
    
    // Store verification data and media stream for the exam
    // You can pass this data to the exam interface
    sessionStorage.setItem('verificationData', JSON.stringify(verificationData));
    
    // Navigate to the actual exam page with the media stream
    // The exam page should continue monitoring
    navigate(`/student/exam/${examData.id}`, {
      state: {
        verificationData,
        mediaStream,
        securityVerified: true
      }
    });
  };

  return (
    <SecurityVerification
      examId={examData.id}
      examTitle={examData.title}
      onVerificationComplete={handleVerificationComplete}
    />
  );
};

export default ExamSecurityCheck;
