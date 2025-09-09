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

// Chart components
import UsageChart from '../charts/UsageChart';
import DistributionChart from '../charts/DistributionChart';

// Icons
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
  BellIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
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

const OptimizedUserOverview = () => {
  const { user } = useAuth();
  const { userConnections, userBills, userReadings } = useData();
  
  // State management
  const [usageFilter, setUsageFilter] = useState('6months');
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Memoized data to prevent unnecessary re-renders
  const stats = useMemo(() => [
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
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      description: 'Bills awaiting payment',
      change: -2.1,
      changeType: 'decrease'
    },
    {
      name: 'Total Usage',
      value: `${userReadings.reduce((sum, r) => sum + r.reading, 0).toLocaleString()} gal`,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      description: 'This month',
      change: 8.5,
      changeType: 'increase'
    },
    {
      name: 'Avg Daily',
      value: `${Math.round(userReadings.reduce((sum, r) => sum + r.reading, 0) / 30)} gal`,
      icon: CalendarIcon,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Daily average',
      change: 3.2,
      changeType: 'increase'
    }
  ], [userConnections, userBills, userReadings]);

  const usageData = useMemo(() => {
    const generateData = (filter) => {
      switch (filter) {
        case '7days':
          return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            day,
            usage: Math.floor(Math.random() * 50) + 100,
            cost: (Math.random() * 5 + 2).toFixed(2),
            filter
          }));
        case '30days':
          return Array.from({ length: 4 }, (_, i) => ({
            week: `Week ${i + 1}`,
            usage: Math.floor(Math.random() * 200) + 300,
            cost: (Math.random() * 20 + 10).toFixed(2),
            filter
          }));
        case '6months':
        default:
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
            month,
            usage: Math.floor(Math.random() * 500) + 800,
            cost: (Math.random() * 50 + 30).toFixed(2),
            filter
          }));
      }
    };

    return [
      ...generateData('7days'),
      ...generateData('30days'),
      ...generateData('6months')
    ];
  }, []);

  const distributionData = useMemo(() => [
    { name: 'Residential', value: 65, color: '#3b82f6' },
    { name: 'Commercial', value: 25, color: '#10b981' },
    { name: 'Industrial', value: 10, color: '#f59e0b' }
  ], []);

  const kpiData = useMemo(() => [
    { title: 'Total Usage', value: '8,450 gal', change: '+12%', icon: BeakerIcon, color: 'bg-blue-500' },
    { title: 'Avg/Day', value: '47 gal', change: '-3%', icon: CalendarIcon, color: 'bg-green-500' },
    { title: 'Peak Day', value: '89 gal', change: '+8%', icon: FireIcon, color: 'bg-orange-500' }
  ], []);

  const enhancedAlerts = useMemo(() => [
    { id: 1, type: 'info', title: 'Scheduled Maintenance', message: 'Water system maintenance scheduled for tomorrow 9 AM', time: '2 hours ago', icon: InformationCircleIcon },
    { id: 2, type: 'warning', title: 'High Usage Alert', message: 'Your water usage is 15% above average this month', time: '1 day ago', icon: ExclamationTriangleIcon },
    { id: 3, type: 'success', title: 'Payment Received', message: 'Your payment of $75.50 has been processed successfully', time: '2 days ago', icon: CheckBadgeIcon },
    { id: 4, type: 'info', title: 'New Bill Available', message: 'Your monthly water bill is now available for review', time: '3 days ago', icon: DocumentTextIcon }
  ], []);

  const supportActions = useMemo(() => [
    { name: 'Contact Support', description: 'Get help from our support team', icon: PhoneIcon, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { name: 'Live Chat', description: 'Chat with support instantly', icon: ChatBubbleLeftRightIcon, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { name: 'FAQ', description: 'Find answers to common questions', icon: QuestionMarkCircleIcon, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
    { name: 'Report Issue', description: 'Report a water service issue', icon: ExclamationCircleIcon, color: 'bg-red-500', hoverColor: 'hover:bg-red-600' }
  ], []);

  // Memoized filtered alerts
  const filteredAlerts = useMemo(() => 
    enhancedAlerts.filter(alert => !dismissedAlerts.has(alert.id)),
    [enhancedAlerts, dismissedAlerts]
  );

  // Callbacks for better performance
  const dismissAlert = useCallback((alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  const dismissAllAlerts = useCallback(() => {
    setDismissedAlerts(new Set(enhancedAlerts.map(alert => alert.id)));
  }, [enhancedAlerts]);

  const handleUsageFilterChange = useCallback((filter) => {
    setUsageFilter(filter);
  }, []);

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

  const filterOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '6months', label: 'Last 6 Months' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-6"
    >
      {/* Profile Card */}
      <AnimatedCard delay={0} className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <UserCircleIcon className="w-8 h-8 text-white" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 font-poppins">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-gray-600 font-inter">
              Premium Plan • Last login: {new Date().toLocaleDateString()}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-inter">Account Verified</span>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Statistics Grid */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} staggerDelay={0.1}>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            change={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
            changeType={stat.changeType}
            icon={stat.icon}
            color={stat.color}
            description={stat.description}
            delay={index * 0.1}
          />
        ))}
      </ResponsiveGrid>

      {/* Charts Row */}
      <ResponsiveGrid cols={{ default: 1, lg: 2 }} staggerDelay={0.2}>
        <UsageChart
          data={usageData}
          filterOptions={filterOptions}
          defaultFilter={usageFilter}
          onFilterChange={handleUsageFilterChange}
          title="My Water Usage"
          delay={0}
        />
        <DistributionChart
          data={distributionData}
          title="Water Usage Distribution"
          subtitle="Breakdown by category"
          delay={0.1}
        />
      </ResponsiveGrid>

      {/* KPI Cards */}
      <ResponsiveGrid cols={{ default: 1, sm: 3 }} staggerDelay={0.1}>
        {kpiData.map((kpi, index) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            color={kpi.color}
            delay={index * 0.1}
          />
        ))}
      </ResponsiveGrid>

      {/* Alerts and Support Row */}
      <ResponsiveGrid cols={{ default: 1, lg: 2 }} staggerDelay={0.2}>
        {/* Alerts */}
        <AnimatedCard delay={0}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-poppins">Alerts & Notifications</h3>
            {filteredAlerts.length > 0 && (
              <InteractiveButton
                variant="ghost"
                size="sm"
                onClick={dismissAllAlerts}
                className="text-gray-500 hover:text-gray-700"
              >
                Dismiss All
              </InteractiveButton>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => (
                <NotificationCard
                  key={alert.id}
                  notification={alert}
                  onDismiss={dismissAlert}
                  delay={index * 0.1}
                />
              ))}
            </AnimatePresence>
            {filteredAlerts.length === 0 && (
              <motion.div
                className="text-center py-8 text-gray-500 font-inter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No new notifications</p>
              </motion.div>
            )}
          </div>
        </AnimatedCard>

        {/* Support Actions */}
        <AnimatedCard delay={0.1}>
          <h3 className="text-xl font-bold text-gray-900 font-poppins mb-6">Support & Help</h3>
          <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap={4}>
            {supportActions.map((action, index) => (
              <motion.div
                key={action.name}
                className={`
                  group relative overflow-hidden rounded-lg p-4 cursor-pointer
                  ${action.color} hover:shadow-lg transition-all duration-300
                `}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h4 className="font-semibold text-white font-poppins">{action.name}</h4>
                  </div>
                  <p className="text-white/90 text-sm font-inter">{action.description}</p>
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </ResponsiveGrid>
        </AnimatedCard>
      </ResponsiveGrid>
    </motion.div>
  );
};

export default OptimizedUserOverview;
