import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from './Breadcrumb';
import InteractiveButton from './InteractiveButton';

const PageHeader = ({ 
  title,
  subtitle,
  breadcrumbItems = [],
  actions = [],
  className = '',
  delay = 0
}) => {
  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 ${className}`}
    >
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && (
        <motion.div variants={itemVariants} className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </motion.div>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 font-poppins mb-2"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-600 font-inter"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-3"
          >
            {actions.map((action, index) => (
              <InteractiveButton
                key={index}
                variant={action.variant || 'primary'}
                size={action.size || 'md'}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                loading={action.loading}
                className={action.className}
              >
                {action.label}
              </InteractiveButton>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
