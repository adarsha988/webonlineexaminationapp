import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Users } from 'lucide-react';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch testimonials from API
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonial');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      } else {
        // Fallback to sample testimonials if API fails
        setTestimonials(sampleTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials(sampleTestimonials);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users have to say about their experience with E-XAM
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-blue-600 opacity-20 absolute top-4 right-4" />
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.message}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.profileImage}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3b82f6&color=fff&size=150`;
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.designation}</p>
           
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
