import React from 'react';

const SidebarDebug = ({ isMobileMenuOpen, isDesktopVisible, isCollapsed }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-20 right-4 bg-black/80 text-white p-2 rounded-lg text-xs z-50">
      <div>Mobile Open: {isMobileMenuOpen ? 'Yes' : 'No'}</div>
      <div>Desktop Visible: {isDesktopVisible ? 'Yes' : 'No'}</div>
      <div>Collapsed: {isCollapsed ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default SidebarDebug;
