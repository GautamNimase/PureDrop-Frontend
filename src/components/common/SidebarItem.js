import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SidebarItem = ({ 
  item, 
  isActive, 
  isCollapsed, 
  onHover, 
  onLeave,
  onClick,
  delay = 0 
}) => {
  const { name, href, icon: Icon, color, description } = item;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link
        to={href}
        onClick={onClick}
        onMouseEnter={() => onHover(name)}
        onMouseLeave={onLeave}
        className={`
          group relative flex items-center space-x-3 p-3 rounded-xl
          transition-all duration-300 overflow-hidden
          ${isActive
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-white/20'
            : 'hover:bg-white/10 text-white/80 hover:text-white'
          }
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icon with gradient */}
        <motion.div 
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center shadow-lg
            bg-gradient-to-br ${color}
            transition-all duration-300
          `}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>

        {/* Content */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-semibold font-inter truncate">
              {name}
            </div>
            <div className="text-xs text-white/60 font-inter truncate">
              {description}
            </div>
          </div>
        )}

        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-300">{description}</div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default SidebarItem;
