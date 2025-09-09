import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ModernSidebar from '../common/ModernSidebar';
import ModernHeader from '../common/ModernHeader';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import UserOverview from './UserOverview';
import UserProfile from './UserProfile';
import UserBills from './UserBills';
import UserConnections from './UserConnections';
import UserReadings from './UserReadings';
import WaterUsageChart from './WaterUsageChart';
import { useHeader } from '../../context/HeaderContext';
import { useAuth } from '../../context/AuthContext';

const MainContent = ({ children, currentPage = "overview" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isDarkMode,
    notificationCount,
    showNotifications,
    toggleTheme,
    handleNotifications,
    handleProfile,
    handleSettings,
    handleSearch,
    handleMenuToggle
  } = useHeader();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-green-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Sidebar */}
      <ModernSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden relative z-10 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-80'}`}>
        {/* Modern Header */}
        <ModernHeader
          title="User Dashboard"
          subtitle="Manage your water services"
          user={user}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onSearch={handleSearch}
          onNotifications={handleNotifications}
          onProfile={handleProfile}
          onSettings={handleSettings}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          showNotifications={showNotifications}
          notificationCount={notificationCount}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-20">
          {children || (
            <Routes>
              <Route path="/" element={<UserOverview />} />
              <Route path="/overview" element={<UserOverview />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/bills" element={<UserBills />} />
              <Route path="/connections" element={<UserConnections />} />
              <Route path="/readings" element={<UserReadings />} />
              <Route path="/usage" element={<WaterUsageChart />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
};

const UserLayout = ({ children, currentPage = "overview" }) => {
  return (
    <SidebarProvider>
      <MainContent children={children} currentPage={currentPage} />
    </SidebarProvider>
  );
};

export default UserLayout;
