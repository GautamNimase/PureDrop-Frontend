import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import AdminLayout from './AdminLayout';


const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalConnections: 0,
    totalBills: 0,
    totalRevenue: 0,
    activeConnections: 0,
    pendingBills: 0,
    monthlyRevenue: [],
    connectionStatus: [],
    recentActivities: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data
      const [usersRes, connectionsRes, billsRes, readingsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/connections'),
        fetch('/api/bills'),
        fetch('/api/readings')
      ]);

      const [users, connections, bills, readings] = await Promise.all([
        usersRes.json(),
        connectionsRes.json(),
        billsRes.json(),
        readingsRes.json()
      ]);

      // Calculate metrics
      const totalUsers = Array.isArray(users) ? users.length : 0;
      const totalConnections = Array.isArray(connections) ? connections.length : 0;
      const totalBills = Array.isArray(bills) ? bills.length : 0;
      const activeConnections = Array.isArray(connections) ? 
        connections.filter(conn => conn.Status === 'Active').length : 0;
      const pendingBills = Array.isArray(bills) ? 
        bills.filter(bill => bill.PaymentStatus === 'Pending').length : 0;
      
      const totalRevenue = Array.isArray(bills) ? 
        bills.reduce((sum, bill) => sum + (bill.Amount || 0), 0) : 0;

      // Generate sample monthly revenue data
      const monthlyRevenue = generateMonthlyRevenueData(bills);
      
      // Generate connection status data
      const connectionStatus = generateConnectionStatusData(connections);
      
      // Generate recent activities
      const recentActivities = generateRecentActivities(users, connections, bills);

      setDashboardData({
        totalUsers,
        totalConnections,
        totalBills,
        totalRevenue,
        activeConnections,
        pendingBills,
        monthlyRevenue,
        connectionStatus,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenueData = (bills) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      bills: Math.floor(Math.random() * 100) + 20
    }));
  };

  const generateConnectionStatusData = (connections) => {
    const statusCounts = {};
    if (Array.isArray(connections)) {
      connections.forEach(conn => {
        statusCounts[conn.Status] = (statusCounts[conn.Status] || 0) + 1;
      });
    }
    return [
      { status: 'Active', count: statusCounts.Active || 0, color: 'bg-green-500' },
      { status: 'Inactive', count: statusCounts.Inactive || 0, color: 'bg-red-500' },
      { status: 'Pending', count: statusCounts.Pending || 0, color: 'bg-yellow-500' },
      { status: 'Suspended', count: statusCounts.Suspended || 0, color: 'bg-orange-500' }
    ];
  };

  const generateRecentActivities = (users, connections, bills) => {
    const activities = [];
    const now = new Date();
    
    // Sample recent activities
    activities.push({
      id: 1,
      type: 'user',
      message: 'New user registered',
      time: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: UserGroupIcon,
      color: 'text-green-500'
    });
    
    activities.push({
      id: 2,
      type: 'connection',
      message: 'New water connection added',
      time: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: CogIcon,
      color: 'text-blue-500'
    });
    
    activities.push({
      id: 3,
      type: 'bill',
      message: 'Bill payment received',
      time: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: DocumentTextIcon,
      color: 'text-green-500'
    });

    return activities.sort((a, b) => b.time - a.time);
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          <div className="flex items-center mt-2">
            {changeType === 'increase' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ml-1 ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}% from last month
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const RevenueChart = () => {
    const revenueData = [
      { month: 'Dec 2027', revenue: 285000, lastMonth: 270000 },
      { month: 'Jan 2028', revenue: 295000, lastMonth: 285000 },
      { month: 'Feb 2028', revenue: 315000, lastMonth: 295000 },
      { month: 'Mar 2028', revenue: 305000, lastMonth: 315000 },
      { month: 'Apr 2028', revenue: 320000, lastMonth: 305000 },
      { month: 'May 2028', revenue: 335000, lastMonth: 320000 },
      { month: 'Jun 2028', revenue: 325000, lastMonth: 335000 }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Revenue This Month:</span>
                <span className="text-sm font-bold text-gray-900 ml-2">
                  ${payload[0].value.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Revenue Last Month:</span>
                <span className="text-sm font-bold text-gray-900 ml-2">
                  ${payload[1].value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Revenue</h3>
          <select className="text-sm border-green-300 rounded-md bg-green-100 text-green-700 px-3 py-1 hover:bg-green-200 transition-colors animate-fadeInUp animation-delay-100">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        
        <div className="h-80 w-full animate-fadeInUp animation-delay-200">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="lastMonthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeWidth={1} />
              
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickMargin={10}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickMargin={10}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={4}
                fill="url(#revenueGradient)"
                name="Revenue This Month"
                dot={{ fill: '#059669', strokeWidth: 3, r: 5 }}
                activeDot={{ r: 8, stroke: '#059669', strokeWidth: 3, fill: '#fff', filter: 'url(#glow)' }}
                animationBegin={0}
                animationDuration={2000}
              />
              
              <Area
                type="monotone"
                dataKey="lastMonth"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#lastMonthGradient)"
                name="Revenue Last Month"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                animationBegin={800}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Summary Stats */}
        <div className="mt-6 pt-4 border-t border-green-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-all duration-500 hover:scale-105 hover:shadow-lg animate-scaleIn animation-delay-300 border border-emerald-200">
              <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-800 animate-pulse-slow">$2.18M</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-500 hover:scale-105 hover:shadow-lg animate-scaleIn animation-delay-400 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Avg Monthly</p>
              <p className="text-2xl font-bold text-blue-800 animate-pulse-slow">$311K</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg hover:from-violet-100 hover:to-violet-200 transition-all duration-500 hover:scale-105 hover:shadow-lg animate-scaleIn animation-delay-500 border border-violet-200">
              <p className="text-sm text-violet-600 font-medium">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600 animate-pulse-slow">+14.0%</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OverallRating = () => {
    const ratingData = [
      { 
        name: 'Water Quality', 
        value: 4.4, 
        color: '#10b981', 
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        emoji: '💧'
      },
      { 
        name: 'Service Speed', 
        value: 4.7, 
        color: '#f59e0b', 
        gradient: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        emoji: '⚡'
      },
      { 
        name: 'Customer Support', 
        value: 4.6, 
        color: '#3b82f6', 
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        emoji: '🎧'
      },
      { 
        name: 'System Reliability', 
        value: 4.8, 
        color: '#8b5cf6', 
        gradient: 'from-violet-400 to-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        emoji: '🔧'
      },
      { 
        name: 'Billing Accuracy', 
        value: 4.5, 
        color: '#06b6d4', 
        gradient: 'from-cyan-400 to-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        emoji: '📊'
      }
    ];

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: data.color }}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {data.name} – {data.value}
              </span>
            </div>
          </div>
        );
      }
      return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <div className="bg-gradient-to-br from-white to-teal-50 rounded-xl shadow-lg border border-teal-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 animate-fadeInUp">Overall Rating</h3>
        
        {/* Enhanced Donut Chart */}
        <div className="flex items-center justify-center mb-6 animate-scaleIn animation-delay-200">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={2500}
                  startAngle={90}
                  endAngle={450}
                >
                  {ratingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Enhanced Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadeIn animation-delay-1000">
              <span className="text-5xl font-bold text-teal-700 animate-pulse-slow">4.6</span>
              <span className="text-lg text-teal-600 font-medium">/ 5</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Rating text */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-teal-600 mb-1 animate-fadeInUp animation-delay-300">Excellent</p>
          <p className="text-sm text-gray-500 animate-fadeInUp animation-delay-400">from 2,546 reviews</p>
        </div>
        
        {/* Enhanced Rating breakdown */}
        <div className="space-y-3">
          {ratingData.map((rating, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between animate-fadeInUp p-3 rounded-lg border transition-all duration-500 hover:scale-105 hover:shadow-md ${rating.bgColor} ${rating.borderColor}`}
              style={{ animationDelay: `${500 + index * 150}ms` }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3 animate-bounce" style={{ animationDelay: `${700 + index * 100}ms` }}>
                  {rating.emoji}
                </span>
                <div 
                  className="w-4 h-4 rounded-full mr-3 animate-pulse-slow shadow-sm" 
                  style={{ backgroundColor: rating.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{rating.name}</span>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${rating.gradient} transition-all duration-2000`}
                    style={{ 
                      width: `${(rating.value / 5) * 100}%`,
                      animationDelay: `${900 + index * 200}ms`
                    }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{rating.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Connection Status Distribution (Enhanced Donut Chart with Unique Animations)
  const ConnectionStatusChart = () => {
    const statusData = [
      { status: 'Active', count: 45, color: '#10b981', gradient: 'from-emerald-400 to-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
      { status: 'Inactive', count: 12, color: '#f59e0b', gradient: 'from-amber-400 to-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
      { status: 'Pending', count: 8, color: '#3b82f6', gradient: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
      { status: 'Suspended', count: 3, color: '#ef4444', gradient: 'from-red-400 to-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    ];

    const total = statusData.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 animate-scaleIn">
            <div className="flex items-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-3 animate-pulse-slow" 
                style={{ backgroundColor: data.payload.color }}
              ></div>
              <span className="text-sm font-semibold text-gray-900">{data.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              {data.value} connections ({((data.value / total) * 100).toFixed(1)}%)
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-lg border border-emerald-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Connection Status</h3>
          <div className="text-sm text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full animate-fadeInUp animation-delay-100">
            Live Status
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-48 animate-scaleIn animation-delay-200">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  animationBegin={0}
                  animationDuration={2000}
                  startAngle={90}
                  endAngle={450}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadeIn animation-delay-1000">
              <span className="text-4xl font-bold text-emerald-700 animate-pulse-slow">{total}</span>
              <span className="text-sm text-emerald-600 font-medium">Total</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statusData.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center p-3 rounded-lg border transition-all duration-500 hover:scale-105 hover:shadow-md ${item.bgColor} ${item.borderColor} animate-fadeInUp`}
              style={{ animationDelay: `${1200 + index * 200}ms` }}
            >
              <div 
                className="w-4 h-4 rounded-full mr-3 animate-pulse-slow shadow-sm" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{item.status}</span>
              <span className="text-sm font-bold text-gray-900 ml-auto">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Connection Availability Chart (Enhanced Horizontal Bar Chart with Unique Animations)
  const ConnectionAvailabilityChart = () => {
    const availabilityData = [
      { 
        category: 'Active', 
        count: 286, 
        color: '#059669', 
        gradient: 'from-emerald-500 to-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: '🟢'
      },
      { 
        category: 'Reserved', 
        count: 87, 
        color: '#2563eb', 
        gradient: 'from-blue-500 to-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '🔵'
      },
      { 
        category: 'Available', 
        count: 32, 
        color: '#7c3aed', 
        gradient: 'from-violet-500 to-violet-700',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        icon: '🟣'
      },
      { 
        category: 'Maintenance', 
        count: 13, 
        color: '#dc2626', 
        gradient: 'from-red-500 to-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🔴'
      }
    ];

    const maxCount = Math.max(...availabilityData.map(item => item.count));

    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Connection Availability</h3>
          <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full animate-fadeInUp animation-delay-100">
            Real-time Status
          </div>
        </div>

        <div className="space-y-6">
          {availabilityData.map((item, index) => (
            <div 
              key={index} 
              className="group animate-fadeInUp"
              style={{ animationDelay: `${200 + index * 300}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl animate-bounce" style={{ animationDelay: `${500 + index * 200}ms` }}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  <div className={`w-3 h-3 rounded-full animate-pulse-slow`} style={{ backgroundColor: item.color }}></div>
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
                <div 
                  className={`h-8 rounded-full transition-all duration-2000 ease-out group-hover:shadow-lg bg-gradient-to-r ${item.gradient} relative`}
                  style={{ 
                    width: `${(item.count / maxCount) * 100}%`,
                    animationDelay: `${800 + index * 400}ms`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {((item.count / maxCount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total Capacity</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-700 animate-pulse-slow">
                {availabilityData.reduce((sum, item) => sum + item.count, 0)}
              </span>
              <span className="text-sm text-blue-600">connections</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Water Usage Distribution (Enhanced Semicircle Gauge Chart with Unique Animations)
  const WaterUsageGaugeChart = () => {
    const usageData = [
      { 
        type: 'Residential', 
        percentage: 65, 
        color: '#10b981', 
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: '🏠'
      },
      { 
        type: 'Commercial', 
        percentage: 25, 
        color: '#3b82f6', 
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '🏢'
      },
      { 
        type: 'Industrial', 
        percentage: 10, 
        color: '#8b5cf6', 
        gradient: 'from-violet-400 to-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        icon: '🏭'
      }
    ];

    const totalPercentage = usageData.reduce((sum, item) => sum + item.percentage, 0);

    return (
      <div className="bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-lg border border-cyan-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Water Usage Distribution</h3>
          <div className="text-sm text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full animate-fadeInUp animation-delay-100">
            Current Usage
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-24 animate-scaleIn animation-delay-200">
            <svg className="w-48 h-24" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background semicircle */}
              <path
                d="M 20 80 A 60 60 0 0 1 180 80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeLinecap="round"
                className="animate-fadeIn animation-delay-300"
              />
              
              {/* Progress semicircle */}
              <path
                d="M 20 80 A 60 60 0 0 1 180 80"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(totalPercentage / 100) * 251.2} 251.2`}
                strokeDashoffset="0"
                filter="url(#glow)"
                className="transition-all duration-3000 ease-out animate-pulse-slow"
                style={{
                  strokeDasharray: `${(totalPercentage / 100) * 251.2} 251.2`,
                  strokeDashoffset: '0',
                  animationDelay: '500ms'
                }}
              />
              
              {/* Center dot */}
              <circle cx="100" cy="80" r="4" fill="#374151" className="animate-pulse-slow" />
              
              {/* Animated water droplets */}
              <circle cx="50" cy="60" r="2" fill="#3b82f6" className="animate-bounce" style={{ animationDelay: '1s' }} />
              <circle cx="80" cy="50" r="1.5" fill="#10b981" className="animate-bounce" style={{ animationDelay: '1.2s' }} />
              <circle cx="120" cy="55" r="2" fill="#8b5cf6" className="animate-bounce" style={{ animationDelay: '1.4s' }} />
              <circle cx="150" cy="60" r="1.5" fill="#3b82f6" className="animate-bounce" style={{ animationDelay: '1.6s' }} />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center animate-fadeIn animation-delay-1000">
              <div className="text-center">
                <span className="text-4xl font-bold text-cyan-700 animate-pulse-slow">{totalPercentage}%</span>
                <div className="text-xs text-cyan-600 font-medium mt-1">Total Usage</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {usageData.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 hover:scale-105 hover:shadow-md ${item.bgColor} ${item.borderColor} animate-fadeInUp`}
              style={{ animationDelay: `${1200 + index * 200}ms` }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3 animate-bounce" style={{ animationDelay: `${1400 + index * 200}ms` }}>
                  {item.icon}
                </span>
                <div 
                  className="w-4 h-4 rounded-full mr-3 animate-pulse-slow shadow-sm" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                <div className={`w-16 h-2 rounded-full bg-gray-200 overflow-hidden`}>
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-2000`}
                    style={{ 
                      width: `${item.percentage}%`,
                      animationDelay: `${1600 + index * 300}ms`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Monthly Consumption Chart (Enhanced Vertical Bar Chart with Unique Animations)
  const MonthlyConsumptionChart = () => {
    const [timeRange, setTimeRange] = useState('6months');
    
    const consumptionData = {
      '6months': [
        { month: 'Jan', consumption: 85, isPeak: false, color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
        { month: 'Feb', consumption: 92, isPeak: false, color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
        { month: 'Mar', consumption: 78, isPeak: false, color: '#8b5cf6', gradient: 'from-violet-400 to-violet-600' },
        { month: 'Apr', consumption: 88, isPeak: false, color: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },
        { month: 'May', consumption: 95, isPeak: true, color: '#ef4444', gradient: 'from-red-400 to-red-600' },
        { month: 'Jun', consumption: 87, isPeak: false, color: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' }
      ],
      '12months': [
        { month: 'Jul', consumption: 82, isPeak: false, color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
        { month: 'Aug', consumption: 89, isPeak: false, color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
        { month: 'Sep', consumption: 76, isPeak: false, color: '#8b5cf6', gradient: 'from-violet-400 to-violet-600' },
        { month: 'Oct', consumption: 91, isPeak: false, color: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },
        { month: 'Nov', consumption: 88, isPeak: false, color: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' },
        { month: 'Dec', consumption: 94, isPeak: false, color: '#ec4899', gradient: 'from-pink-400 to-pink-600' },
        { month: 'Jan', consumption: 85, isPeak: false, color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
        { month: 'Feb', consumption: 92, isPeak: false, color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
        { month: 'Mar', consumption: 78, isPeak: false, color: '#8b5cf6', gradient: 'from-violet-400 to-violet-600' },
        { month: 'Apr', consumption: 88, isPeak: false, color: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },
        { month: 'May', consumption: 95, isPeak: true, color: '#ef4444', gradient: 'from-red-400 to-red-600' },
        { month: 'Jun', consumption: 87, isPeak: false, color: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' }
      ]
    };

    const currentData = consumptionData[timeRange];
    const maxConsumption = Math.max(...currentData.map(item => item.consumption));
    const avgConsumption = (currentData.reduce((sum, item) => sum + item.consumption, 0) / currentData.length).toFixed(1);
    const peakMonth = currentData.find(item => item.isPeak);

    return (
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Monthly Consumption</h3>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-purple-300 rounded-md bg-purple-50 text-purple-700 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-purple-100 transition-colors animate-fadeInUp animation-delay-100"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
        
        {/* Bar Chart */}
        <div className="h-48 flex items-end space-x-2 mb-6 animate-scaleIn animation-delay-200">
          {currentData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div 
                className={`w-full rounded-t-lg transition-all duration-1500 ease-out cursor-pointer shadow-lg group-hover:shadow-2xl group-hover:scale-105 relative overflow-hidden ${
                  data.isPeak 
                    ? 'bg-gradient-to-t from-red-500 to-red-400 border-2 border-red-300 shadow-red-200' 
                    : `bg-gradient-to-t ${data.gradient}`
                }`}
                style={{ 
                  height: `${(data.consumption / maxConsumption) * 140}px`,
                  animationDelay: `${300 + index * 150}ms`
                }}
                title={`${data.month}: ${data.consumption}M gallons`}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20 rounded-t-lg"></div>
                
                {/* Peak indicator */}
                {data.isPeak && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-bounce">
                    <span className="text-xs text-white font-bold">🔥</span>
                  </div>
                )}
                
                {/* Value display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg animate-fadeIn" style={{ animationDelay: `${800 + index * 100}ms` }}>
                    {data.consumption}M
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2 font-medium animate-fadeInUp" style={{ animationDelay: `${600 + index * 100}ms` }}>
                {data.month}
              </span>
            </div>
          ))}
        </div>
        
        {/* Stats */}
        <div className="pt-6 border-t border-purple-200">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors animate-scaleIn animation-delay-400">
              <p className="text-sm text-purple-600 font-medium">Avg Monthly</p>
              <p className="text-2xl font-bold text-purple-800 animate-pulse-slow">{avgConsumption}M</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors animate-scaleIn animation-delay-500">
              <p className="text-sm text-red-600 font-medium">Peak Month</p>
              <p className="text-2xl font-bold text-red-800 animate-pulse-slow">{peakMonth?.month}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Recent Activities (Vertical Timeline with Icons)
  const RecentActivities = () => {
    const activities = [
      { 
        id: 1, 
        type: 'New User', 
        message: 'John Doe registered for water service', 
        time: new Date(Date.now() - 5 * 60 * 1000),
        icon: 'UserIcon',
        color: '#10b981',
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        emoji: '👤'
      },
      { 
        id: 2, 
        type: 'New Connection', 
        message: 'Connection #1234 activated successfully', 
        time: new Date(Date.now() - 15 * 60 * 1000),
        icon: 'PlugIcon',
        color: '#3b82f6',
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        emoji: '🔌'
      },
      { 
        id: 3, 
        type: 'Bill Payment', 
        message: 'Payment of ₹2,500 received from Sarah Wilson', 
        time: new Date(Date.now() - 30 * 60 * 1000),
        icon: 'CreditCardIcon',
        color: '#8b5cf6',
        gradient: 'from-violet-400 to-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        emoji: '💳'
      },
      { 
        id: 4, 
        type: 'New User', 
        message: 'Mike Johnson registered for water service', 
        time: new Date(Date.now() - 45 * 60 * 1000),
        icon: 'UserIcon',
        color: '#f59e0b',
        gradient: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        emoji: '👤'
      },
      { 
        id: 5, 
        type: 'New Connection', 
        message: 'Connection #1235 activated successfully', 
        time: new Date(Date.now() - 60 * 60 * 1000),
        icon: 'PlugIcon',
        color: '#06b6d4',
        gradient: 'from-cyan-400 to-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        emoji: '🔌'
      }
    ];

    const getActivityIcon = (iconName) => {
      switch (iconName) {
        case 'UserIcon':
          return <UserGroupIcon className="h-5 w-5" />;
        case 'PlugIcon':
          return <CogIcon className="h-5 w-5" />;
        case 'CreditCardIcon':
          return <DocumentTextIcon className="h-5 w-5" />;
        default:
          return <UserGroupIcon className="h-5 w-5" />;
      }
    };

    return (
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg border border-indigo-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Recent Activities</h3>
          <div className="text-sm text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full animate-fadeInUp animation-delay-100">
            Live Updates
          </div>
        </div>
        
        <div className="relative">
          {/* Enhanced Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-200 animate-pulse-slow"></div>
          
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="relative flex items-start space-x-4 group animate-fadeInUp"
                style={{ animationDelay: `${200 + index * 200}ms` }}
              >
                {/* Enhanced Timeline dot */}
                <div 
                  className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl bg-gradient-to-br ${activity.gradient}`}
                >
                  <div className="text-white text-xl animate-bounce" style={{ animationDelay: `${400 + index * 150}ms` }}>
                    {activity.emoji}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                </div>
                
                {/* Enhanced Activity content */}
                <div className={`flex-1 min-w-0 pb-6 p-4 rounded-lg border transition-all duration-500 hover:scale-105 hover:shadow-md ${activity.bgColor} ${activity.borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{activity.type}</span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                      {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {activity.time.toLocaleDateString()}
                  </p>
                  
                  {/* Animated progress indicator */}
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-1 rounded-full bg-gradient-to-r ${activity.gradient} transition-all duration-2000`}
                      style={{ 
                        width: `${100 - (index * 15)}%`,
                        animationDelay: `${600 + index * 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-indigo-200">
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-all duration-300 hover:scale-105 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg">
            View All Activities →
          </button>
        </div>
      </div>
    );
  };

  // System Tasks (Cards with Priority Colors)
  const SystemTasksCards = () => {
    const [filterPriority, setFilterPriority] = useState('all');
    
    const tasks = [
      {
        id: 1,
        title: 'Water Quality Testing',
        date: 'June 19, 2024',
        priority: 'high',
        status: 'completed',
        description: 'Monthly water quality assessment',
        color: '#ef4444',
        gradient: 'from-red-400 to-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        emoji: '🧪',
        icon: 'BeakerIcon'
      },
      {
        id: 2,
        title: 'Pipeline Inspection',
        date: 'June 20, 2024',
        priority: 'medium',
        status: 'pending',
        description: 'Routine pipeline maintenance check',
        color: '#f59e0b',
        gradient: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        emoji: '🔧',
        icon: 'WrenchIcon'
      },
      {
        id: 3,
        title: 'Meter Calibration',
        date: 'June 21, 2024',
        priority: 'low',
        status: 'pending',
        description: 'Quarterly meter accuracy verification',
        color: '#10b981',
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        emoji: '📊',
        icon: 'ChartBarIcon'
      },
      {
        id: 4,
        title: 'Reservoir Maintenance',
        date: 'June 22, 2024',
        priority: 'medium',
        status: 'pending',
        description: 'Reservoir cleaning and inspection',
        color: '#3b82f6',
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        emoji: '🏗️',
        icon: 'BuildingOfficeIcon'
      },
      {
        id: 5,
        title: 'Emergency Response Drill',
        date: 'June 23, 2024',
        priority: 'high',
        status: 'pending',
        description: 'Quarterly emergency preparedness test',
        color: '#dc2626',
        gradient: 'from-red-500 to-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        emoji: '🚨',
        icon: 'ExclamationTriangleIcon'
      }
    ];

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return '#ef4444';
        case 'medium': return '#facc15';
        case 'low': return '#22c55e';
        default: return '#9ca3af';
      }
    };

    const getPriorityBg = (priority) => {
      switch (priority) {
        case 'high': return 'bg-red-50 border-red-200';
        case 'medium': return 'bg-yellow-50 border-yellow-200';
        case 'low': return 'bg-green-50 border-green-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    };

    const filteredTasks = filterPriority === 'all' 
      ? tasks 
      : tasks.filter(task => task.priority === filterPriority);

    return (
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">System Tasks</h3>
          <div className="flex items-center space-x-2">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs border border-orange-300 rounded-md px-3 py-1 bg-orange-50 text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:bg-orange-100 transition-colors animate-fadeInUp animation-delay-100"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all duration-300 hover:scale-110 animate-fadeInUp animation-delay-200">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-lg border transition-all duration-500 hover:scale-105 hover:shadow-lg ${task.bgColor} ${task.borderColor} animate-fadeInUp`}
              style={{ animationDelay: `${300 + index * 150}ms` }}
            >
              <div className="flex items-start space-x-4">
                {/* Enhanced Priority indicator with emoji */}
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 animate-pulse-slow shadow-sm"
                    style={{ backgroundColor: task.color }}
                  ></div>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: `${500 + index * 100}ms` }}>
                    {task.emoji}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h4>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 font-medium">{task.description}</p>
                  
                  {/* Enhanced progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-2 overflow-hidden">
                    <div 
                      className={`h-1 rounded-full bg-gradient-to-r ${task.gradient} transition-all duration-2000`}
                      style={{ 
                        width: task.status === 'completed' ? '100%' : `${Math.random() * 60 + 20}%`,
                        animationDelay: `${700 + index * 200}ms`
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">{task.date}</span>
                    <span className="text-xs font-bold capitalize px-2 py-1 rounded-full bg-white shadow-sm" style={{ color: task.color }}>
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-orange-200">
          <button className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium transition-all duration-300 hover:scale-105 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg">
            View All Tasks →
          </button>
        </div>
      </div>
    );
  };

  // Quick Actions (Modern Button Grid with Animations)
  const QuickActionsGrid = () => {
    const actions = [
      {
        id: 1,
        title: 'Add User',
        description: 'Register new user',
        icon: UserGroupIcon,
        color: '#10b981',
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        hoverColor: 'hover:bg-emerald-100',
        borderColor: 'border-emerald-200',
        emoji: '👥'
      },
      {
        id: 2,
        title: 'New Connection',
        description: 'Create water connection',
        icon: CogIcon,
        color: '#3b82f6',
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100',
        borderColor: 'border-blue-200',
        emoji: '🔌'
      },
      {
        id: 3,
        title: 'Generate Bill',
        description: 'Create new bill',
        icon: DocumentTextIcon,
        color: '#8b5cf6',
        gradient: 'from-violet-400 to-violet-600',
        bgColor: 'bg-violet-50',
        hoverColor: 'hover:bg-violet-100',
        borderColor: 'border-violet-200',
        emoji: '📄'
      },
      {
        id: 4,
        title: 'View Reports',
        description: 'Analytics dashboard',
        icon: ChartBarIcon,
        color: '#f59e0b',
        gradient: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        hoverColor: 'hover:bg-amber-100',
        borderColor: 'border-amber-200',
        emoji: '📊'
      }
    ];

    return (
      <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-lg border border-pink-200 p-6 hover:shadow-2xl transition-all duration-700 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 animate-fadeInUp">Quick Actions</h3>
          <div className="text-sm text-pink-600 bg-pink-100 px-3 py-1 rounded-full animate-fadeInUp animation-delay-100">
            Common Tasks
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <button
              key={action.id}
              className={`group p-4 border rounded-xl text-left transition-all duration-500 hover:scale-110 hover:shadow-xl ${action.bgColor} ${action.hoverColor} ${action.borderColor} animate-fadeInUp`}
              style={{
                animationDelay: `${200 + index * 150}ms`
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div 
                  className={`p-4 rounded-full mb-3 transition-all duration-500 group-hover:scale-125 group-hover:shadow-lg bg-gradient-to-br ${action.gradient} relative overflow-hidden`}
                >
                  <div className="text-white text-2xl animate-bounce" style={{ animationDelay: `${400 + index * 100}ms` }}>
                    {action.emoji}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                <p className="text-xs text-gray-600 font-medium">{action.description}</p>
                
                {/* Animated progress indicator */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className={`h-1 rounded-full bg-gradient-to-r ${action.gradient} transition-all duration-2000`}
                    style={{ 
                      width: `${Math.random() * 40 + 60}%`,
                      animationDelay: `${600 + index * 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-pink-200">
          <button className="w-full text-sm text-pink-600 hover:text-pink-700 font-medium transition-all duration-300 hover:scale-105 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-lg">
            View All Actions →
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 animate-pulse-slow">Loading Dashboard</p>
            <p className="text-sm text-gray-500 animate-fadeIn animation-delay-200">Preparing your water system analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="dashboard">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideDown { animation: slideDown 0.8s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.8s ease-out; }
        .animate-slideRight { animation: slideRight 0.8s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.8s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-900 { animation-delay: 0.9s; }
        .animation-delay-1000 { animation-delay: 1.0s; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, #f0f9ff, #ecfdf5);
          border-radius: 12px;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(135deg, #22c55e, #3b82f6, #a855f7);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }
      `}</style>
      
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between animate-slideDown">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 animate-fadeInUp">Dashboard</h1>
            <p className="text-gray-600 animate-fadeInUp animation-delay-100">Welcome back! Here's what's happening with your water system.</p>
          </div>
          <div className="flex items-center space-x-3 animate-fadeInRight">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-float">
              Generate Report
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md">
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1 animate-fadeInUp animation-delay-200">New Connections</p>
                <p className="text-3xl font-bold text-green-900 animate-fadeInUp animation-delay-300">{dashboardData.newConnections}</p>
                <div className="flex items-center mt-2 animate-fadeInUp animation-delay-400">
                  <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1 animate-pulse-slow" />
                  <span className="text-sm text-green-600">8.70% from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg animate-float">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1 animate-fadeInUp animation-delay-300">Active Connections</p>
                <p className="text-3xl font-bold text-blue-900 animate-fadeInUp animation-delay-400">{dashboardData.activeConnections}</p>
                <div className="flex items-center mt-2 animate-fadeInUp animation-delay-500">
                  <ArrowUpIcon className="h-4 w-4 text-blue-600 mr-1 animate-pulse-slow" />
                  <span className="text-sm text-blue-600">3.56% from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg animate-float animation-delay-200">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1 animate-fadeInUp animation-delay-400">Pending Bills</p>
                <p className="text-3xl font-bold text-purple-900 animate-fadeInUp animation-delay-500">{dashboardData.pendingBills}</p>
                <div className="flex items-center mt-2 animate-fadeInUp animation-delay-600">
                  <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1 animate-pulse-slow" />
                  <span className="text-sm text-red-600">1.06% from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg animate-float animation-delay-400">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1 animate-fadeInUp animation-delay-500">Total Revenue</p>
                <p className="text-3xl font-bold text-orange-900 animate-fadeInUp animation-delay-600">${dashboardData.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2 animate-fadeInUp animation-delay-700">
                  <ArrowUpIcon className="h-4 w-4 text-orange-600 mr-1 animate-pulse-slow" />
                  <span className="text-sm text-orange-600">5.70% from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg animate-float animation-delay-600">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-slideLeft animation-delay-500">
            <RevenueChart />
          </div>
          <div className="animate-slideRight animation-delay-600">
            <OverallRating />
          </div>
        </div>

        {/* Connection Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="animate-slideUp animation-delay-700">
            <ConnectionStatusChart />
          </div>
          <div className="lg:col-span-2 animate-slideUp animation-delay-800">
            {/* Connection Availability Chart */}
            <ConnectionAvailabilityChart />
          </div>
        </div>

        {/* Water System Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Usage Distribution */}
          <div className="animate-scaleIn animation-delay-900">
            <WaterUsageGaugeChart />
          </div>

          {/* Monthly Water Consumption */}
          <div className="animate-scaleIn animation-delay-1000">
            <MonthlyConsumptionChart />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="animate-fadeIn animation-delay-1100">
            <RecentActivities />
          </div>
          
          {/* System Tasks */}
          <div className="animate-fadeIn animation-delay-1200">
            <SystemTasksCards />
          </div>
          
          {/* Quick Actions */}
          <div className="animate-fadeIn animation-delay-1300">
            <QuickActionsGrid />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
