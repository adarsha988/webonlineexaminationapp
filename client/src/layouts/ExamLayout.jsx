import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GraduationCap, Bell, HelpCircle, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ExamLayout = ({ children, showHeader = true, examTitle, timeRemaining, progress }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {showHeader && (
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo Section - Left */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/student/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg hidden sm:inline">ExamPortal</span>
                </div>
              </motion.div>

              {/* Center - Exam Info */}
              {examTitle && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 text-center px-4 hidden md:block"
                >
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {examTitle}
                  </h1>
                  {progress !== undefined && (
                    <p className="text-sm text-gray-600">
                      {Math.round(progress)}% Complete
                    </p>
                  )}
                </motion.div>
              )}

              {/* Right - Timer & User Info */}
              <div className="flex items-center gap-3">
                {/* Timer Display */}
                {timeRemaining !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-semibold transition-all ${
                      timeRemaining < 300 
                        ? 'bg-red-100 text-red-700 animate-pulse shadow-lg' 
                        : timeRemaining < 600
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-base">{formatTime(timeRemaining)}</span>
                  </motion.div>
                )}

                {/* User Avatar */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 hidden sm:inline">
                    {user?.name}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default ExamLayout;
