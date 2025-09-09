import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const WaterUsageChart = () => {
  const { user } = useAuth();
  const { meterReadings, bills } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedChart, setSelectedChart] = useState('area');
  const [loading, setLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Filter data for current user
  const userReadings = meterReadings.filter(r => r.customerId === user?.customerId);
  const userBills = bills.filter(b => b.customerId === user?.customerId);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Generate sample data for demonstration
  const generateUsageData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.slice(0, selectedPeriod === '6months' ? 6 : 12).map((month, index) => ({
      month,
      usage: Math.floor(Math.random() * 200) + 100,
      cost: Math.floor(Math.random() * 50) + 25,
      efficiency: Math.floor(Math.random() * 20) + 80,
      previousUsage: Math.floor(Math.random() * 200) + 100,
      target: 150
    }));
  };

  const usageData = generateUsageData();
  const currentUsage = usageData[usageData.length - 1]?.usage || 0;
  const previousUsage = usageData[usageData.length - 2]?.usage || 0;
  const usageChange = previousUsage ? ((currentUsage - previousUsage) / previousUsage * 100) : 0;

  const efficiencyData = [
    { name: 'Excellent', value: 85, color: '#10b981' },
    { name: 'Good', value: 10, color: '#3b82f6' },
    { name: 'Average', value: 3, color: '#f59e0b' },
    { name: 'Poor', value: 2, color: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Usage:</span>
              <span className="text-sm font-bold text-gray-900 ml-2">
                {payload[0].value} gallons
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Cost:</span>
              <span className="text-sm font-bold text-gray-900 ml-2">
                ${payload[1]?.value || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color, description }) => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.p 
            className="text-sm font-medium text-gray-600 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.p>
          <motion.p 
            className="text-3xl font-bold text-gray-900 mt-1 font-poppins tracking-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {value}
          </motion.p>
          <motion.p 
            className="text-xs text-gray-500 mt-1 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {description}
          </motion.p>
          <motion.div 
            className="flex items-center mt-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {changeType === 'increase' ? (
              <ArrowUpIcon className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ml-1 font-inter ${
              changeType === 'increase' ? 'text-red-600' : 'text-green-600'
            }`}>
              {Math.abs(change).toFixed(1)}% from last month
            </span>
          </motion.div>
        </div>
        <motion.div 
          className={`p-3 rounded-lg ${color} shadow-lg`}
          animate={{ 
            rotate: [0, 5, -5, 0],
            transition: { 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }
          }}
          whileHover={{ 
            scale: 1.1,
            rotate: 0,
            transition: { duration: 0.2 }
          }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute"></div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Loading Usage Data</p>
          <p className="text-sm text-gray-500">Analyzing your water consumption patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 font-poppins tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Water Usage Analytics
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg font-inter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Track and analyze your water consumption patterns
          </motion.p>
        </div>
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </motion.select>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          {
            title: "Current Usage",
            value: `${currentUsage} gal`,
            change: usageChange,
            changeType: usageChange > 0 ? 'increase' : 'decrease',
            icon: ChartBarIcon,
            color: "bg-gradient-to-r from-blue-500 to-blue-600",
            description: "This month"
          },
          {
            title: "Average Usage",
            value: `${Math.round(usageData.reduce((sum, item) => sum + item.usage, 0) / usageData.length)} gal`,
            change: 5.2,
            changeType: "decrease",
            icon: CalendarIcon,
            color: "bg-gradient-to-r from-green-500 to-green-600",
            description: "Per month"
          },
          {
            title: "Total Cost",
            value: `$${Math.round(usageData.reduce((sum, item) => sum + item.cost, 0))}`,
            change: -2.1,
            changeType: "decrease",
            icon: ClockIcon,
            color: "bg-gradient-to-r from-orange-500 to-orange-600",
            description: "This period"
          },
          {
            title: "Efficiency Score",
            value: "92%",
            change: 3.5,
            changeType: "increase",
            icon: CheckCircleIcon,
            color: "bg-gradient-to-r from-gray-500 to-gray-600",
            description: "Overall rating"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Simple Usage Chart */}
      <motion.div 
        className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
        variants={cardVariants}
        whileHover={{ 
          y: -5,
          transition: { duration: 0.2 }
        }}
      >
        <motion.h3 
          className="text-xl font-bold text-gray-900 mb-6 font-poppins"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Water Usage Trend
        </motion.h3>
        <motion.div 
          className="h-80"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#usageGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                animationBegin={0}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WaterUsageChart;