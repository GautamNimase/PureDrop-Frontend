import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

// Memoized pie chart component for better performance
const MemoizedDistributionChart = memo(({ data, colors }) => (
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={100}
      paddingAngle={5}
      dataKey="value"
      animationBegin={0}
      animationDuration={1500}
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
      ))}
    </Pie>
    <Tooltip 
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0];
          return (
            <motion.div 
              className="bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: data.payload.color }}
                ></div>
                <p className="text-sm font-semibold text-gray-900 font-poppins">
                  {data.payload.name}
                </p>
              </div>
              <p className="text-sm text-gray-600 font-inter mt-1">
                {data.payload.value}% of total usage
              </p>
            </motion.div>
          );
        }
        return null;
      }}
    />
    <Legend 
      verticalAlign="bottom" 
      height={36}
      formatter={(value, entry) => (
        <span className="text-sm font-inter text-gray-700">
          {value}
        </span>
      )}
    />
  </PieChart>
));

const DistributionChart = ({ 
  data = [], 
  title = "Usage Distribution",
  subtitle,
  colors = ['#3b82f6', '#10b981', '#f59e0b'],
  delay = 0 
}) => {
  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <div className="mb-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 font-poppins mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.1 }}
        >
          {title}
        </motion.h3>
        {subtitle && (
          <motion.p 
            className="text-sm text-gray-600 font-inter"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      
      <motion.div 
        className="h-80"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.6 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <MemoizedDistributionChart data={memoizedData} colors={colors} />
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default DistributionChart;
