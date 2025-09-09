import React, { createContext, useContext, useState, useCallback } from 'react';

const HeaderContext = createContext();

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

export const HeaderProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
    // Apply theme to document
    document.documentElement.classList.toggle('dark', !isDarkMode);
  }, [isDarkMode]);

  const handleNotifications = useCallback(() => {
    setNotificationCount(0);
    // Show notifications modal or navigate to notifications page
    alert('Notifications panel would open here. This would show all system notifications and alerts.');
    console.log('Notifications clicked');
  }, []);

  const handleProfile = useCallback(() => {
    // Navigate to profile page or open profile modal
    alert('Profile page would open here. This would show user profile settings and account information.');
    console.log('Profile clicked');
  }, []);

  const handleSettings = useCallback(() => {
    // Navigate to settings page or open settings modal
    alert('Settings page would open here. This would show application settings, preferences, and configuration options.');
    console.log('Settings clicked');
  }, []);

  const handleSearch = useCallback((query) => {
    // Perform global search across the application
    if (query && query.trim()) {
      alert(`Searching for: "${query}". This would search across connections, bills, readings, and other data.`);
      console.log('Search:', query);
    }
  }, []);

  const handleMenuToggle = useCallback(() => {
    // Add menu toggle logic here
    console.log('Menu toggle');
  }, []);

  const value = {
    isDarkMode,
    notificationCount,
    showNotifications,
    toggleTheme,
    handleNotifications,
    handleProfile,
    handleSettings,
    handleSearch,
    handleMenuToggle,
    setNotificationCount,
    setShowNotifications
  };

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
};
