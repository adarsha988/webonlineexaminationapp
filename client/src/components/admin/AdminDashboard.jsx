import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import UserManagement from './UserManagement';
import AddUserModal from './AddUserModal';
import NotificationBell from './NotificationBell';
import LogoutModal from '../LogoutModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'Settings' }
  ];

  const handleExportData = async (format = 'json') => {
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: `Data exported as ${format.toUpperCase()} file`,
          variant: "default"
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="hidden lg:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <span className="text-sm text-gray-600">System Online</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Export Buttons - Hidden on mobile */}
              <div className="hidden md:flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportData('csv')}
                  size="sm"
                >
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData('json')}
                  size="sm"
                >
                  JSON
                </Button>
              </div>
              
              {/* Notifications */}
              <NotificationBell />

              {/* User Profile & Logout */}
              <div className="relative flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1">
                  <span className="text-sm text-gray-700">Admin</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex space-x-1 py-2">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 min-w-0 flex-1 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6 lg:space-y-8">
              <DashboardStats />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                <div className="xl:col-span-2">
                  <RecentActivity />
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setShowAddUserModal(true)}
                          className="h-16 sm:h-20 flex-col w-full"
                          variant="outline"
                        >
                          <span className="text-xs sm:text-sm">Add User</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setActiveTab('users')}
                          className="h-16 sm:h-20 flex-col w-full"
                          variant="outline"
                        >
                          <span className="text-xs sm:text-sm">Users</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Name
                      </label>
                      <Input defaultValue="E-XAM" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Email
                      </label>
                      <Input defaultValue="admin@example.com" />
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
onUserAdded={() => setShowAddUserModal(false)}
      />

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
};

export default AdminDashboard;
