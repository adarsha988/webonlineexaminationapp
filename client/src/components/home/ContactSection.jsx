import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();




  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Subject: ${formData.subject}\n\n${formData.message}`
        }),
      });

      if (response.ok) {
        toast({
          title: "Message Sent Successfully! ✅",
          description: "Thank you for contacting us. We'll get back to you within 24 hours.",
          variant: "default",
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to Send Message",
          description: errorData.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact" className="py-20 bg-gray-50">
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
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our platform? We're here to help you get started 
            with your online examination needs.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-name" className="text-gray-700">Name</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-gray-700">Email</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-subject" className="text-gray-700">Subject</Label>
                <Input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="What's this about?"
                  autoComplete="off"
                />
              </div>

              <div>
                <Label htmlFor="contact-message" className="text-gray-700">Message</Label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us more about your needs..."
                  autoComplete="off"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </div>
                )}
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
