import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  company: { type: String, required: true },
  profileImage: { type: String }, // URL of image
  message: { type: String, required: true },

}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
