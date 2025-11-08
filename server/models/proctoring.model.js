import mongoose from 'mongoose';

const proctoringSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true
  },
  studentExam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentExam'
  },
  
  // Pre-exam verification
  verification: {
    faceVerified: {
      type: Boolean,
      default: false
    },
    faceVerificationScore: {
      type: Number,
      min: 0,
      max: 100
    },
    environmentChecked: {
      type: Boolean,
      default: false
    },
    verificationTimestamp: Date,
    faceImageUrl: String,
    environmentImageUrls: [String]
  },

  // Session information
  sessionStart: {
    type: Date,
    default: Date.now
  },
  sessionEnd: Date,
  duration: Number, // in seconds
  status: {
    type: String,
    enum: ['pending', 'verified', 'in_progress', 'completed', 'flagged', 'terminated'],
    default: 'pending'
  },

  // Real-time monitoring data
  monitoring: {
    cameraEnabled: {
      type: Boolean,
      default: false
    },
    microphoneEnabled: {
      type: Boolean,
      default: false
    },
    screenRecording: {
      type: Boolean,
      default: false
    },
    lastHeartbeat: Date,
    tabSwitches: {
      type: Number,
      default: 0
    },
    copyPasteAttempts: {
      type: Number,
      default: 0
    }
  },

  // AI Analysis results
  aiAnalysis: {
    totalViolations: {
      type: Number,
      default: 0
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    faceDisappearances: {
      type: Number,
      default: 0
    },
    multipleFacesDetected: {
      type: Number,
      default: 0
    },
    suspiciousObjectsDetected: {
      type: Number,
      default: 0
    },
    audioAnomalies: {
      type: Number,
      default: 0
    },
    gazeAnomalies: {
      type: Number,
      default: 0
    }
  },

  // Violation events (stored separately for detailed tracking)
  violations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProctoringViolation'
  }],

  // Recording URLs
  recordings: {
    videoUrl: String,
    audioUrl: String,
    screenRecordingUrl: String,
    snapshots: [String]
  },

  // Review and decision
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  decision: {
    type: String,
    enum: ['cleared', 'warning', 'flagged_for_review', 'disqualified'],
    default: null
  },

  // Technical information
  browserInfo: {
    userAgent: String,
    browserName: String,
    browserVersion: String,
    os: String,
    screenResolution: String
  },
  ipAddress: String,
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
proctoringSessionSchema.index({ student: 1, exam: 1 });
proctoringSessionSchema.index({ status: 1 });
proctoringSessionSchema.index({ 'aiAnalysis.riskLevel': 1 });
proctoringSessionSchema.index({ reviewed: 1 });

const ProctoringSession = mongoose.model('ProctoringSession', proctoringSessionSchema);

// Violation model for detailed tracking
const proctoringViolationSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProctoringSession',
    required: true,
    index: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'face_not_detected',
      'multiple_faces',
      'face_replaced',
      'gaze_away',
      'unauthorized_object',
      'audio_anomaly',
      'multiple_voices',
      'tab_switch',
      'copy_paste',
      'unauthorized_software',
      'screen_share',
      'person_left_frame',
      'suspicious_movement',
      'poor_lighting',
      'camera_blocked',
      'other'
    ],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  description: String,
  
  // AI confidence score
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Evidence
  evidence: {
    imageUrl: String,
    videoClipUrl: String,
    audioClipUrl: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Auto-detected or manual flag
  detectionMethod: {
    type: String,
    enum: ['ai_automatic', 'manual_flag', 'rule_based'],
    default: 'ai_automatic'
  },
  
  // For manual review
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  falsePositive: {
    type: Boolean,
    default: false
  },
  reviewNotes: String
}, {
  timestamps: true
});

// Indexes
proctoringViolationSchema.index({ session: 1, timestamp: 1 });
proctoringViolationSchema.index({ type: 1 });
proctoringViolationSchema.index({ severity: 1 });
proctoringViolationSchema.index({ reviewed: 1 });

const ProctoringViolation = mongoose.model('ProctoringViolation', proctoringViolationSchema);

export { ProctoringSession, ProctoringViolation };
export default ProctoringSession;
