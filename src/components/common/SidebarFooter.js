import React from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const SidebarFooter = ({ 
  isCollapsed = false, 
  onLogout,
  delay = 0 
}) => {
  return (
    <motion.div 
      className="p-4 border-t border-white/10 space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BellIcon className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-inter">Alerts</span>}
        </motion.button>
        <motion.button
          className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CogIcon className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-inter">Settings</span>}
        </motion.button>
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={onLogout}
        className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-white border border-red-500/30 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        {!isCollapsed && <span className="font-semibold font-inter">Logout</span>}
      </motion.button>
    </motion.div>
  );
};

export default SidebarFooter;
