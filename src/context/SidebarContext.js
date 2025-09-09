import React, { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const setActiveSectionHandler = useCallback((section) => {
    setActiveSection(section);
  }, []);

  const setHoveredItemHandler = useCallback((item) => {
    setHoveredItem(item);
  }, []);

  const value = {
    isCollapsed,
    isMobileOpen,
    activeSection,
    hoveredItem,
    toggleCollapse,
    toggleMobile,
    setActiveSection: setActiveSectionHandler,
    setHoveredItem: setHoveredItemHandler,
    setIsCollapsed,
    setIsMobileOpen
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
