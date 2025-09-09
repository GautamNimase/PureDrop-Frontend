import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 6,
  className = '',
  staggerDelay = 0.1 
}) => {
  const getGridCols = () => {
    const colClasses = [];
    if (cols.default) colClasses.push(`grid-cols-${cols.default}`);
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    return colClasses.join(' ');
  };

  const getGapClass = () => {
    return `gap-${gap}`;
  };

  return (
    <motion.div
      className={`grid ${getGridCols()} ${getGapClass()} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ResponsiveGrid;
