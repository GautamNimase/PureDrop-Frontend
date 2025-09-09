import React, { memo } from 'react';
import { motion } from 'framer-motion';

const ProgressBar = memo(({ 
  percentage = 0, 
  color = 'blue',
  size = 'md',
  showLabel = true,
  label = '',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600'
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${Math.min(100, Math.max(0, percentage))}%`,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 font-inter">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-bold text-gray-900 font-poppins">
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full ${colorClasses[color]} rounded-full`}
          variants={progressVariants}
          initial="initial"
          animate="animate"
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
