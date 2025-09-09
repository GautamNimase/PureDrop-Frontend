import React, { memo } from 'react';
import { motion } from 'framer-motion';

const NotificationBadge = memo(({ 
  count = 0, 
  position = 'top-right',
  size = 'md',
  color = 'red',
  className = ''
}) => {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm'
  };

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      boxShadow: [
        "0 0 0 0 rgba(239, 68, 68, 0.4)",
        "0 0 0 6px rgba(239, 68, 68, 0)",
        "0 0 0 0 rgba(239, 68, 68, 0)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} ${colorClasses[color]} rounded-full border-2 border-white shadow-lg flex items-center justify-center ${className}`}
      variants={pulseVariants}
      animate="pulse"
    >
      <span className="font-bold text-white">{count}</span>
    </motion.div>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

export default NotificationBadge;
