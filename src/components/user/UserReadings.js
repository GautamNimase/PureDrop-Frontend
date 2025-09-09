import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import useResponsiveBreakpoints from '../../hooks/useResponsiveBreakpoints';
import useOptimizedAnimations from '../../hooks/useOptimizedAnimations';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChartPieIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PresentationChartLineIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LightBulbIcon,
  BellIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const UserReadings = memo(() => {
  const { user, token } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoints();
  const animations = useOptimizedAnimations(isMobile);
  
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Use optimized animation variants
  const containerVariants = animations.container;
  const cardVariants = animations.card;
  const buttonVariants = animations.button;

  // Custom animation variants for enhanced effects
  const kpiCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const kpiContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.2 }
    }
  };

  const chartVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 15
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    }
  };

  const filterButtonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.25,
        delay: i * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }),
    hover: { 
      scale: 1.05,
      transition: { duration: 0.15 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const readingItemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  // Performance-optimized hover animations
  const hoverScale = { scale: 1.02 };
  const tapScale = { scale: 0.98 };
  const iconHover = { scale: 1.1, rotate: 5 };

  // Responsive chart dimensions
  const chartDimensions = useMemo(() => ({
    height: isMobile ? 250 : isTablet ? 300 : 320,
    margin: isMobile ? { top: 20, right: 20, bottom: 20, left: 20 } : { top: 30, right: 30, bottom: 30, left: 30 }
  }), [isMobile, isTablet]);



  // Reusable Chart Components
  const ChartTooltip = memo(({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
        <p className="text-sm font-medium text-gray-900 font-inter mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 font-inter">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: <span className="font-semibold">{entry.value} m³</span>
          </p>
        ))}
      </div>
    );
  });

  const ChartContainer = memo(({ children, title, className = "" }) => (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-4 sm:p-6 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <h4 className="text-base sm:text-lg font-semibold text-gray-700 font-inter mb-3 sm:mb-4">{title}</h4>
        {children}
      </div>
    </motion.div>
  ));

  const KPICard = memo(({ icon: Icon, title, value, color, index }) => (
    <motion.div
      variants={kpiCardVariants}
      custom={index}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-4 sm:p-6 relative overflow-hidden group"
      whileHover={hoverScale}
      whileTap={tapScale}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        color === 'blue' ? 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' :
        color === 'green' ? 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
        'shadow-[0_0_20px_rgba(139,92,246,0.3)]'
      }`}></div>
      
      <motion.div 
        className="relative z-10"
        variants={kpiContentVariants}
      >
        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <motion.div 
            className={`w-10 h-10 sm:w-12 sm:h-12 ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : 'bg-purple-500'} rounded-xl flex items-center justify-center shadow-md`}
            whileHover={iconHover}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <motion.p
              className="text-xs sm:text-sm font-medium text-gray-500 font-inter mb-1 truncate"
              variants={kpiContentVariants}
            >
              {title}
            </motion.p>
            <motion.p
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 font-poppins tracking-tight truncate"
              variants={kpiContentVariants}
            >
              {value}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  ));

  const FilterButton = memo(({ period, isActive, onClick, index }) => (
    <motion.button
      onClick={() => onClick(period)}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-inter font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
      variants={filterButtonVariants}
      custom={index}
      whileHover="hover"
      whileTap="tap"
    >
      {period.charAt(0).toUpperCase() + period.slice(1)}
    </motion.button>
  ));

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    
    setLoading(true);
    fetch(`/api/readings?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        setReadings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load readings');
        setLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  // Memoized filtered readings
  const filteredReadings = useMemo(() => {
    return readings.filter(reading => {
      if (selectedPeriod === 'all') return true;
      const readingDate = new Date(reading.ReadingDate);
      const now = new Date();
      const diffTime = Math.abs(now - readingDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedPeriod) {
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'quarter':
          return diffDays <= 90;
        default:
          return true;
      }
    });
  }, [readings, selectedPeriod]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const totalConsumption = filteredReadings.reduce((sum, reading) => sum + (parseFloat(reading.UnitsConsumed) || 0), 0);
    const averageConsumption = filteredReadings.length > 0 ? totalConsumption / filteredReadings.length : 0;
    
    return {
      totalReadings: filteredReadings.length,
      totalConsumption: totalConsumption.toFixed(2),
      averageConsumption: averageConsumption.toFixed(2)
    };
  }, [filteredReadings]);

  // Memoized KPI data with modern icons and typography
  const kpiData = useMemo(() => [
    {
      icon: ChartBarIcon,
      title: 'Total Readings',
      value: statistics.totalReadings.toString(),
      color: 'blue' // #3b82f6 for main KPIs
    },
    {
      icon: BeakerIcon, // Water drop icon for consumption
      title: 'Total Consumption',
      value: `${statistics.totalConsumption} m³`,
      color: 'green' // #22c55e for growth/positive data
    },
    {
      icon: CalendarDaysIcon, // Calendar icon for averages
      title: 'Average per Reading',
      value: `${statistics.averageConsumption} m³`,
      color: 'purple' // #8b5cf6 for averages
    }
  ], [statistics]);

  // Chart data processing
  const chartData = useMemo(() => {
    if (!filteredReadings.length) return { lineData: [], barData: [], pieData: [] };

    // Line Chart Data - Consumption trends over time
    const lineData = filteredReadings
      .sort((a, b) => new Date(a.ReadingDate) - new Date(b.ReadingDate))
      .map((reading, index) => ({
        date: formatDate(reading.ReadingDate),
        consumption: parseFloat(reading.UnitsConsumed) || 0,
        reading: index + 1,
        isPeak: parseFloat(reading.UnitsConsumed) >= Math.max(...filteredReadings.map(r => parseFloat(r.UnitsConsumed) || 0)) * 0.9
      }));

    // Bar Chart Data - Weekly usage comparison
    const weeklyData = {};
    filteredReadings.forEach(reading => {
      const date = new Date(reading.ReadingDate);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: `Week ${Object.keys(weeklyData).length + 1}`,
          consumption: 0,
          readings: 0
        };
      }
      weeklyData[weekKey].consumption += parseFloat(reading.UnitsConsumed) || 0;
      weeklyData[weekKey].readings += 1;
    });

    const barData = Object.values(weeklyData).slice(-8); // Last 8 weeks

    // Pie Chart Data - Usage distribution (simulated sources)
    const pieData = [
      { name: 'Domestic Use', value: Math.round(statistics.totalConsumption * 0.6), color: '#3b82f6' },
      { name: 'Garden/Outdoor', value: Math.round(statistics.totalConsumption * 0.25), color: '#22c55e' },
      { name: 'Kitchen', value: Math.round(statistics.totalConsumption * 0.15), color: '#f97316' }
    ];

    return { lineData, barData, pieData };
  }, [filteredReadings, statistics]);

  // Optimized chart data processing
  const optimizedChartData = useMemo(() => {
    if (!chartData.lineData.length) return chartData;
    
    // Limit data points for better performance on mobile
    const maxPoints = isMobile ? 10 : isTablet ? 15 : 20;
    const limitedLineData = chartData.lineData.slice(-maxPoints);
    const limitedBarData = chartData.barData.slice(-maxPoints);
    
    return {
      ...chartData,
      lineData: limitedLineData,
      barData: limitedBarData
    };
  }, [chartData, isMobile, isTablet]);

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#22c55e',
    accent: '#f97316',
    purple: '#8b5cf6',
    peak: '#ef4444'
  };

  // Widget data processing
  const widgetData = useMemo(() => {
    if (!filteredReadings.length) return { timeline: [], goalProgress: 0, alerts: [], comparison: null };

    // Timeline data - Recent readings
    const timeline = filteredReadings
      .sort((a, b) => new Date(b.ReadingDate) - new Date(a.ReadingDate))
      .slice(0, 5)
      .map((reading, index) => {
        const consumption = parseFloat(reading.UnitsConsumed) || 0;
        const avgConsumption = parseFloat(statistics.averageConsumption);
        
        let status = 'normal';
        let statusColor = 'green';
        let statusIcon = CheckCircleIcon;
        
        if (consumption > avgConsumption * 1.2) {
          status = 'high';
          statusColor = 'red';
          statusIcon = ExclamationCircleIcon;
        } else if (consumption < avgConsumption * 0.8) {
          status = 'low';
          statusColor = 'blue';
          statusIcon = InformationCircleIcon;
        }

        return {
          id: reading._id,
          date: formatDate(reading.ReadingDate),
          value: consumption,
          status,
          statusColor,
          statusIcon,
          isLatest: index === 0
        };
      });

    // Goal progress - Monthly target vs actual
    const monthlyTarget = 50; // Example target in m³
    const currentMonthConsumption = filteredReadings
      .filter(reading => {
        const readingDate = new Date(reading.ReadingDate);
        const now = new Date();
        return readingDate.getMonth() === now.getMonth() && 
               readingDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, reading) => sum + (parseFloat(reading.UnitsConsumed) || 0), 0);
    
    const goalProgress = Math.min((currentMonthConsumption / monthlyTarget) * 100, 100);

    // Alerts and tips
    const alerts = [];
    
    // Weekly consumption comparison
    const thisWeekConsumption = filteredReadings
      .filter(reading => {
        const readingDate = new Date(reading.ReadingDate);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return readingDate >= weekStart;
      })
      .reduce((sum, reading) => sum + (parseFloat(reading.UnitsConsumed) || 0), 0);

    const lastWeekConsumption = filteredReadings
      .filter(reading => {
        const readingDate = new Date(reading.ReadingDate);
        const now = new Date();
        const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay()));
        return readingDate >= lastWeekStart && readingDate < lastWeekEnd;
      })
      .reduce((sum, reading) => sum + (parseFloat(reading.UnitsConsumed) || 0), 0);

    if (lastWeekConsumption > 0) {
      const weeklyChange = ((thisWeekConsumption - lastWeekConsumption) / lastWeekConsumption) * 100;
      
      if (Math.abs(weeklyChange) > 10) {
        alerts.push({
          id: 'weekly-change',
          type: weeklyChange > 0 ? 'warning' : 'success',
          icon: weeklyChange > 0 ? ArrowUpIcon : ArrowDownIcon,
          title: weeklyChange > 0 ? 'Increased Usage' : 'Reduced Usage',
          message: `You consumed ${Math.abs(weeklyChange).toFixed(0)}% ${weeklyChange > 0 ? 'more' : 'less'} this week`,
          color: weeklyChange > 0 ? 'orange' : 'green'
        });
      }
    }

    // Monthly comparison
    const thisMonthConsumption = currentMonthConsumption;
    const lastMonthConsumption = filteredReadings
      .filter(reading => {
        const readingDate = new Date(reading.ReadingDate);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return readingDate.getMonth() === lastMonth.getMonth() && 
               readingDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, reading) => sum + (parseFloat(reading.UnitsConsumed) || 0), 0);

    const comparison = lastMonthConsumption > 0 ? {
      thisMonth: thisMonthConsumption,
      lastMonth: lastMonthConsumption,
      change: ((thisMonthConsumption - lastMonthConsumption) / lastMonthConsumption) * 100,
      isIncrease: thisMonthConsumption > lastMonthConsumption
    } : null;

    return { timeline, goalProgress, alerts, comparison, monthlyTarget };
  }, [filteredReadings, statistics]);

  // Export functionality
  const exportToCSV = useCallback(() => {
    setExporting(true);
    
    const csvData = filteredReadings.map(reading => ({
      'Reading ID': reading._id,
      'Date': formatDate(reading.ReadingDate),
      'Units Consumed (m³)': reading.UnitsConsumed,
      'Connection ID': reading.ConnectionID ? 
        (typeof reading.ConnectionID === 'object' ? 
          (reading.ConnectionID.MeterNumber || reading.ConnectionID._id) : 
          reading.ConnectionID) : 'N/A',
      'Recorded At': formatDateTime(reading.CreatedAt)
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `water-readings-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setExporting(false), 1000);
  }, [filteredReadings, selectedPeriod]);

  const exportToPDF = useCallback(() => {
    setExporting(true);
    
    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Water Readings Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3b82f6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .summary { background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Water Consumption Report</h1>
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Period:</strong> ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</p>
            <p><strong>Total Readings:</strong> ${statistics.totalReadings}</p>
            <p><strong>Total Consumption:</strong> ${statistics.totalConsumption} m³</p>
            <p><strong>Average per Reading:</strong> ${statistics.averageConsumption} m³</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Reading ID</th>
                <th>Date</th>
                <th>Units Consumed (m³)</th>
                <th>Connection ID</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReadings.map(reading => `
                <tr>
                  <td>${reading._id}</td>
                  <td>${formatDate(reading.ReadingDate)}</td>
                  <td>${reading.UnitsConsumed}</td>
                  <td>${reading.ConnectionID ? 
                    (typeof reading.ConnectionID === 'object' ? 
                      (reading.ConnectionID.MeterNumber || reading.ConnectionID._id) : 
                      reading.ConnectionID) : 'N/A'}</td>
                  <td>${formatDateTime(reading.CreatedAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    
    setTimeout(() => {
      printWindow.close();
      setExporting(false);
    }, 1000);
  }, [filteredReadings, selectedPeriod, statistics]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsumptionTrend = (current, previous) => {
    const currentValue = parseFloat(current) || 0;
    const previousValue = parseFloat(previous) || 0;
    
    if (!previousValue || previousValue === 0) return 'new';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    if (change > 5) return 'increase';
    if (change < -5) return 'decrease';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increase':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'decrease':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ChartBarIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increase':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'decrease':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'stable':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const Spinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-red-600">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-green-100/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header with Blue-Green Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-700 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white font-poppins mb-3 tracking-tight">
                Meter Readings
              </h1>
              <p className="text-lg text-white/90 font-inter font-medium">
                Track your water consumption and usage patterns
              </p>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-sm font-inter">Dashboard</span>
              <span className="text-white/60">›</span>
              <span className="text-sm font-inter font-medium">Readings</span>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards Grid with Enhanced Animations */}
        <motion.div
          variants={kpiCardVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          {kpiData.map((kpi, index) => (
            <KPICard
              key={index}
              icon={kpi.icon}
              title={kpi.title}
              value={kpi.value}
              color={kpi.color}
              index={index}
            />
          ))}
        </motion.div>

        {/* Modern Widgets Section */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {/* Mini Timeline Widget */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center gap-3 mb-4"
                variants={cardVariants}
              >
                <motion.div 
                  className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-600 font-inter tracking-tight">Recent Readings</h3>
              </motion.div>
              
              <div className="space-y-3">
                {widgetData.timeline.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${item.statusColor === 'green' ? 'bg-green-500' : item.statusColor === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 font-inter">{item.date}</p>
                      <p className="text-xs text-gray-500 font-inter">{item.value} m³</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.statusIcon className={`w-4 h-4 ${item.statusColor === 'green' ? 'text-green-500' : item.statusColor === 'red' ? 'text-red-500' : 'text-blue-500'}`} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Usage Goal Progress Widget */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center gap-3 mb-4"
                variants={cardVariants}
              >
                <motion.div 
                  className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <PresentationChartLineIcon className="w-5 h-5 text-green-500" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-600 font-inter tracking-tight">Monthly Goal</h3>
              </motion.div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 font-poppins"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    {widgetData.goalProgress.toFixed(0)}%
                  </motion.p>
                  <p className="text-sm text-gray-500 font-inter">of monthly target</p>
        </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div 
                      className={`h-3 rounded-full ${widgetData.goalProgress > 100 ? 'bg-red-500' : widgetData.goalProgress > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(widgetData.goalProgress, 100)}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                  <p className="text-xs text-gray-500 font-inter mt-2 text-center">
                    Target: {widgetData.monthlyTarget} m³
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Tips/Alerts Widget */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center gap-3 mb-4"
                variants={cardVariants}
              >
                <motion.div 
                  className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <BellIcon className="w-5 h-5 text-orange-500" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-600 font-inter tracking-tight">Tips & Alerts</h3>
              </motion.div>
              
              <div className="space-y-3">
                {widgetData.alerts.length > 0 ? (
                  widgetData.alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${alert.color === 'orange' ? 'bg-orange-50 border-orange-500' : 'bg-green-50 border-green-500'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-2">
                        <alert.icon className={`w-4 h-4 mt-0.5 ${alert.color === 'orange' ? 'text-orange-500' : 'text-green-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-inter">{alert.title}</p>
                          <p className="text-xs text-gray-600 font-inter">{alert.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-start gap-2">
                      <LightBulbIcon className="w-4 h-4 mt-0.5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-inter">Great Job!</p>
                        <p className="text-xs text-gray-600 font-inter">Your usage is within normal range</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Comparison Widget */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center gap-3 mb-4"
                variants={cardVariants}
              >
                <motion.div 
                  className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <PresentationChartLineIcon className="w-5 h-5 text-purple-500" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-600 font-inter tracking-tight">Monthly Comparison</h3>
              </motion.div>
              
              {widgetData.comparison ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 font-inter mb-1">This Month</p>
                      <p className="text-lg font-bold text-gray-900 font-poppins">{widgetData.comparison.thisMonth.toFixed(1)} m³</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 font-inter mb-1">Last Month</p>
                      <p className="text-lg font-bold text-gray-900 font-poppins">{widgetData.comparison.lastMonth.toFixed(1)} m³</p>
          </div>
        </div>

                  <div className={`text-center p-3 rounded-lg ${widgetData.comparison.isIncrease ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      {widgetData.comparison.isIncrease ? (
                        <ArrowUpIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-green-500" />
                      )}
                      <p className={`text-sm font-medium font-inter ${widgetData.comparison.isIncrease ? 'text-red-700' : 'text-green-700'}`}>
                        {Math.abs(widgetData.comparison.change).toFixed(0)}% {widgetData.comparison.isIncrease ? 'increase' : 'decrease'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm text-gray-500 font-inter">No comparison data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Filters Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FunnelIcon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 font-inter tracking-tight">Filter Readings</h3>
              </div>
              <motion.div 
                className="flex flex-wrap gap-3"
                variants={filterButtonVariants}
                initial="hidden"
                animate="visible"
              >
                {['all', 'week', 'month', 'quarter'].map((period, index) => (
                  <FilterButton
                    key={period}
                    period={period}
                    isActive={selectedPeriod === period}
                    onClick={setSelectedPeriod}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Modern Charts Section */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Line Chart - Consumption Trends */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center gap-3 mb-6"
                variants={chartVariants}
              >
                <motion.div 
                  className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ChartBarIcon className="w-5 h-5 text-blue-500" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-600 font-inter tracking-tight">Consumption Trends</h3>
              </motion.div>
              
              <motion.div 
                className="h-64 sm:h-80"
                variants={chartVariants}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={optimizedChartData.lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="consumption" 
                      stroke={chartColors.primary}
                      strokeWidth={3}
                      dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>

          {/* Bar Chart - Weekly Usage */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center gap-3 mb-6"
                variants={chartVariants}
              >
                <motion.div 
                  className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ChartBarIcon className="w-5 h-5 text-green-500" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-600 font-inter tracking-tight">Weekly Usage</h3>
              </motion.div>
              
              <motion.div 
                className="h-64 sm:h-80"
                variants={chartVariants}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={optimizedChartData.barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar 
                      dataKey="consumption" 
                      fill={chartColors.secondary}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Donut Chart - Usage Distribution */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-3 mb-6"
              variants={chartVariants}
            >
              <motion.div 
                className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <ChartPieIcon className="w-5 h-5 text-purple-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-600 font-inter tracking-tight">Usage Distribution</h3>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                className="h-80"
                variants={chartVariants}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              
              <div className="flex flex-col justify-center space-y-4">
                {chartData.pieData.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 font-inter">{item.name}</p>
                      <p className="text-xs text-gray-500 font-inter">{item.value} m³</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 font-poppins">
                        {Math.round((item.value / statistics.totalConsumption) * 100)}%
                      </p>
                    </div>
                  </motion.div>
            ))}
          </div>
        </div>
      </div>
        </motion.div>

        {/* Reading History */}
        <motion.div
          variants={cardVariants}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 relative overflow-hidden"
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
        <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 font-inter tracking-tight">Reading History</h3>
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={exportToCSV}
                    disabled={exporting || filteredReadings.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'CSV'}
                  </motion.button>
                  
                  <motion.button
                    onClick={exportToPDF}
                    disabled={exporting || filteredReadings.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'PDF'}
                  </motion.button>
                </div>
              </div>
        </div>
        
        {filteredReadings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-inter text-lg">No readings found for the selected period</p>
                <p className="text-sm text-gray-400 font-inter mt-1">Try selecting a different time period</p>
          </div>
        ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedPeriod}
                  className="divide-y divide-gray-200"
                  variants={readingItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.3 }}
                >
            {filteredReadings.map((reading, index) => {
              const previousReading = index < filteredReadings.length - 1 ? filteredReadings[index + 1] : null;
              const trend = getConsumptionTrend(reading.UnitsConsumed, previousReading?.UnitsConsumed);
              
              return (
                    <motion.div 
                      key={reading._id} 
                      className="p-6 hover:bg-gray-50/50 transition-colors"
                      variants={readingItemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        x: 5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ChartBarIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                            <h4 className="font-bold text-gray-900 font-poppins text-lg tracking-tight">
                              Reading #{reading._id?.slice(-8) || 'N/A'}
                        </h4>
                            <p className="text-sm text-gray-500 font-inter font-medium">
                          Connection: {reading.ConnectionID
                            ? (typeof reading.ConnectionID === 'object'
                                ? (reading.ConnectionID.MeterNumber || reading.ConnectionID._id || 'N/A')
                                : reading.ConnectionID)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrendColor(trend)}`}>
                        {trend === 'increase' ? 'Increased' : 
                         trend === 'decrease' ? 'Decreased' : 
                         trend === 'stable' ? 'Stable' : 'New'}
                      </span>
                    </div>
                  </div>

                      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-blue-500" />
                          </div>
                    <div>
                            <p className="text-xs text-gray-500 font-inter font-medium mb-1">Reading Date</p>
                            <p className="font-bold text-gray-900 font-poppins text-sm">{formatDate(reading.ReadingDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                            <p className="text-xs text-gray-500 font-inter font-medium mb-1">Units Consumed</p>
                            <p className="font-bold text-gray-900 font-poppins text-sm">{reading.UnitsConsumed} m³</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                            <p className="text-xs text-gray-500 font-inter font-medium mb-1">Recorded At</p>
                            <p className="font-bold text-gray-900 font-poppins text-sm">{formatDateTime(reading.CreatedAt)}</p>
                    </div>
                  </div>
                </div>
                    </motion.div>
              );
            })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

UserReadings.displayName = 'UserReadings';

export default UserReadings; 