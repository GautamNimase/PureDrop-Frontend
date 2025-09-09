import React from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon } from '@heroicons/react/24/outline';

const SidebarHeader = ({ 
  isCollapsed, 
  onToggleCollapse, 
  isAdmin = false,
  delay = 0 
}) => {
  return (
    <motion.div 
      className="p-6 border-b border-white/10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-7 h-7 bg-white rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"></div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 blur-md opacity-30"></div>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-white font-poppins">
                WaterSys
              </h2>
              <p className="text-sm text-white/70 font-inter">
                {isAdmin ? 'Admin Panel' : 'User Portal'}
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Collapse Toggle */}
        <motion.button
          onClick={onToggleCollapse}
          className="hidden lg:block p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bars3Icon className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SidebarHeader;
