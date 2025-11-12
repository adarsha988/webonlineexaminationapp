import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

const LocationSection = () => {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();

    // Listen for college selection events from ContactSection
    const handleCollegeSelection = (event) => {
      const { college } = event.detail;
      setSelectedCollege(college);
      
      // Highlight map after a short delay
      setTimeout(() => {
        const mapElement = document.getElementById('interactive-map');
        if (mapElement) {
          mapElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
          setTimeout(() => {
            mapElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
          }, 2000);
        }
      }, 500);
    };

    window.addEventListener('selectCollege', handleCollegeSelection);

    return () => {
      window.removeEventListener('selectCollege', handleCollegeSelection);
    };
  }, []);

  const fetchColleges = async () => {
    // Always use only Patan Multiple Campus data
    const patanCampus = {
      _id: 'patan-campus',
      name: 'Patan Multiple Campus',
      address: 'Patan Dhoka, Lalitpur-3, Bagmati Province, Nepal',
      coordinates: { lat: 27.6728, lng: 85.3242 },
      phone: '+977-1-5521693, +977-1-5521694',
      email: 'info@patanmultiplecampus.edu.np',
      website: 'https://pmc.tu.edu.np/',
      postalCode: '44700',
      district: 'Lalitpur',
      province: 'Bagmati Province'
    };
    setColleges([patanCampus]);
    setSelectedCollege(patanCampus);
    setLoading(false);
  };

  const handleCollegeClick = (college) => {
    setSelectedCollege(college);
    // Smooth scroll to map with highlighting effect
    const mapElement = document.getElementById('interactive-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlighting effect
      mapElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        mapElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
      }, 2000);
    }
  };

  const generateMapUrl = (college) => {
    // Return null to disable Google Maps embed and avoid CSP/blocking issues
    return null;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">Find Us</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visit our campus or get in touch with us. We're here to help you succeed.
          </p>
        </motion.div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div id="interactive-map" className="h-96 w-full relative transition-all duration-300 rounded-t-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
              {selectedCollege && (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCollege.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedCollege.address}</p>
                    <div className="space-y-2">
                      {selectedCollege.coordinates && (
                        <p className="text-sm text-gray-500">
                          📍 {selectedCollege.coordinates.lat}, {selectedCollege.coordinates.lng}
                        </p>
                      )}
                      {selectedCollege.website && (
                        <a
                          href={selectedCollege.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
            </div>
            <div className="p-6">
              {selectedCollege ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedCollege.name}</h3>
                    {selectedCollege.website && (
                      <a
                        href={selectedCollege.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    {selectedCollege.address}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our Campus</h3>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Loading location...
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600 font-medium">Patan Multiple Campus</p>
                    <p className="text-gray-600">Patan Dhoka, Lalitpur-3</p>
                    <p className="text-gray-600">Bagmati Province, Nepal</p>
                    <p className="text-gray-600">Postal Code: 44700</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+977-1-5521693</p>
                    <p className="text-gray-600">+977-1-5521694</p>
                    <p className="text-sm text-gray-500">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">info@patanmultiplecampus.edu.np</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Office Hours</h4>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Why Choose Us?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-blue-100">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-blue-100">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-blue-100">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-blue-100">Support</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
