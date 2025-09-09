import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import useResponsiveBreakpoints from '../../hooks/useResponsiveBreakpoints';
import useOptimizedAnimations from '../../hooks/useOptimizedAnimations';
import { 
  KPICard, 
  FilterButton, 
  ChartContainer, 
  ChartTooltip, 
  SearchInput, 
  QuickPayButton 
} from './billing/ReusableComponents';
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
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  BellIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const UserBills = memo(() => {
  const { user, token } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoints();
  const animations = useOptimizedAnimations(isMobile);
  
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [quickPayBill, setQuickPayBill] = useState(null);

  // Use optimized animation variants
  const containerVariants = animations.container;
  const cardVariants = animations.card;
  const buttonVariants = animations.button;

  // Optimized subtle animation variants for better performance
  const kpiCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: (i) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        delay: i * 0.05,
        ease: "easeOut"
      }
    }),
    hover: { 
      scale: 1.02,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const chartVariants = {
    hidden: { 
      opacity: 0, 
      y: 10
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut"
      }
    }
  };

  // Chart bar/line growing animation variants
  const chartBarVariants = {
    hidden: { 
      scaleY: 0,
      opacity: 0
    },
    visible: (i) => ({
      scaleY: 1,
      opacity: 1,
      transition: { 
        duration: 0.8,
        delay: i * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const chartLineVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { 
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const filterButtonVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: i * 0.05,
        ease: "easeOut"
      }
    }),
    hover: { 
      scale: 1.05,
      transition: { 
        duration: 0.15,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };


  // Memoized filtered bills with search functionality
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Period filter
      let periodMatch = true;
      if (selectedPeriod !== 'all') {
        const billDate = new Date(bill.BillDate);
        const now = new Date();
        const diffTime = Math.abs(now - billDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (selectedPeriod) {
          case 'week':
            periodMatch = diffDays <= 7;
            break;
          case 'month':
            periodMatch = diffDays <= 30;
            break;
          case 'quarter':
            periodMatch = diffDays <= 90;
            break;
          default:
            periodMatch = true;
        }
      }

      // Search filter
      let searchMatch = true;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        searchMatch = 
          bill.BillID?.toString().toLowerCase().includes(searchLower) ||
          bill.MeterReadingID?.toString().toLowerCase().includes(searchLower) ||
          bill.PaymentMethod?.toLowerCase().includes(searchLower) ||
          bill.PaymentStatus?.toLowerCase().includes(searchLower) ||
          bill.Amount?.toString().includes(searchLower);
      }

      return periodMatch && searchMatch;
    });
  }, [bills, selectedPeriod, searchTerm]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const totalAmount = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    const paidAmount = filteredBills
      .filter(bill => bill.PaymentStatus?.toLowerCase() === 'paid')
      .reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;
    
    // Calculate overdue bills (unpaid bills older than 30 days)
    const overdueBills = filteredBills.filter(bill => {
      if (bill.PaymentStatus?.toLowerCase() === 'paid') return false;
      const billDate = new Date(bill.BillDate);
      const now = new Date();
      const diffTime = Math.abs(now - billDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    });
    
    const overdueAmount = overdueBills.reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    
    return {
      totalBills: filteredBills.length,
      totalAmount: totalAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      unpaidAmount: unpaidAmount.toFixed(2),
      overdueBills: overdueBills.length,
      overdueAmount: overdueAmount.toFixed(2)
    };
  }, [filteredBills]);

  // Memoized KPI data
  const kpiData = useMemo(() => [
    {
      icon: DocumentTextIcon,
      title: 'Total Bills',
      value: statistics.totalBills.toString(),
      color: 'blue'
    },
    {
      icon: BanknotesIcon,
      title: 'Total Paid',
      value: `$${statistics.paidAmount}`,
      color: 'green'
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Outstanding',
      value: `$${statistics.unpaidAmount}`,
      color: 'red'
    },
    {
      icon: ExclamationCircleIcon,
      title: 'Overdue',
      value: statistics.overdueBills > 0 ? `${statistics.overdueBills} ($${statistics.overdueAmount})` : '0',
      color: 'orange'
    }
  ], [statistics]);

  // Chart data processing
  const chartData = useMemo(() => {
    if (!filteredBills.length) return { lineData: [], barData: [], donutData: [] };

    // Monthly aggregation for better trends
    const monthlyData = {};
    filteredBills.forEach(bill => {
      const date = new Date(bill.BillDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          monthKey: monthKey,
          totalAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0,
          bills: 0,
          paidBills: 0,
          outstandingBills: 0
        };
      }
      
      const amount = parseFloat(bill.Amount) || 0;
      monthlyData[monthKey].totalAmount += amount;
      monthlyData[monthKey].bills += 1;
      
      if (bill.PaymentStatus?.toLowerCase() === 'paid') {
        monthlyData[monthKey].paidAmount += amount;
        monthlyData[monthKey].paidBills += 1;
      } else {
        monthlyData[monthKey].outstandingAmount += amount;
        monthlyData[monthKey].outstandingBills += 1;
      }
    });

    // Sort by month key for proper chronological order
    const sortedMonthlyData = Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // Line Chart Data - Monthly totals over time
    const lineData = sortedMonthlyData.slice(-12).map(month => ({
      month: month.month,
      totalAmount: month.totalAmount,
      paidAmount: month.paidAmount,
      outstandingAmount: month.outstandingAmount
    }));

    // Bar Chart Data - Compare Paid vs Outstanding each month
    const barData = sortedMonthlyData.slice(-6).map(month => ({
      month: month.month,
      paid: month.paidAmount,
      outstanding: month.outstandingAmount,
      total: month.totalAmount
    }));

    // Donut Chart Data - Overall percentage of Paid vs Outstanding
    const totalPaid = filteredBills
      .filter(bill => bill.PaymentStatus?.toLowerCase() === 'paid')
      .reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    
    const totalOutstanding = filteredBills
      .filter(bill => bill.PaymentStatus?.toLowerCase() !== 'paid')
      .reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);

    const donutData = [
      { 
        name: 'Paid', 
        value: totalPaid, 
        color: '#22c55e',
        percentage: totalPaid + totalOutstanding > 0 ? ((totalPaid / (totalPaid + totalOutstanding)) * 100).toFixed(1) : 0
      },
      { 
        name: 'Outstanding', 
        value: totalOutstanding, 
        color: '#ef4444',
        percentage: totalPaid + totalOutstanding > 0 ? ((totalOutstanding / (totalPaid + totalOutstanding)) * 100).toFixed(1) : 0
      }
    ];

    return { lineData, barData, donutData };
  }, [filteredBills, isMobile, isTablet]);

  // Widget data processing
  const widgetData = useMemo(() => {
    if (!filteredBills.length) return { paymentReminder: null, savingsTracker: null, comparison: null };

    // Payment Reminder Card - Find upcoming bills
    const now = new Date();
    const upcomingBills = filteredBills.filter(bill => {
      if (bill.PaymentStatus?.toLowerCase() === 'paid') return false;
      const billDate = new Date(bill.BillDate);
      const diffTime = billDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7; // Due within 7 days
    });

    const paymentReminder = upcomingBills.length > 0 ? {
      daysUntilDue: Math.ceil((new Date(upcomingBills[0].BillDate) - now) / (1000 * 60 * 60 * 24)),
      amount: parseFloat(upcomingBills[0].Amount) || 0,
      billId: upcomingBills[0]._id.slice(-8),
      isUrgent: upcomingBills[0].PaymentStatus?.toLowerCase() === 'overdue'
    } : null;

    // Savings/Discount Tracker - Calculate savings vs total paid
    const totalPaid = filteredBills
      .filter(bill => bill.PaymentStatus?.toLowerCase() === 'paid')
      .reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    
    const totalBilled = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    const savingsAmount = totalBilled - totalPaid; // Outstanding amount as "potential savings"
    const savingsPercentage = totalBilled > 0 ? ((savingsAmount / totalBilled) * 100).toFixed(1) : 0;

    const savingsTracker = {
      totalPaid,
      totalBilled,
      savingsAmount: Math.abs(savingsAmount),
      savingsPercentage,
      isPositive: savingsAmount < 0 // If we've paid more than billed (discounts/refunds)
    };

    // Comparison Card - This Month vs Last Month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthBills = filteredBills.filter(bill => {
      const billDate = new Date(bill.BillDate);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });

    const lastMonthBills = filteredBills.filter(bill => {
      const billDate = new Date(bill.BillDate);
      return billDate.getMonth() === lastMonth && billDate.getFullYear() === lastMonthYear;
    });

    const thisMonthTotal = thisMonthBills.reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    const lastMonthTotal = lastMonthBills.reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
    const difference = thisMonthTotal - lastMonthTotal;
    const percentageChange = lastMonthTotal > 0 ? ((difference / lastMonthTotal) * 100).toFixed(1) : 0;

    const comparison = {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      difference: Math.abs(difference),
      percentageChange: Math.abs(percentageChange),
      isIncrease: difference > 0,
      thisMonthBills: thisMonthBills.length,
      lastMonthBills: lastMonthBills.length
    };

    return { paymentReminder, savingsTracker, comparison };
  }, [filteredBills]);

  // Quick-pay functionality
  const handleQuickPay = useCallback((bill) => {
    setQuickPayBill(bill);
    setShowQuickPay(true);
  }, []);

  const handleQuickPayConfirm = useCallback(async () => {
    if (!quickPayBill) return;
    
    try {
      // Simulate payment processing
      const updatedBills = bills.map(bill => 
        bill._id === quickPayBill._id 
          ? { ...bill, PaymentStatus: 'Paid', PaymentDate: new Date().toISOString() }
          : bill
      );
      setBills(updatedBills);
      setShowQuickPay(false);
      setQuickPayBill(null);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  }, [quickPayBill, bills]);

  // Export functions
  const exportToCSV = useCallback(() => {
    if (!filteredBills.length) return;
    
    const csvContent = [
      ['Bill ID', 'Date', 'Amount', 'Status', 'Payment Method', 'Payment Date'].join(','),
      ...filteredBills.map(bill => [
        `#${bill._id.slice(-8)}`,
        formatDate(bill.BillDate),
        bill.Amount,
        bill.PaymentStatus || 'Unknown',
        bill.PaymentMethod || 'N/A',
        bill.PaymentDate ? formatDate(bill.PaymentDate) : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bills_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredBills]);

  const exportToPDF = useCallback(() => {
    if (!filteredBills.length) return;
    
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bills Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3b82f6; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total { font-weight: bold; background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>Water Bills Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Bills: ${filteredBills.length}</p>
          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBills.map(bill => `
                <tr>
                  <td>#${bill._id.slice(-8)}</td>
                  <td>${formatDate(bill.BillDate)}</td>
                  <td>$${bill.Amount}</td>
                  <td>${bill.PaymentStatus || 'Unknown'}</td>
                  <td>${bill.PaymentMethod || 'N/A'}</td>
                  <td>${bill.PaymentDate ? formatDate(bill.PaymentDate) : 'N/A'}</td>
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
  }, [filteredBills]);

  // Pagination data
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBills.slice(startIndex, endIndex);
  }, [filteredBills, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    
    setLoading(true);
    fetch(`/api/bills?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        setBills(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load bills');
        setLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

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

  const getAmountTrend = (current, previous) => {
    const currentValue = parseFloat(current) || 0;
    const previousValue = parseFloat(previous) || 0;
    
    if (!previousValue || previousValue === 0) return 'new';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    if (change > 5) return 'increase';
    if (change < -5) return 'decrease';
    return 'stable';
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'unpaid':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <ClockIconSolid className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'unpaid':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'overdue':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAmountTrendIcon = (trend) => {
    switch (trend) {
      case 'increase':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'decrease':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAmountTrendColor = (trend) => {
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

  // Reusable Components

  const KPICard = memo(({ icon: Icon, title, value, color, index }) => (
    <motion.div
      variants={kpiCardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        color === 'blue' ? 'shadow-[0_0_25px_rgba(59,130,246,0.4)]' :
        color === 'green' ? 'shadow-[0_0_25px_rgba(34,197,94,0.4)]' :
        color === 'red' ? 'shadow-[0_0_25px_rgba(239,68,68,0.4)]' :
        'shadow-[0_0_25px_rgba(249,115,22,0.4)]'
      }`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div 
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-md ${
              color === 'blue' ? 'bg-[#3b82f6]' : 
              color === 'green' ? 'bg-[#22c55e]' : 
              color === 'red' ? 'bg-[#ef4444]' :
              'bg-[#f97316]'
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#6b7280] font-inter mb-2 truncate">
              {title}
            </p>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-poppins tracking-tight truncate leading-none">
              {value}
            </p>
          </div>
        </div>
      </div>
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
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      {period.charAt(0).toUpperCase() + period.slice(1)}
    </motion.button>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-100/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        {/* Modern Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BanknotesIcon className="w-6 h-6 text-white" />
            </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-poppins tracking-tight">Billing Dashboard</h1>
                  <p className="text-[#6b7280] font-inter font-medium">View and manage your water bills and payments</p>
            </div>
          </div>
        </div>
          </div>
        </motion.div>

        {/* KPI Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}
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

        {/* Interactive Charts Section */}
        <div className="grid gap-6 mb-8">
          {/* Line Chart - Bill Trends */}
          <ChartContainer 
            title="Bill Trends"
            height={isMobile ? 250 : isTablet ? 280 : 320}
          >
            <motion.div 
              variants={chartVariants}
              initial="hidden"
              animate="visible"
            >
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month"
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
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalAmount" 
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Total Amount"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      animationDuration={800}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="paidAmount" 
                      stroke="#22c55e"
                      strokeWidth={3}
                      name="Paid Amount"
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
                      animationDuration={800}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outstandingAmount" 
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Outstanding Amount"
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
          </ChartContainer>

          {/* Bar Chart - Monthly Comparison */}
          <ChartContainer 
            title="Monthly Comparison"
            height={isMobile ? 250 : isTablet ? 280 : 320}
          >
            <motion.div 
              variants={chartVariants}
              initial="hidden"
              animate="visible"
            >
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month"
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
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="paid" 
                      fill="#22c55e"
                      name="Paid"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                    <Bar 
                      dataKey="outstanding" 
                      fill="#ef4444"
                      name="Outstanding"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
          </ChartContainer>
            </div>

        {/* Donut Chart Section */}
        <ChartContainer 
          title="Payment Status Overview"
          height={isMobile ? 250 : isTablet ? 280 : 320}
        >

              <motion.div 
                className="h-64 sm:h-80"
                variants={chartVariants}
                initial="hidden"
                animate="visible"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {chartData.donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                              <p className="text-sm font-medium text-gray-900 font-inter mb-1">{data.name}</p>
                              <p className="text-sm text-gray-600 font-inter">
                                <span 
                                  className="inline-block w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: data.color }}
                                />
                                Amount: <span className="font-semibold">${data.value.toFixed(2)}</span>
                              </p>
                              <p className="text-sm text-gray-600 font-inter">
                                Percentage: <span className="font-semibold">{data.percentage}%</span>
                              </p>
            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontSize: '12px', fontFamily: 'Inter' }}>
                          {value} ({entry.payload.percentage}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
        </ChartContainer>

        {/* Modern Widgets Section */}
        <div className="grid gap-6 mb-8">
          {/* Payment Reminder Card */}
          {widgetData.paymentReminder && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    widgetData.paymentReminder.isUrgent ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <BellIcon className={`w-5 h-5 ${
                      widgetData.paymentReminder.isUrgent ? 'text-red-500' : 'text-orange-500'
                    }`} />
          </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                    {widgetData.paymentReminder.isUrgent ? 'Overdue Payment' : 'Payment Reminder'}
                  </h3>
        </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6b7280] font-inter mb-1">Bill #{widgetData.paymentReminder.billId}</p>
                      <p className="text-2xl font-bold text-gray-900 font-poppins">
                        ${widgetData.paymentReminder.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm font-medium font-inter ${
                        widgetData.paymentReminder.isUrgent ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {widgetData.paymentReminder.isUrgent 
                          ? 'Payment overdue!' 
                          : `Due in ${widgetData.paymentReminder.daysUntilDue} day${widgetData.paymentReminder.daysUntilDue !== 1 ? 's' : ''}`
                        }
                      </p>
            </div>
                    <div className="text-right">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        widgetData.paymentReminder.isUrgent ? 'bg-red-500' : 'bg-orange-500'
                      }`}>
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
              </div>
            </motion.div>
          )}

          {/* Savings/Discount Tracker */}
          {widgetData.savingsTracker && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BanknotesIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                    {widgetData.savingsTracker.isPositive ? 'Discount Tracker' : 'Savings Tracker'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-[#6b7280] font-inter mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-gray-900 font-poppins">
                      ${widgetData.savingsTracker.totalPaid.toFixed(2)}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 border ${
                    widgetData.savingsTracker.isPositive 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <p className="text-sm text-[#6b7280] font-inter mb-1">
                      {widgetData.savingsTracker.isPositive ? 'Discounts' : 'Outstanding'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 font-poppins">
                      ${widgetData.savingsTracker.savingsAmount.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium font-inter text-green-600">
                      {widgetData.savingsTracker.savingsPercentage}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Comparison Card */}
          {widgetData.comparison && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                    This Month vs Last Month
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-[#6b7280] font-inter mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 font-poppins">
                      ${widgetData.comparison.thisMonth.toFixed(2)}
                    </p>
                    <p className="text-sm text-[#6b7280] font-inter">
                      {widgetData.comparison.thisMonthBills} bills
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-[#6b7280] font-inter mb-1">Last Month</p>
                    <p className="text-2xl font-bold text-gray-900 font-poppins">
                      ${widgetData.comparison.lastMonth.toFixed(2)}
                    </p>
                    <p className="text-sm text-[#6b7280] font-inter">
                      {widgetData.comparison.lastMonthBills} bills
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6b7280] font-inter mb-1">Change</p>
                      <p className={`text-lg font-bold font-poppins ${
                        widgetData.comparison.isIncrease ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {widgetData.comparison.isIncrease ? '+' : '-'}${widgetData.comparison.difference.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium font-inter ${
                        widgetData.comparison.isIncrease ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {widgetData.comparison.isIncrease ? '↗' : '↘'} {widgetData.comparison.percentageChange}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Export Options */}
          {filteredBills.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DocumentArrowDownIcon className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                  Export Bills
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-inter font-medium hover:bg-green-600 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Export CSV
                </motion.button>
                <motion.button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-inter font-medium hover:bg-red-600 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export PDF
                </motion.button>
              </div>

              <p className="text-sm text-[#6b7280] font-inter mt-3">
                Download your bills data in CSV format for spreadsheets or PDF for printing.
              </p>
            </div>
          </motion.div>
          )}
        </div>

        {/* Filters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8 relative overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FunnelIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-poppins tracking-tight">Filter Bills</h3>
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

            {/* Search Input */}
            <SearchInput 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Search bills by ID, amount, status, or payment method..."
            />
        </div>
      </div>
        </motion.div>

        {/* Modern Bill History Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-poppins tracking-tight">Bill History</h3>
        </div>
        </div>
        
            {paginatedBills.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
        </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                <p className="text-gray-500">No bills found for the selected period.</p>
          </div>
        ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-inter">Bill</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-inter">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-inter">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-inter">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-inter">Payment Method</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wider font-inter">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {paginatedBills.map((bill, index) => (
                          <motion.tr
                            key={bill._id}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 font-inter">#{bill._id.slice(-8)}</div>
                                  <div className="text-sm text-[#6b7280] font-inter">
                                    {bill.MeterReadingID
                                      ? (typeof bill.MeterReadingID === 'object'
                                          ? (`Reading #${bill.MeterReadingID.MeterReadingID || ''}` || bill.MeterReadingID._id || 'N/A')
                                          : bill.MeterReadingID)
                                      : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">
                              {formatDate(bill.BillDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-poppins">
                              ${bill.Amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getPaymentStatusIcon(bill.PaymentStatus)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(bill.PaymentStatus)}`}>
                                  {bill.PaymentStatus || 'Unknown'}
                                </span>
                                <QuickPayButton 
                                  bill={bill}
                                  onQuickPay={handleQuickPay}
                                  className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">
                              {bill.PaymentMethod || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">
                              {formatDate(bill.PaymentDate)}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  <AnimatePresence>
                    {paginatedBills.map((bill, index) => (
                      <motion.div
                        key={bill._id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                              <h4 className="font-bold text-gray-900 font-poppins">#{bill._id.slice(-8)}</h4>
                        <p className="text-sm text-[#6b7280] font-inter">
                                {bill.MeterReadingID
                            ? (typeof bill.MeterReadingID === 'object'
                                ? (`Reading #${bill.MeterReadingID.MeterReadingID || ''}` || bill.MeterReadingID._id || 'N/A')
                                : bill.MeterReadingID)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(bill.PaymentStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(bill.PaymentStatus)}`}>
                        {bill.PaymentStatus || 'Unknown'}
                      </span>
                      <QuickPayButton 
                        bill={bill}
                        onQuickPay={handleQuickPay}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1"
                      />
                    </div>
                  </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                            <p className="text-[#6b7280] font-inter">Date</p>
                      <p className="font-semibold text-gray-900 font-inter">{formatDate(bill.BillDate)}</p>
                    </div>
                    <div>
                            <p className="text-[#6b7280] font-inter">Amount</p>
                      <p className="font-bold text-gray-900 font-poppins">${bill.Amount}</p>
                    </div>
                    <div>
                            <p className="text-[#6b7280] font-inter">Method</p>
                      <p className="font-semibold text-gray-900 font-inter">{bill.PaymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                            <p className="text-[#6b7280] font-inter">Paid</p>
                      <p className="font-semibold text-gray-900 font-inter">{formatDate(bill.PaymentDate)}</p>
                    </div>
                  </div>

                  {bill.PaymentStatus?.toLowerCase() === 'overdue' && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Payment Overdue</p>
                          <p className="text-sm text-orange-700 mt-1">
                                  Please make payment as soon as possible to avoid service interruption.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </motion.button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <motion.button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {pageNum}
                              </motion.button>
              );
            })}
          </div>
                        
                        <motion.button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
          </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Pay Modal */}
        <AnimatePresence>
          {showQuickPay && quickPayBill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowQuickPay(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BoltIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-poppins">Quick Pay</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 font-inter mb-2">Bill Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-inter">Bill ID:</span>
                        <span className="text-sm font-medium text-gray-900 font-poppins">#{quickPayBill._id.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-inter">Amount:</span>
                        <span className="text-sm font-bold text-gray-900 font-poppins">${quickPayBill.Amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-inter">Due Date:</span>
                        <span className="text-sm font-medium text-gray-900 font-poppins">{formatDate(quickPayBill.BillDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowQuickPay(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleQuickPayConfirm}
                      className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BoltIcon className="w-4 h-4" />
                      Pay Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default UserBills; 