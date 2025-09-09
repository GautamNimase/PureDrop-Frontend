import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SidebarItem from './SidebarItem';

const SidebarSection = ({ 
  section, 
  isCollapsed, 
  expandedSection, 
  onToggleSection,
  onHover,
  onLeave,
  onClick,
  isActive,
  delay = 0 
}) => {
  const { category, items } = section;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      {/* Section Header */}
      <motion.button
        onClick={() => onToggleSection(category)}
        className={`
          w-full flex items-center justify-between p-3 rounded-xl
          transition-all duration-300 group
          ${expandedSection === category 
            ? 'bg-white/10 text-white' 
            : 'hover:bg-white/5 text-white/80 hover:text-white'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <SparklesIcon className="w-4 h-4 text-white" />
          </motion.div>
          {!isCollapsed && (
            <span className="font-semibold font-inter">{category}</span>
          )}
        </div>
        {!isCollapsed && (
          <motion.div
            animate={{ rotate: expandedSection === category ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </motion.div>
        )}
      </motion.button>

      {/* Section Items */}
      <AnimatePresence>
        {(!isCollapsed && (expandedSection === category || expandedSection === null)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-1 ml-4"
          >
            {items.map((item, itemIndex) => (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                onHover={onHover}
                onLeave={onLeave}
                onClick={onClick}
                delay={itemIndex * 0.05}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SidebarSection;
