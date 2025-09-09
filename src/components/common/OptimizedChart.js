import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Memoized chart components for better performance
const MemoizedAreaChart = memo(({ data, ...props }) => (
  <AreaChart data={data} {...props}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="name" axisLine={false} tickLine={false} />
    <YAxis axisLine={false} tickLine={false} />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    />
    <Area 
      type="monotone" 
      dataKey="value" 
      stroke="#3b82f6" 
      fill="url(#colorGradient)" 
      strokeWidth={2}
      animationBegin={0}
      animationDuration={1500}
    />
    <defs>
      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
  </AreaChart>
));

const MemoizedBarChart = memo(({ data, ...props }) => (
  <BarChart data={data} {...props}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="name" axisLine={false} tickLine={false} />
    <YAxis axisLine={false} tickLine={false} />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    />
    <Bar 
      dataKey="value" 
      fill="url(#barGradient)"
      radius={[4, 4, 0, 0]}
      animationBegin={0}
      animationDuration={1500}
    />
    <defs>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
      </linearGradient>
    </defs>
  </BarChart>
));

const MemoizedPieChart = memo(({ data, colors = ['#3b82f6', '#10b981', '#f59e0b'] }) => (
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
      contentStyle={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    />
    <Legend />
  </PieChart>
));

const OptimizedChart = ({ 
  type = 'area', 
  data = [], 
  height = 300,
  className = '',
  title,
  subtitle,
  delay = 0 
}) => {
  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <MemoizedBarChart data={memoizedData} />;
      case 'pie':
        return <MemoizedPieChart data={memoizedData} />;
      case 'area':
      default:
        return <MemoizedAreaChart data={memoizedData} />;
    }
  };

  return (
    <motion.div 
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <motion.h3 
              className="text-xl font-bold text-gray-900 font-poppins mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.1 }}
            >
              {title}
            </motion.h3>
          )}
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
      )}
      
      <motion.div 
        className="h-80"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.6 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default OptimizedChart;
