import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  UserCircleIcon, 
  CogIcon, 
  SunIcon, 
  MoonIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '../../context/SidebarContext';

const ModernHeader = ({ 
  title = "User Dashboard",
  subtitle,
  user,
  onMenuToggle,
  onSearch,
  onNotifications,
  onProfile,
  onSettings,
  isDarkMode = false,
  onThemeToggle,
  showNotifications = true,
  notificationCount = 0
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { isCollapsed } = useSidebar();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: 0.95, 
      transition: { duration: 0.1 } 
    }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`
        fixed top-0 z-50 transition-all duration-500 ease-out
        ${isCollapsed ? 'lg:left-20' : 'lg:left-80'}
        right-0
        ${isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50'
          : 'bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-green-500/95 backdrop-blur-xl shadow-lg'
        }
      `}
    >
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Section - Logo & Title */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center space-x-6"
          >
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Enhanced Logo */}
              <div className="relative">
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-all duration-300
                  ${isScrolled 
                    ? 'bg-gradient-to-br from-blue-500 to-green-500 shadow-lg' 
                    : 'bg-white/20 shadow-xl'
                  }
                `}>
                  <div className={`
                    w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isScrolled ? 'bg-white' : 'bg-white/90'}
                  `}>
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg shadow-sm"></div>
                  </div>
                </div>
                {/* Subtle glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl blur-md opacity-30 transition-all duration-300
                  ${isScrolled 
                    ? 'bg-gradient-to-br from-blue-400 to-green-400' 
                    : 'bg-gradient-to-br from-white/40 to-white/20'
                  }
                `}></div>
              </div>
              
              {/* Enhanced Title Section */}
              <div className="space-y-1">
                <h1 className={`
                  text-2xl font-bold font-poppins tracking-tight transition-colors duration-300
                  ${isScrolled ? 'text-gray-900' : 'text-white'}
                `}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`
                    text-sm font-inter font-medium transition-colors duration-300
                    ${isScrolled ? 'text-gray-600' : 'text-white/90'}
                  `}>
                    {subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Center Section - Enhanced Search (Desktop) */}
          <motion.div 
            variants={itemVariants}
            className="hidden lg:flex flex-1 max-w-lg mx-12"
          >
            <AnimatePresence>
              {showSearch ? (
                <motion.div
                  key="search-input"
                  initial={{ width: 0, opacity: 0, scale: 0.95 }}
                  animate={{ width: "100%", opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-full"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search anything..."
                      className={`
                        w-full px-5 py-3 pl-12 pr-4 rounded-2xl font-inter text-sm
                        transition-all duration-300 backdrop-blur-sm border
                        ${isScrolled 
                          ? 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100' 
                          : 'bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50 focus:ring-4 focus:ring-white/20'
                        }
                      `}
                      onChange={(e) => onSearch && onSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onSearch && onSearch(e.target.value);
                          setShowSearch(false);
                        }
                      }}
                      onBlur={() => setShowSearch(false)}
                      autoFocus
                    />
                    <MagnifyingGlassIcon className={`
                      absolute left-4 top-3.5 w-5 h-5 transition-colors duration-300
                      ${isScrolled ? 'text-gray-400' : 'text-white/70'}
                    `} />
                    {/* Search suggestions indicator */}
                    <div className={`
                      absolute right-4 top-3.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300
                      ${isScrolled 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-white/20 text-white/80'
                      }
                    `}>
                      ⌘K
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="search-button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setShowSearch(true)}
                  className={`
                    flex items-center space-x-3 px-5 py-3 rounded-2xl font-inter text-sm font-medium
                    transition-all duration-300 backdrop-blur-sm border
                    ${isScrolled 
                      ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50 hover:border-gray-300/50' 
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
                    }
                  `}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Search</span>
                  <div className={`
                    px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300
                    ${isScrolled 
                      ? 'bg-gray-200 text-gray-600' 
                      : 'bg-white/20 text-white/80'
                    }
                  `}>
                    ⌘K
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Section - Enhanced Actions */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center space-x-3"
          >
            
            {/* Theme Toggle */}
            <motion.button
              onClick={onThemeToggle}
              className={`
                relative p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm border
                ${isScrolled 
                  ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50 hover:border-gray-300/50' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
                }
              `}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
              {/* Subtle glow effect */}
              <div className={`
                absolute inset-0 rounded-2xl blur-sm opacity-0 hover:opacity-30 transition-opacity duration-300
                ${isScrolled 
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                  : 'bg-gradient-to-br from-white/40 to-white/20'
                }
              `}></div>
            </motion.button>

            {/* Notifications */}
            {showNotifications && (
              <motion.button
                onClick={onNotifications}
                className={`
                  relative p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm border
                  ${isScrolled 
                    ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50 hover:border-gray-300/50' 
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
                  }
                `}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <BellIcon className="w-5 h-5" />
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </motion.div>
                )}
                {/* Subtle glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl blur-sm opacity-0 hover:opacity-30 transition-opacity duration-300
                  ${isScrolled 
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                    : 'bg-gradient-to-br from-white/40 to-white/20'
                  }
                `}></div>
              </motion.button>
            )}

            {/* Enhanced Profile */}
            <motion.button
              onClick={onProfile}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 backdrop-blur-sm border
                ${isScrolled 
                  ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50 hover:border-gray-300/50' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
                }
              `}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                {/* Profile status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-inter font-semibold">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs font-inter opacity-70">
                  Premium Plan
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className={`
                absolute inset-0 rounded-2xl blur-sm opacity-0 hover:opacity-30 transition-opacity duration-300
                ${isScrolled 
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                  : 'bg-gradient-to-br from-white/40 to-white/20'
                }
              `}></div>
            </motion.button>

            {/* Settings */}
            <motion.button
              onClick={onSettings}
              className={`
                relative p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm border
                ${isScrolled 
                  ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50 hover:border-gray-300/50' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
                }
              `}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <CogIcon className="w-5 h-5" />
              {/* Subtle glow effect */}
              <div className={`
                absolute inset-0 rounded-2xl blur-sm opacity-0 hover:opacity-30 transition-opacity duration-300
                ${isScrolled 
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                  : 'bg-gradient-to-br from-white/40 to-white/20'
                }
              `}></div>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`
                lg:hidden p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm border
                ${isScrolled 
                  ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50 hover:border-gray-300/50' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40'
                }
              `}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`
                lg:hidden border-t backdrop-blur-sm py-6
                ${isScrolled 
                  ? 'border-gray-200/50 bg-white/95' 
                  : 'border-white/20 bg-white/10'
                }
              `}
            >
              <div className="space-y-4">
                {/* Enhanced Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className={`
                      w-full px-5 py-3 pl-12 pr-4 rounded-2xl font-inter text-sm
                      transition-all duration-300 backdrop-blur-sm border
                      ${isScrolled 
                        ? 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100' 
                        : 'bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50 focus:ring-4 focus:ring-white/20'
                      }
                    `}
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSearch && onSearch(e.target.value);
                        setShowMobileMenu(false);
                      }
                    }}
                  />
                  <MagnifyingGlassIcon className={`
                    absolute left-4 top-3.5 w-5 h-5 transition-colors duration-300
                    ${isScrolled ? 'text-gray-400' : 'text-white/70'}
                  `} />
                </div>
                
                {/* Enhanced Mobile Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button 
                    className={`
                      flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl font-inter text-sm font-medium
                      transition-all duration-300 backdrop-blur-sm border
                      ${isScrolled 
                        ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50' 
                        : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BellIcon className="w-5 h-5" />
                    <span>Notifications</span>
                    {notificationCount > 0 && (
                      <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </div>
                    )}
                  </motion.button>
                  
                  <motion.button 
                    className={`
                      flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl font-inter text-sm font-medium
                      transition-all duration-300 backdrop-blur-sm border
                      ${isScrolled 
                        ? 'bg-gray-50/80 hover:bg-gray-100/90 text-gray-700 border-gray-200/50' 
                        : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CogIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </motion.button>
                </div>

                {/* Mobile Profile Section */}
                <motion.div 
                  className={`
                    flex items-center space-x-4 py-4 px-4 rounded-2xl font-inter
                    transition-all duration-300 backdrop-blur-sm border
                    ${isScrolled 
                      ? 'bg-gray-50/80 text-gray-700 border-gray-200/50' 
                      : 'bg-white/20 text-white border-white/30'
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <UserCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-sm opacity-70">
                      Premium Plan • Online
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default ModernHeader;
