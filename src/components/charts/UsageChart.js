import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import InteractiveButton from '../common/InteractiveButton';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Memoized chart component for better performance
const MemoizedUsageChart = memo(({ data, dataKey, unit, period }) => (
  <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
    <defs>
      <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
      </linearGradient>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey={dataKey} axisLine={false} tickLine={false} />
    <YAxis axisLine={false} tickLine={false} />
    <Tooltip 
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <motion.div 
              className="bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-4 min-w-[200px]"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <p className="text-sm font-semibold text-gray-900 font-poppins">{label}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 font-inter">
                  Usage: <span className="font-bold font-poppins text-blue-600">{data.usage} {unit}</span>
                </p>
                <p className="text-sm text-gray-600 font-inter">
                  Cost: <span className="font-bold font-poppins text-green-600">${data.cost}</span>
                </p>
                <p className="text-xs text-gray-500 font-inter">
                  Per {period}
                </p>
              </div>
            </motion.div>
          );
        }
        return null;
      }}
    />
    <Bar 
      dataKey="usage" 
      fill="url(#barGradient)" 
      radius={[4, 4, 0, 0]} 
      animationBegin={0} 
      animationDuration={1500} 
    />
    <Line 
      type="monotone" 
      dataKey="usage" 
      stroke="#3b82f6" 
      strokeWidth={3} 
      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} 
      animationBegin={0} 
      animationDuration={1500} 
    />
  </ComposedChart>
));

const UsageChart = ({ 
  data = [], 
  filterOptions = [],
  defaultFilter = '6months',
  onFilterChange,
  title = "Water Usage",
  delay = 0 
}) => {
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);

  // Memoize filtered data to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    return data.filter(item => item.filter === selectedFilter) || [];
  }, [data, selectedFilter]);

  const getDataKey = () => {
    switch (selectedFilter) {
      case '7days': return 'day';
      case '30days': return 'week';
      case '6months': return 'month';
      default: return 'month';
    }
  };

  const getUnit = () => {
    return selectedFilter === '7days' ? 'L' : 'gal';
  };

  const getPeriod = () => {
    return selectedFilter === '7days' ? 'day' : selectedFilter === '30days' ? 'week' : 'month';
  };

  const handleFilterChange = (newFilter) => {
    setSelectedFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 font-poppins"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1 }}
        >
          {title}
        </motion.h3>
        
        {filterOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            <motion.select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </motion.select>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        className="h-80"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.6 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <MemoizedUsageChart 
            data={filteredData} 
            dataKey={getDataKey()}
            unit={getUnit()}
            period={getPeriod()}
          />
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default UsageChart;
