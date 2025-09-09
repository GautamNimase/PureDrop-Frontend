import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCard from './AnimatedCard';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon, 
  color = 'bg-blue-500',
  description,
  delay = 0 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return '↗';
      case 'decrease': return '↘';
      default: return '';
    }
  };

  return (
    <AnimatedCard delay={delay} className="hover:bg-white/90">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.p 
            className="text-sm font-medium text-gray-600 font-inter mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1 }}
          >
            {title}
          </motion.p>
          <motion.div 
            className="flex items-baseline space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            <span className="text-2xl font-bold text-gray-900 font-poppins">
              {value}
            </span>
            {change && (
              <span className={`text-sm font-medium ${getChangeColor()} font-inter`}>
                {getChangeIcon()} {change}
              </span>
            )}
          </motion.div>
          {description && (
            <motion.p 
              className="text-xs text-gray-500 font-inter mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
            >
              {description}
            </motion.p>
          )}
        </div>
        {Icon && (
          <motion.div 
            className={`${color} p-3 rounded-lg shadow-lg`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default StatCard;
