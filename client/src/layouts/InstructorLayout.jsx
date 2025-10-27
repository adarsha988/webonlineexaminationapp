import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Home, FileText, CheckCircle, Database, Plus } from 'lucide-react';
import LogoutModal from '../components/LogoutModal';

const InstructorLayout = ({ children }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const navItems = [
    { path: '/instructor/dashboard', label: 'Dashboard', icon: Home },
    { path: '/instructor/exams', label: 'All Exams', icon: FileText },
    { path: '/instructor/completed-exams', label: 'Completed Exams', icon: CheckCircle },
    { path: '/instructor/question-bank', label: 'Question Bank', icon: Database },
    { path: '/instructor/exam-creation', label: 'Create Exam', icon: Plus },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">Instructor Portal</h1>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
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
