import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ 
  items = [], 
  className = '',
  showHome = true 
}) => {
  const breadcrumbVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.nav
      variants={breadcrumbVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-center space-x-2 text-sm font-inter ${className}`}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <motion.div variants={itemVariants}>
          <a
            href="/"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <HomeIcon className="w-4 h-4 mr-1" />
            Home
          </a>
        </motion.div>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <motion.div variants={itemVariants}>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </motion.div>
          <motion.div variants={itemVariants}>
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <a
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {item.label}
              </a>
            )}
          </motion.div>
        </React.Fragment>
      ))}
    </motion.nav>
  );
};

export default Breadcrumb;
