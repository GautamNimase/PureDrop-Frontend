import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import SidebarHeader from './SidebarHeader';
import SidebarProfile from './SidebarProfile';
import SidebarSection from './SidebarSection';
import SidebarFooter from './SidebarFooter';
import SidebarDebug from './SidebarDebug';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const ModernSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const { isAdmin, logout, user } = useAuth();
  const { 
    isCollapsed, 
    setIsCollapsed, 
    hoveredItem, 
    setHoveredItem, 
    activeSection, 
    setActiveSection 
  } = useSidebar();
  
  // Make sidebar visible by default on desktop
  const [isDesktopVisible, setIsDesktopVisible] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  // Enhanced navigation items with categories and modern icons
  const adminNavItems = [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon, color: 'from-blue-500 to-cyan-500', description: 'Main overview' },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'from-purple-500 to-pink-500', description: 'Data insights' },
      ]
    },
    {
      category: 'Management',
      items: [
        { name: 'Users', href: '/admin/users', icon: UsersIcon, color: 'from-green-500 to-emerald-500', description: 'User accounts' },
        { name: 'Employees', href: '/admin/employees', icon: UserGroupIcon, color: 'from-orange-500 to-red-500', description: 'Staff management' },
        { name: 'Connections', href: '/admin/connections', icon: CogIcon, color: 'from-indigo-500 to-blue-500', description: 'Water connections' },
      ]
    },
    {
      category: 'Operations',
      items: [
        { name: 'Readings', href: '/admin/readings', icon: ChartBarIcon, color: 'from-teal-500 to-cyan-500', description: 'Meter readings' },
        { name: 'Bills', href: '/admin/bills', icon: DocumentTextIcon, color: 'from-yellow-500 to-orange-500', description: 'Billing system' },
        { name: 'Sources', href: '/admin/sources', icon: BeakerIcon, color: 'from-pink-500 to-rose-500', description: 'Water sources' },
      ]
    },
    {
      category: 'Support',
      items: [
        { name: 'Complaints', href: '/admin/complaints', icon: ExclamationTriangleIcon, color: 'from-red-500 to-pink-500', description: 'User complaints' },
        { name: 'Alerts', href: '/admin/alerts', icon: BellIcon, color: 'from-amber-500 to-yellow-500', description: 'System alerts' },
        { name: 'Audit Logs', href: '/admin/audit', icon: ClipboardDocumentListIcon, color: 'from-gray-500 to-slate-500', description: 'Activity logs' },
      ]
    }
  ];

  const userNavItems = [
    {
      category: 'Dashboard',
      items: [
        { name: 'Overview', href: '/user', icon: HomeIcon, color: 'from-blue-500 to-cyan-500', description: 'Main dashboard' },
        { name: 'Usage Analytics', href: '/user/usage', icon: ChartBarIcon, color: 'from-purple-500 to-pink-500', description: 'Usage insights' },
      ]
    },
    {
      category: 'Account',
      items: [
        { name: 'My Profile', href: '/user/profile', icon: UserCircleIcon, color: 'from-green-500 to-emerald-500', description: 'Profile settings' },
        { name: 'Connections', href: '/user/connections', icon: CogIcon, color: 'from-indigo-500 to-blue-500', description: 'My connections' },
      ]
    },
    {
      category: 'Services',
      items: [
        { name: 'Readings', href: '/user/readings', icon: ChartBarIcon, color: 'from-teal-500 to-cyan-500', description: 'Meter readings' },
        { name: 'Bills', href: '/user/bills', icon: DocumentTextIcon, color: 'from-yellow-500 to-orange-500', description: 'Payment history' },
      ]
    }
  ];

  const navItems = isAdmin() ? adminNavItems : userNavItems;

  // Animation variants
  const sidebarVariants = {
    open: {
      width: isCollapsed ? 80 : 280,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    closed: {
      width: isCollapsed ? 80 : 280,
      x: -280,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  const handleLogout = () => {
    logout();
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSection = (category) => {
    setExpandedSection(expandedSection === category ? null : category);
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={(isMobileMenuOpen || isDesktopVisible) ? "open" : "closed"}
        className={`
          fixed left-0 top-0 h-full z-50 overflow-hidden
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          shadow-2xl
          lg:translate-x-0
          ${(isMobileMenuOpen || isDesktopVisible) ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <SidebarHeader 
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            isAdmin={isAdmin()}
            delay={0.1}
          />

          {/* User Profile Section */}
          <SidebarProfile 
            user={user}
            isAdmin={isAdmin()}
            isCollapsed={isCollapsed}
            delay={0.2}
          />

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((section, sectionIndex) => (
              <SidebarSection
                key={section.category}
                section={section}
                isCollapsed={isCollapsed}
                expandedSection={expandedSection}
                onToggleSection={toggleSection}
                onHover={setHoveredItem}
                onLeave={() => setHoveredItem(null)}
                onClick={() => setIsMobileMenuOpen(false)}
                isActive={isActive}
                delay={sectionIndex * 0.1}
              />
            ))}
          </div>

          {/* Footer Actions */}
          <SidebarFooter 
            isCollapsed={isCollapsed}
            onLogout={handleLogout}
            delay={0.4}
          />
        </div>
      </motion.aside>
      
    </>
  );
};

export default ModernSidebar;
