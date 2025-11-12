import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' }
  ];

  const campusInfo = [
    { label: 'Patan Dhoka, Lalitpur-3', href: '#contact' },
    { label: 'Bagmati Province, Nepal', href: '#contact' }
  ];



  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div 
              className="flex items-center space-x-2 mb-3"
              whileHover={{ scale: 1.05 }}
            >
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold">E-XAM</span>
            </motion.div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering education through innovative online examination solutions.
            </p>
            <motion.a
              href="https://pmc.tu.edu.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="h-4 w-4" />
              Visit Patan Multiple Campus
            </motion.a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Location */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Campus Location</h3>
            <ul className="space-y-2">
              {campusInfo.map((info, index) => (
                <li key={index}>
                  <a
                    href={info.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {info.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs">
            <p className="text-gray-400">
              © {new Date().getFullYear()} E-XAM. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span className="text-gray-400">Made with ❤️ for educators</span>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
