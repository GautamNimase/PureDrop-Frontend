import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Optimized KPI Card Component
export const KPICard = memo(({ 
  icon: Icon, 
  title, 
  value, 
  color, 
  index,
  variants,
  className = "bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
}) => (
  <motion.div
    variants={variants}
    custom={index}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    whileTap="tap"
    className={className}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'red' ? 'bg-red-100' :
          color === 'orange' ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'blue' ? 'text-blue-500' :
            color === 'green' ? 'text-green-500' :
            color === 'red' ? 'text-red-500' :
            color === 'orange' ? 'text-orange-500' : 'text-gray-500'
          }`} />
        </div>
        <div className={`w-3 h-3 rounded-full ${
          color === 'blue' ? 'bg-blue-500' :
          color === 'green' ? 'bg-green-500' :
          color === 'red' ? 'bg-red-500' :
          color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
        }`}></div>
      </div>
      
      <div>
        <p className="text-sm font-medium text-[#6b7280] font-inter mb-2 truncate">
          {title}
        </p>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-poppins tracking-tight truncate leading-none">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
));

// Optimized Filter Button Component
export const FilterButton = memo(({ 
  period, 
  isActive, 
  onClick, 
  index,
  variants 
}) => {
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'all': return 'All';
      case 'week': return 'Week';
      case 'month': return 'Month';
      case 'quarter': return 'Quarter';
      default: return period;
    }
  };

  return (
    <motion.button
      variants={variants}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onClick(period)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
      }`}
    >
      {getPeriodLabel(period)}
    </motion.button>
  );
});

// Optimized Chart Container Component
export const ChartContainer = memo(({ 
  title, 
  children, 
  height = 300,
  className = "bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300"
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <ChartBarIcon className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins tracking-tight">
          {title}
        </h3>
      </div>
      
      <div style={{ height: `${height}px` }}>
        {children}
      </div>
    </div>
  </motion.div>
));

// Optimized Chart Tooltip Component
export const ChartTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 backdrop-blur-sm"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900 font-poppins">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-600 font-inter">
              {entry.name}:
            </span>
            <span className="text-sm font-bold text-gray-900 font-poppins">
              ${entry.value?.toFixed(2) || '0.00'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

// Optimized Search Input Component
export const SearchInput = memo(({ 
  searchTerm, 
  setSearchTerm, 
  placeholder = "Search bills...",
  className = "w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 font-inter transition-all duration-200"
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    className="relative"
  >
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={className}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
    {searchTerm && (
      <p className="text-sm text-gray-600 font-inter mt-2">
        Found {searchTerm.length > 0 ? 'results' : '0'} matching "{searchTerm}"
      </p>
    )}
  </motion.div>
));

// Optimized Quick Pay Button Component
export const QuickPayButton = memo(({ 
  bill, 
  onQuickPay,
  className = "px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1"
}) => {
  if (bill.PaymentStatus?.toLowerCase() === 'paid') return null;
  
  return (
    <motion.button
      onClick={() => onQuickPay(bill)}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <BoltIcon className="w-3 h-3" />
      Quick Pay
    </motion.button>
  );
});

