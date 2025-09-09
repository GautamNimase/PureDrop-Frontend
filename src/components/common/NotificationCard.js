import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NotificationCard = ({ 
  notification, 
  onDismiss, 
  showDismiss = true,
  delay = 0 
}) => {
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          message: 'text-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-900',
          message: 'text-orange-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = notification.icon;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{ duration: 0.3, delay }}
        className={`
          relative group p-4 rounded-lg border transition-all duration-300
          hover:shadow-md ${styles.bg}
        `}
      >
        <div className="flex items-start space-x-3">
          {Icon && (
            <motion.div
              className={`p-2 rounded-full bg-white shadow-sm ${styles.icon}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.1 }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
          
          <div className="flex-1 min-w-0">
            <motion.h4 
              className={`text-sm font-semibold font-poppins ${styles.title}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.2 }}
            >
              {notification.title}
            </motion.h4>
            <motion.p 
              className={`text-sm font-inter mt-1 ${styles.message}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.3 }}
            >
              {notification.message}
            </motion.p>
            {notification.time && (
              <motion.p 
                className="text-xs text-gray-500 font-inter mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4 }}
              >
                {notification.time}
              </motion.p>
            )}
          </div>
          
          {showDismiss && onDismiss && (
            <motion.button
              onClick={() => onDismiss(notification.id)}
              className={`
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                p-1 rounded-full hover:bg-white/50 ${styles.icon}
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCard;
