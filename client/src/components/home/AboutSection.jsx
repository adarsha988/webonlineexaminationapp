import { motion } from 'framer-motion';
import { CheckCircle, Target, Users, Zap } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: 'Precision Testing',
      description: 'Advanced algorithms ensure accurate assessment and fair evaluation for all students.'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Connect educators and students in a seamless digital learning environment.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get immediate feedback and detailed analytics to track progress effectively.'
    },
    {
      icon: CheckCircle,
      title: 'Secure Platform',
      description: 'Enterprise-grade security ensures data protection and exam integrity.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">E-XAM</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              A modern online examination platform designed for educational institutions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
