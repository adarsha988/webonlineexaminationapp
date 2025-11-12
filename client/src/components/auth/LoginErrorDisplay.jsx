import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, UserX, Lock, ShieldX, Wifi, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const LoginErrorDisplay = ({ error, errorType, onRetry, onContactSupport }) => {
  if (!error) return null;

  const getErrorConfig = (errorType) => {
    switch (errorType) {
      case 'USER_NOT_FOUND':
        return {
          icon: UserX,
          title: 'Account Not Found',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          suggestions: [
            'Double-check your email address for typos',
            'Try using a different email if you have multiple accounts',
            'Register for a new account if you haven\'t signed up yet'
          ],
          showRegisterButton: true
        };
      
      case 'INVALID_PASSWORD':
        return {
          icon: Lock,
          title: 'Incorrect Password',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          suggestions: [
            'Check if Caps Lock is on',
            'Make sure you\'re entering the correct password',
            'Try typing your password in a text editor first to verify'
          ],
          showForgotPassword: true
        };
      
      case 'ACCOUNT_INACTIVE':
        return {
          icon: UserX,
          title: 'Account Inactive',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          suggestions: [
            'Your account needs to be activated by an administrator',
            'Contact your institution\'s IT support',
            'Check if you received an activation email'
          ],
          showContactSupport: true
        };
      
      case 'ACCOUNT_SUSPENDED':
        return {
          icon: ShieldX,
          title: 'Account Suspended',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          suggestions: [
            'Your account has been temporarily suspended',
            'Contact the administrator for assistance',
            'Review the terms of service for possible violations'
          ],
          showContactSupport: true
        };
      
      case 'NETWORK_ERROR':
        return {
          icon: Wifi,
          title: 'Connection Problem',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable VPN if you\'re using one'
          ],
          showRetryButton: true
        };
      
      default:
        return {
          icon: AlertCircle,
          title: 'Login Failed',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          suggestions: [
            'Please try again',
            'Check your credentials',
            'Contact support if the problem persists'
          ],
          showRetryButton: true
        };
    }
  };

  const config = getErrorConfig(errorType);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="mb-6"
      >
        <Alert className={`${config.bgColor} ${config.borderColor} border-2`}>
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
            >
              <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
            </motion.div>
            
            <div className="flex-1">
              <motion.h4 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`font-semibold ${config.color} mb-2`}
              >
                {config.title}
              </motion.h4>
              
              <AlertDescription className="text-gray-700 mb-3">
                {error}
              </AlertDescription>
              
              {config.suggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <p className="text-sm font-medium text-gray-600 mb-2">Suggestions:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {config.suggestions.map((suggestion, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + (index * 0.05) }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-gray-400 mt-1.5">•</span>
                        <span>{suggestion}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {config.showRetryButton && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Try Again
                  </Button>
                )}
                
                {config.showForgotPassword && (
                  <Button
                    onClick={() => {/* Handle forgot password */}}
                    size="sm"
                    variant="ghost"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </Button>
                )}
                
                {config.showRegisterButton && (
                  <Button
                    onClick={() => window.location.href = '/register'}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Register Account
                  </Button>
                )}
                
                {config.showContactSupport && (
                  <Button
                    onClick={onContactSupport}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Contact Support
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginErrorDisplay;
