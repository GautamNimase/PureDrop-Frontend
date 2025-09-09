import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// Reusable components
import AnimatedCard from '../common/AnimatedCard';
import StatCard from '../common/StatCard';
import InteractiveButton from '../common/InteractiveButton';
import NotificationCard from '../common/NotificationCard';
import ResponsiveGrid from '../common/ResponsiveGrid';
import PageHeader from '../common/PageHeader';

// Chart components
import UsageChart from '../charts/UsageChart';
import DistributionChart from '../charts/DistributionChart';
import {
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  StarIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  ClockIcon as ClockIconSolid,
  FireIcon,
  BeakerIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';

const UserOverview = () => {
  const { user } = useAuth();
  const { waterConnections, bills, meterReadings, alerts } = useData();
  const [loading, setLoading] = useState(true);
  const [usageFilter, setUsageFilter] = useState('6months');
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  // Filter data for current user
  const userConnections = waterConnections.filter(c => c.customerId === user?.customerId);
  const userBills = bills.filter(b => b.customerId === user?.customerId);
  const userReadings = meterReadings.filter(r => r.customerId === user?.customerId);
  const userAlerts = alerts.filter(a => a.customerId === user?.customerId);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Generate sample usage data based on filter
  const generateUsageData = (filter) => {
    switch (filter) {
      case '7days':
        return [
          { day: 'Mon', usage: 45, cost: 12 },
          { day: 'Tue', usage: 52, cost: 14 },
          { day: 'Wed', usage: 38, cost: 10 },
          { day: 'Thu', usage: 61, cost: 16 },
          { day: 'Fri', usage: 48, cost: 13 },
          { day: 'Sat', usage: 55, cost: 15 },
          { day: 'Sun', usage: 42, cost: 11 }
        ];
      case '30days':
        return [
          { week: 'Week 1', usage: 320, cost: 85 },
          { week: 'Week 2', usage: 285, cost: 76 },
          { week: 'Week 3', usage: 310, cost: 82 },
          { week: 'Week 4', usage: 295, cost: 78 }
        ];
      case '6months':
      default:
        return [
          { month: 'Jan', usage: 1200, cost: 45 },
          { month: 'Feb', usage: 1350, cost: 52 },
          { month: 'Mar', usage: 1100, cost: 42 },
          { month: 'Apr', usage: 1450, cost: 58 },
          { month: 'May', usage: 1600, cost: 68 },
          { month: 'Jun', usage: 1750, cost: 75 }
        ];
    }
  };

  const usageData = generateUsageData(usageFilter);
  const currentUsage = usageData[usageData.length - 1]?.usage || 0;
  const previousUsage = usageData[usageData.length - 2]?.usage || 0;
  const usageChange = previousUsage ? ((currentUsage - previousUsage) / previousUsage * 100) : 0;

  // Get the appropriate data key based on filter
  const getDataKey = () => {
    switch (usageFilter) {
      case '7days': return 'day';
      case '30days': return 'week';
      case '6months': return 'month';
      default: return 'month';
    }
  };

  // Enhanced alerts data
  const enhancedAlerts = [
    { id: 1, type: 'info', title: 'Scheduled Maintenance', message: 'Water system maintenance scheduled for tomorrow 9 AM', time: '2 hours ago', icon: InformationCircleIcon },
    { id: 2, type: 'warning', title: 'High Usage Alert', message: 'Your water usage is 15% above average this month', time: '1 day ago', icon: ExclamationTriangleIcon },
    { id: 3, type: 'success', title: 'Payment Received', message: 'Your payment of $75.50 has been processed successfully', time: '2 days ago', icon: CheckBadgeIcon },
    { id: 4, type: 'info', title: 'New Bill Available', message: 'Your monthly water bill is now available for review', time: '3 days ago', icon: DocumentTextIcon }
  ];

  // Dismiss alert function
  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  // Get filtered alerts (excluding dismissed ones)
  const filteredAlerts = enhancedAlerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Enhanced data for new components
  const enhancedUsageData = [
    { month: 'Jan', usage: 1200, cost: 45, residential: 800, commercial: 300, industrial: 100 },
    { month: 'Feb', usage: 1350, cost: 52, residential: 900, commercial: 350, industrial: 100 },
    { month: 'Mar', usage: 1100, cost: 42, residential: 750, commercial: 250, industrial: 100 },
    { month: 'Apr', usage: 1450, cost: 58, residential: 950, commercial: 400, industrial: 100 },
    { month: 'May', usage: 1600, cost: 68, residential: 1100, commercial: 400, industrial: 100 },
    { month: 'Jun', usage: 1750, cost: 75, residential: 1200, commercial: 450, industrial: 100 }
  ];

  // Water usage distribution data
  const distributionData = [
    { name: 'Residential', value: 65, color: '#3b82f6' },
    { name: 'Commercial', value: 25, color: '#10b981' },
    { name: 'Industrial', value: 10, color: '#f59e0b' }
  ];

  // KPI data
  const kpiData = [
    { title: 'Total Usage', value: '8,450 gal', change: '+12%', icon: BeakerIcon, color: 'bg-blue-500' },
    { title: 'Avg/Day', value: '47 gal', change: '-3%', icon: CalendarIcon, color: 'bg-green-500' },
    { title: 'Peak Day', value: '89 gal', change: '+8%', icon: FireIcon, color: 'bg-orange-500' }
  ];

  // Support actions data
  const supportActions = [
    { name: 'Contact Support', description: 'Get help from our support team', icon: PhoneIcon, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { name: 'Live Chat', description: 'Chat with support instantly', icon: ChatBubbleLeftRightIcon, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { name: 'FAQ', description: 'Find answers to common questions', icon: QuestionMarkCircleIcon, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
    { name: 'Report Issue', description: 'Report a water service issue', icon: ExclamationCircleIcon, color: 'bg-red-500', hoverColor: 'hover:bg-red-600' }
  ];

  const stats = [
    {
      name: 'Active Connections',
      value: userConnections.filter(c => c.status === 'active').length,
      icon: CogIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Your water connections',
      change: 5.2,
      changeType: 'increase'
    },
    {
      name: 'Pending Bills',
      value: userBills.filter(b => b.status === 'pending').length,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      description: 'Unpaid bills',
      change: -12.5,
      changeType: 'decrease'
    },
    {
      name: 'Total Readings',
      value: userReadings.length,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'Meter readings submitted',
      change: 8.3,
      changeType: 'increase'
    },
    {
      name: 'Active Alerts',
      value: userAlerts.filter(a => a.status === 'active').length,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-r from-gray-500 to-gray-600',
      description: 'System notifications',
      change: -25.0,
      changeType: 'decrease'
    }
  ];

  const quickActions = [
    {
      name: 'Submit Meter Reading',
      icon: PlusIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      hoverColor: 'hover:bg-blue-100/80',
      description: 'Add new reading',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      name: 'View My Bills',
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50/80',
      hoverColor: 'hover:bg-green-100/80',
      description: 'Check billing history',
      gradient: 'from-green-400 to-green-600'
    },
    {
      name: 'Update Profile',
      icon: UserIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50/80',
      hoverColor: 'hover:bg-gray-100/80',
      description: 'Edit personal info',
      gradient: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Water Usage',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      hoverColor: 'hover:bg-blue-100/80',
      description: 'View analytics',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      name: 'My Connections',
      icon: HomeIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50/80',
      hoverColor: 'hover:bg-orange-100/80',
      description: 'Manage connections',
      gradient: 'from-orange-400 to-orange-600'
    },
    {
      name: 'Support',
      icon: WrenchScrewdriverIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50/80',
      hoverColor: 'hover:bg-green-100/80',
      description: 'Get help',
      gradient: 'from-green-400 to-green-600'
    }
  ];

  const recentBills = userBills.slice(0, 5);
  const recentReadings = userReadings.slice(0, 5);

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
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ml-1 font-inter ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
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

  const UsageChart = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-6 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Monthly Usage Trend
      </motion.h3>
      <motion.div 
        className="h-64"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
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
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
  return (
                    <motion.div 
                      className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1 font-inter">{label}</p>
                      <p className="text-sm text-gray-600 font-inter">
                        Usage: <span className="font-bold font-poppins">{payload[0].value} gallons</span>
                      </p>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
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
  );

  const RecentActivity = ({ title, items, emptyMessage, icon: Icon }) => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-4 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>
      <AnimatePresence>
        {items.length > 0 ? (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {items.map((item, index) => (
              <motion.div 
                key={item.id || index} 
                className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:border-white/50 hover:bg-white/80 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-center">
                  <motion.div 
                    className="p-2 bg-blue-100/80 backdrop-blur-sm rounded-lg mr-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="h-4 w-4 text-blue-600" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate font-poppins">
                      {title.includes('Bill') ? `Bill #${item.id}` : `Reading #${item.id}`}
                    </p>
                    <p className="text-sm text-gray-500 font-inter">{item.date || 'N/A'}</p>
              </div>
              </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900 font-poppins">
                    {title.includes('Bill') ? `$${item.amount || 'N/A'}` : `${item.reading || 'N/A'} units`}
                  </p>
                  {title.includes('Bill') && (
                    <motion.span 
                      className={`text-xs px-2 py-1 rounded-full font-inter ${
                        item.status === 'paid' ? 'bg-green-100/80 text-green-800' :
                        item.status === 'pending' ? 'bg-orange-100/80 text-orange-800' :
                        'bg-red-100/80 text-red-800'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {item.status || 'Unknown'}
                    </motion.span>
                  )}
            </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                transition: { 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }
              }}
            >
              <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            </motion.div>
            <p className="text-gray-500 font-inter">{emptyMessage}</p>
            <p className="text-sm text-gray-400 mt-1 font-inter">Your data will appear here</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const QuickActionsGrid = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-4 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Quick Actions
      </motion.h3>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {quickActions.map((action, index) => (
          <motion.button 
            key={action.name}
            className="p-4 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:border-white/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300 group text-left relative overflow-hidden"
            variants={buttonVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover="hover"
            whileTap="tap"
          >
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ 
                scale: 1, 
                opacity: 1,
                transition: { duration: 0.3 }
              }}
            />
            
            <div className="flex items-center relative z-10">
              <motion.div 
                className={`p-3 rounded-lg ${action.bgColor} ${action.hoverColor} shadow-lg backdrop-blur-sm`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </motion.div>
              <div className="ml-4 flex-1">
                <motion.p 
                  className="font-semibold text-gray-900 font-poppins"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  {action.name}
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-500 font-inter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  {action.description}
                </motion.p>
      </div>
      </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );

  // KPI Mini-Cards Component
  const KPICards = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-4 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Key Performance Indicators
      </motion.h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:border-white/50 hover:bg-white/80 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-inter">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">{kpi.value}</p>
                <p className={`text-xs font-medium ${
                  kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                } font-inter`}>
                  {kpi.change} from last month
                </p>
                  </div>
              <div className={`p-3 rounded-lg ${kpi.color} shadow-lg`}>
                <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
          </motion.div>
              ))}
            </div>
    </motion.div>
  );

  // Enhanced Water Usage Chart with animated bars
  const EnhancedUsageChart = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 font-poppins"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          My Water Usage
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
          </motion.select>
        </motion.div>
            </div>
      <motion.div 
        className="h-80"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            <XAxis dataKey={getDataKey()} axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const unit = usageFilter === '7days' ? 'L' : 'gal';
                  const period = usageFilter === '7days' ? 'day' : usageFilter === '30days' ? 'week' : 'month';
                  
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
            <Bar dataKey="usage" fill="url(#barGradient)" radius={[4, 4, 0, 0]} animationBegin={0} animationDuration={1500} />
            <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} animationBegin={0} animationDuration={1500} />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );

  // Donut Chart for Water Usage Distribution
  const DistributionChart = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-6 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Water Usage Distribution
      </motion.h3>
      <div className="flex items-center justify-center">
        <div className="w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <motion.div 
                        className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-3"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm font-medium text-gray-900 font-inter">{payload[0].name}</p>
                        <p className="text-sm text-gray-600 font-inter">
                          <span className="font-bold font-poppins">{payload[0].value}%</span> of total usage
                        </p>
                      </motion.div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
                  </div>
                  </div>
      <div className="mt-4 space-y-2">
        {distributionData.map((item, index) => (
          <motion.div 
            key={item.name}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm font-medium text-gray-700 font-inter">{item.name}</span>
                </div>
            <span className="text-sm font-bold text-gray-900 font-poppins">{item.value}%</span>
          </motion.div>
              ))}
            </div>
    </motion.div>
  );

  // Enhanced Recent Bills Table
  const EnhancedBillsTable = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-6 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Recent Bills
      </motion.h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 font-inter">Bill ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 font-inter">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 font-inter">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 font-inter">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 font-inter">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentBills.map((bill, index) => (
              <motion.tr 
                key={bill.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <td className="py-3 px-4 font-medium text-gray-900 font-poppins">#{bill.id}</td>
                <td className="py-3 px-4 text-gray-600 font-inter">{bill.date || 'N/A'}</td>
                <td className="py-3 px-4 font-semibold text-gray-900 font-poppins">${bill.amount || 'N/A'}</td>
                <td className="py-3 px-4">
                  <motion.span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                      bill.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    } font-inter`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {bill.status === 'paid' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                    {bill.status === 'pending' && <ClockIconSolid className="w-3 h-3 mr-1" />}
                    {bill.status || 'Unknown'}
                  </motion.span>
                </td>
                <td className="py-3 px-4">
                  <motion.button 
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm font-inter"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
            </div>
    </motion.div>
  );

  // Timeline-style Alerts & Notifications with dismiss functionality
  const AlertsTimeline = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 font-poppins"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Alerts & Notifications
        </motion.h3>
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-sm text-gray-500 font-inter">
            {filteredAlerts.length} active
          </span>
          {filteredAlerts.length > 0 && (
            <motion.button
              onClick={() => setDismissedAlerts(new Set(enhancedAlerts.map(a => a.id)))}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium font-inter"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dismiss All
            </motion.button>
          )}
        </motion.div>
        </div>
      <AnimatePresence>
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <motion.div 
                key={alert.id}
                className="flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:border-white/50 hover:bg-white/80 transition-all duration-300 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className={`p-2 rounded-lg ${
                    alert.type === 'info' ? 'bg-blue-100/80' :
                    alert.type === 'warning' ? 'bg-orange-100/80' :
                    alert.type === 'success' ? 'bg-green-100/80' :
                    'bg-gray-100/80'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <alert.icon className={`h-4 w-4 ${
                    alert.type === 'info' ? 'text-blue-600' :
                    alert.type === 'warning' ? 'text-orange-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    'text-gray-600'
                  }`} />
                </motion.div>
                  <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 font-poppins">{alert.title}</p>
                  <p className="text-sm text-gray-600 font-inter">{alert.message}</p>
                  <p className="text-xs text-gray-500 font-inter mt-1">{alert.time}</p>
      </div>
                <motion.button
                  onClick={() => dismissAlert(alert.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="h-4 w-4" />
                </motion.button>
              </motion.div>
              ))}
            </div>
          ) : (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                transition: { 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }
              }}
            >
              <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            </motion.div>
            <p className="text-gray-500 font-inter">No active notifications</p>
            <p className="text-sm text-gray-400 mt-1 font-inter">You're all caught up!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Enhanced Support & Help Cards with glow effects
  const SupportCards = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 mb-6 font-poppins"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Support & Help
      </motion.h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {supportActions.map((action, index) => (
          <motion.button 
              key={action.name}
            className="p-4 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl hover:border-white/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300 group text-left relative overflow-hidden"
            variants={buttonVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover="hover"
            whileTap="tap"
          >
            {/* Enhanced glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 opacity-0 rounded-xl"
              whileHover={{ 
                opacity: 1,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            />
            
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(45deg, ${action.color.replace('bg-', '#')}, transparent, ${action.color.replace('bg-', '#')})`,
                opacity: 0,
                padding: '1px'
              }}
              whileHover={{ 
                opacity: 0.3,
                transition: { duration: 0.3 }
              }}
            />
            
            <div className="flex items-center relative z-10">
              <motion.div 
                className={`p-3 rounded-lg ${action.color} shadow-lg backdrop-blur-sm relative`}
                whileHover={{ 
                  scale: 1.15,
                  rotate: 8,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  boxShadow: [
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  ],
                  transition: { duration: 2, repeat: Infinity }
                }}
              >
                {/* Icon glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0"
                  style={{ backgroundColor: action.color.replace('bg-', '#') }}
                  whileHover={{ 
                    opacity: 0.2,
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                />
                <motion.div
                  className="relative z-10"
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                >
                  <action.icon className="h-5 w-5 text-white" />
                </motion.div>
              </motion.div>
                <div className="ml-4 flex-1">
                <motion.p 
                  className="font-semibold text-gray-900 font-poppins"
                  whileHover={{ 
                    color: '#3b82f6',
                    transition: { duration: 0.2 }
                  }}
                >
                  {action.name}
                </motion.p>
                <p className="text-sm text-gray-500 font-inter">{action.description}</p>
                </div>
              </div>
          </motion.button>
          ))}
        </div>
    </motion.div>
  );

  // Profile Card Component
  const ProfileCard = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center space-x-4">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <UserCircleIcon className="h-10 w-10 text-white" />
      </div>
          <motion.div 
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <div className="flex-1">
          <motion.h3 
            className="text-xl font-bold text-gray-900 font-poppins"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {user?.name || 'John Doe'}
          </motion.h3>
          <motion.p 
            className="text-sm text-gray-600 font-inter"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Premium Plan • Customer ID: {user?.customerId || 'WD-001'}
          </motion.p>
          <motion.p 
            className="text-xs text-gray-500 font-inter"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Last login: Today at 9:30 AM
          </motion.p>
        </div>
        <motion.div 
          className="text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-1 text-green-600">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-sm font-semibold font-poppins">Verified</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const AccountStatus = () => (
    <motion.div 
      variants={cardVariants}
      className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-md rounded-xl p-6 border border-green-200/30 shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ 
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
        <div className="flex items-center justify-between">
          <div>
          <motion.h3 
            className="text-xl font-bold text-gray-900 mb-1 font-poppins"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Account Status
          </motion.h3>
          <motion.p 
            className="text-sm text-gray-600 font-inter"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your account is active and in good standing
          </motion.p>
          </div>
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="w-3 h-3 bg-green-500 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-sm font-semibold text-green-600 font-poppins">Active</span>
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
          <p className="text-lg font-medium text-gray-900">Loading Dashboard</p>
          <p className="text-sm text-gray-500">Preparing your water management overview...</p>
      </div>
    </div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        subtitle="Monitor your water usage and manage your services"
        breadcrumbItems={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Overview', href: '/dashboard/overview' }
        ]}
        actions={[
          {
            label: 'Export Data',
            variant: 'secondary',
            icon: DocumentTextIcon,
            onClick: () => console.log('Export data')
          },
          {
            label: 'Refresh',
            variant: 'primary',
            icon: ArrowUpIcon,
            onClick: () => console.log('Refresh data')
          }
        ]}
        delay={0}
      />
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ProfileCard />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-poppins tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome, {user?.name || 'User'}!
        </motion.h2>
        <motion.p 
          className="text-gray-600 text-base sm:text-lg font-inter"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Here's your comprehensive water management overview
        </motion.p>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <KPICards />
      </motion.div>

      {/* Enhanced Charts Row */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <EnhancedUsageChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <DistributionChart />
        </motion.div>
      </motion.div>

      {/* Enhanced Bills Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <EnhancedBillsTable />
      </motion.div>

      {/* Alerts Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <AlertsTimeline />
      </motion.div>

      {/* Support Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <SupportCards />
      </motion.div>

      {/* Account Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <AccountStatus />
      </motion.div>
    </motion.div>
  );
};

export default UserOverview; 