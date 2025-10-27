import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Shield, UserCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [existingEmails, setExistingEmails] = useState([]);
  const [emailsLoaded, setEmailsLoaded] = useState(false);
  const { toast } = useToast();

  // Fetch all existing emails from database
  const fetchExistingEmails = useCallback(async () => {
    try {
      const response = await fetch('/api/users/emails', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExistingEmails(data.emails || []);
        console.log('📧 Loaded existing emails:', data.emails?.length || 0);
      } else {
        console.log('Failed to fetch existing emails, using fallback');
        // Fallback to common emails if API fails
        setExistingEmails([
          'admin@admin.com',
          'bob@student.edu',
          'emma@student.edu', 
          'john@instructor.edu',
          'jane@instructor.edu'
        ]);
      }
    } catch (error) {
      console.log('Error fetching existing emails:', error);
      // Fallback to common emails if API fails
      setExistingEmails([
        'admin@admin.com',
        'bob@student.edu',
        'emma@student.edu', 
        'john@instructor.edu',
        'jane@instructor.edu'
      ]);
    } finally {
      setEmailsLoaded(true);
    }
  }, []);

  // Load existing emails when modal opens
  useEffect(() => {
    if (isOpen && !emailsLoaded) {
      fetchExistingEmails();
    }
  }, [isOpen, emailsLoaded, fetchExistingEmails]);

  // Reset email cache when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmailsLoaded(false);
      setExistingEmails([]);
      setEmailExists(false);
      setEmailChecking(false);
    }
  }, [isOpen]);

  // Debounced email checking function
  const checkEmailExists = useCallback(async (email) => {
    if (!email || email.length < 3 || !email.includes('@')) {
      setEmailExists(false);
      return;
    }

    setEmailChecking(true);
    
    // First check against loaded emails immediately
    if (existingEmails.includes(email.toLowerCase())) {
      setEmailExists(true);
      setEmailChecking(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailExists(data.exists);
      } else if (response.status === 500) {
        // Server error - fallback to common email check only
        console.log('Server error checking email, using fallback validation');
        setEmailExists(false);
      } else {
        // Other errors
        setEmailExists(false);
      }
    } catch (error) {
      console.log('Email check failed, using fallback validation:', error);
      setEmailExists(false);
    } finally {
      setEmailChecking(false);
    }
  }, [existingEmails]);

  // Debounce email checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailExists(formData.email);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData.email, checkEmailExists]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (emailExists) {
      newErrors.email = 'This email is already registered';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newUser = await response.json();
        toast({
          title: "Success!",
          description: "User created successfully",
          variant: "default"
        });
        
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          department: '',
          phone: ''
        });
        
        // Add the new email to the existing emails list for immediate validation
        setExistingEmails(prev => [...prev, formData.email.toLowerCase()]);
        
        onUserAdded?.(newUser);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        phone: ''
      });
      setErrors({});
      onClose();
    }
  };

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'admin', label: 'Administrator' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="relative pb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </motion.button>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              Add New User
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Create a new user account with appropriate permissions
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 pr-10 ${
                      errors.email || emailExists 
                        ? 'border-red-500 focus:border-red-500' 
                        : formData.email && !emailChecking && !emailExists 
                        ? 'border-green-500 focus:border-green-500' 
                        : ''
                    }`}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                  {emailChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!emailChecking && formData.email && emailExists && (
                    <X className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                  {!emailChecking && formData.email && !emailExists && formData.email.includes('@') && (
                    <UserCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {emailExists && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    This email is already registered
                  </motion.p>
                )}
                {!emailExists && formData.email && !emailChecking && formData.email.includes('@') && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-600 flex items-center gap-1"
                  >
                    <UserCheck className="h-3 w-3" />
                    Email is available
                  </motion.p>
                )}
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={`pl-10 ${errors.role ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.role && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600"
                  >
                    {errors.role}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                  Department (Optional)
                </Label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter department"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddUserModal;
