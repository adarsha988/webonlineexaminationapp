import mongoose from 'mongoose';

const supportQuerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  issue: {
    type: String,
    required: true,
    maxlength: 1000
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'exam', 'account', 'other'],
    default: 'other'
  },
  response: {
    type: String,
    default: null
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
supportQuerySchema.index({ studentId: 1, createdAt: -1 });
supportQuerySchema.index({ status: 1, createdAt: -1 });
supportQuerySchema.index({ email: 1 });

const SupportQuery = mongoose.model('SupportQuery', supportQuerySchema);

export default SupportQuery;
