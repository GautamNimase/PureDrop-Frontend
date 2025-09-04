import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const { isAdmin, logout, user } = useAuth();

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Employees', href: '/admin/employees', icon: UserGroupIcon },
    { name: 'Water Connections', href: '/admin/connections', icon: CogIcon },
    { name: 'Meter Readings', href: '/admin/readings', icon: ChartBarIcon },
    { name: 'Bills', href: '/admin/bills', icon: DocumentTextIcon },
    { name: 'Water Sources', href: '/admin/sources', icon: BeakerIcon },
    { name: 'Complaints', href: '/admin/complaints', icon: ExclamationTriangleIcon },
    { name: 'Audit Logs', href: '/admin/audit', icon: ClipboardDocumentListIcon },
    { name: 'Alerts', href: '/admin/alerts', icon: ExclamationTriangleIcon },
  ];

  const userNavItems = [
    { name: 'Dashboard', href: '/user', icon: HomeIcon },
    { name: 'My Profile', href: '/user/profile', icon: UsersIcon },
    { name: 'My Connections', href: '/user/connections', icon: CogIcon },
    { name: 'My Readings', href: '/user/readings', icon: ChartBarIcon },
    { name: 'My Bills', href: '/user/bills', icon: DocumentTextIcon },
  ];

  const navItems = isAdmin() ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logout();
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      {setIsMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200
      `}>
        {/* User Card */}
        <div className="flex flex-col items-center gap-2 py-8 px-4 bg-white rounded-b-3xl shadow-md">
          <div className="w-16 h-16 rounded-full border-4 border-blue-100 shadow bg-gray-200 flex items-center justify-center text-2xl font-bold text-blue-500 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              user?.name ? user.name[0] : '?' 
            )}
          </div>
          <div className="text-base font-semibold text-gray-800 mt-1">{user?.name || 'User'}</div>
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${user?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{user?.status || 'Unknown'}</div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center h-12 bg-transparent px-4 mt-2 mb-1">
          <h1 className="text-lg font-bold text-blue-400 truncate">PureDrop</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 gap-3 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold shadow'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 mt-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 gap-3"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 