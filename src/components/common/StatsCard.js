import React, { memo } from 'react';
import { motion } from 'framer-motion';

const StatsCard = memo(({ 
  icon: Icon, 
  title, 
  value, 
  color = 'blue',
  className = '',
  onClick
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      iconColor: 'text-white'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      iconColor: 'text-white'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      iconColor: 'text-white'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      iconColor: 'text-white'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div 
      className={`flex items-center gap-3 p-4 ${colors.bg} rounded-xl ${className} ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <div className={`w-10 h-10 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${colors.iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600 font-inter">{title}</p>
        <p className="text-lg font-bold text-gray-900 font-poppins">{value}</p>
      </div>
    </motion.div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
