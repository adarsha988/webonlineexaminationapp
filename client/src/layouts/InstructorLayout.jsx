import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';

const InstructorLayout = ({ children }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const navItems = [
    { path: '/instructor/dashboard', label: 'DASHBOARD' },
    { path: '/instructor/exams', label: 'ALL EXAMS' },
    { path: '/instructor/completed-exams', label: 'COMPLETED EXAMS' },
    { path: '/instructor/question-bank', label: 'QUESTION BANK' },
    { path: '/instructor/exam-creation', label: 'CREATE EXAM' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 shadow-2xl">
        <div className="max-w-full px-8">
          <div className="flex justify-between items-center py-6">
            {/* Left side - Brand and Navigation */}
            <div className="flex items-center space-x-12">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                INSTRUCTOR PORTAL
              </h1>
              
              {/* Navigation Links */}
              <div className="hidden lg:flex items-center space-x-2">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-6 py-3 text-sm font-extrabold tracking-wide transition-all duration-300 rounded-md ${
                        active
                          ? 'bg-white text-indigo-700 shadow-lg transform scale-105'
                          : 'text-white hover:bg-white/20 hover:scale-105'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Right side - User Info & Logout */}
            <div className="flex items-center space-x-6">
              <div className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-lg border-2 border-white/30">
                <span className="text-sm font-bold text-white uppercase tracking-wider">{user?.name}</span>
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide rounded-md transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                title="Logout"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
      
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
};

export default InstructorLayout;
