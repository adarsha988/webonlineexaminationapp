import React from 'react';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import MathQuizSection from './MathQuizSection';
import LocationSection from './LocationSection';
import ContactSection from './ContactSection';

const HomePage = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen">
      <HeroSection onOpenAuth={onOpenAuth} />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <MathQuizSection />
      <LocationSection />
      <ContactSection />
    </div>
  );
};

export default HomePage;
