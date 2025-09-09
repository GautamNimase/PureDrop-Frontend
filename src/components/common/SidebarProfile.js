import React from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const SidebarProfile = ({ 
  user, 
  isAdmin = false, 
  isCollapsed = false,
  delay = 0 
}) => {
  return (
    <motion.div 
      className="p-6 border-b border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <UserCircleIcon className="w-7 h-7 text-white" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        {!isCollapsed && (
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white font-poppins">
              {user?.name || 'User'}
            </h3>
            <p className="text-sm text-white/70 font-inter">
              {isAdmin ? 'Administrator' : 'Premium User'}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <ShieldCheckIcon className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-inter">Verified</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SidebarProfile;
