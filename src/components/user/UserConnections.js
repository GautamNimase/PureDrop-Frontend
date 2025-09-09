import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import ConnectionCard from './ConnectionCard';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  MapPinIcon,
  CogIcon,
  WifiIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  HomeIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  BoltIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const UserConnections = memo(() => {
  const { user, token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedConnectionForModal, setSelectedConnectionForModal] = useState(null);

  // Optimized animation variants for better performance
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
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.01,
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.97,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    }
  };

  const ctaButtonVariants = {
    hover: {
      scale: 1.03,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.97,
      y: 0,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    }
  };

  const emptyStateVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.1
      }
    }
  };

  const iconVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    
    setLoading(true);
    
    // Mock data for demonstration
    const mockConnections = [
      {
        _id: '1',
        ConnectionID: 'CONN001',
        Status: 'Active',
        Address: '123 Main Street, City, State 12345',
        MeterNumber: 'M001',
        LastReadingDate: '2024-01-15',
        ConnectionType: 'Residential',
        ContactNumber: '+1-555-0123',
        Email: 'user@example.com'
      },
      {
        _id: '2',
        ConnectionID: 'CONN002',
        Status: 'Inactive',
        Address: '456 Oak Avenue, City, State 12345',
        MeterNumber: 'M002',
        LastReadingDate: '2024-01-10',
        ConnectionType: 'Commercial',
        ContactNumber: '+1-555-0124',
        Email: 'user2@example.com'
      },
      {
        _id: '3',
        ConnectionID: 'CONN003',
        Status: 'Pending',
        Address: '789 Pine Road, City, State 12345',
        MeterNumber: 'M003',
        LastReadingDate: '2024-01-05',
        ConnectionType: 'Residential',
        ContactNumber: '+1-555-0125',
        Email: 'user3@example.com'
      }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setConnections(mockConnections);
      setError(null);
      setLoading(false);
    }, 1000);
    
    // Uncomment below for real API call
    /*
    fetch(`/api/connections?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is always an array
        const connectionsArray = Array.isArray(data) ? data : [];
        setConnections(connectionsArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading connections:', err);
        setError('Failed to load connections');
        setConnections([]); // Ensure connections is always an array
        setLoading(false);
      });
    */
  }, [user?.UserID, user?.id, token]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      case 'pending approval':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'suspended':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = connections.length;
    const active = connections.filter(c => c.Status?.toLowerCase() === 'active').length;
    const inactive = connections.filter(c => c.Status?.toLowerCase() === 'inactive').length;
    const pending = connections.filter(c => c.Status?.toLowerCase() === 'pending' || c.Status?.toLowerCase() === 'pending approval').length;
    
    return { total, active, inactive, pending };
  }, [connections]);

  // Chart data for donut chart
  const chartData = useMemo(() => {
    const data = [
      { name: 'Active', value: stats.active, color: '#22c55e' },
      { name: 'Inactive', value: stats.inactive, color: '#ef4444' },
      { name: 'Pending', value: stats.pending, color: '#f59e0b' }
    ];
    
    // Only include categories with values > 0
    return data.filter(item => item.value > 0);
  }, [stats]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 font-poppins">{data.name}</p>
          <p className="text-sm text-gray-600 font-inter">
            {data.value} connection{data.value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  // Filter connections
  const filteredConnections = useMemo(() => {
    let filtered = connections;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(connection => 
        connection.Status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(connection => 
        connection.ConnectionID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.Address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.MeterNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [connections, statusFilter, searchTerm]);

  // Action handlers
  const handleViewDetails = useCallback((connection) => {
    // Open connection details modal
    setSelectedConnectionForModal(connection);
    setShowConnectionModal(true);
  }, []);

  const handleCardClick = useCallback((connection) => {
    setSelectedConnectionForModal(connection);
    setShowConnectionModal(true);
  }, []);

  const handleEdit = useCallback((connection) => {
    // Open edit modal or navigate to edit page
    alert(`Edit functionality for connection ${connection.ConnectionID || connection._id.slice(-8)} would be implemented here.`);
    console.log('Edit connection:', connection);
  }, []);

  const handleDelete = useCallback((connection) => {
    setSelectedConnection(connection);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedConnection) return;
    
    try {
      // API call to delete connection
      const response = await fetch(`/api/connections/${selectedConnection._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnections(prev => prev.filter(conn => conn._id !== selectedConnection._id));
        setShowDeleteModal(false);
        setSelectedConnection(null);
      } else {
        throw new Error('Failed to delete connection');
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      setError('Failed to delete connection');
    }
  }, [selectedConnection, token]);

  const handleRequestNewConnection = useCallback(() => {
    // Open new connection request modal or navigate to page
    alert('New Connection Request functionality would be implemented here. This would open a form to request a new water connection.');
    console.log('Request new connection');
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading spinner component
  const Spinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-cyan-200 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
            <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-cyan-200 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8 text-center">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-cyan-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <WifiIcon className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] font-poppins tracking-tight">
                My Connections
              </h1>
              <p className="text-[#6b7280] font-inter font-medium">
                Manage your water connections and view their status
              </p>
      </div>
          </div>
        </motion.div>

        {/* Stats Overview Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Stats Cards */}
            <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-white/30 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280] font-inter">Total</p>
                    <p className="text-2xl font-bold text-[#111827] font-poppins">{stats.total}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-white/30 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280] font-inter">Active</p>
                    <p className="text-2xl font-bold text-[#111827] font-poppins">{stats.active}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-white/30 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280] font-inter">Inactive</p>
                    <p className="text-2xl font-bold text-[#111827] font-poppins">{stats.inactive}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Donut Chart */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/30 shadow-lg"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-[#111827] font-poppins mb-1">Status Distribution</h3>
                <p className="text-sm text-[#6b7280] font-inter">Connection Overview</p>
              </div>
              
              {chartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: '12px',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
        </div>
      ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ChartBarIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-[#6b7280] font-inter">No data to display</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Filter & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-inter text-sm sm:text-base"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </motion.button>
              </div>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="flex flex-wrap gap-2">
                    {['all', 'active', 'inactive', 'pending', 'suspended'].map((status) => (
                      <motion.button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          statusFilter === status
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Activity Timeline */}
        {connections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BoltIcon className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-[#111827] font-poppins">Recent Activity</h3>
              </div>
              
              <div className="space-y-3">
                {connections.slice(0, 3).map((connection, index) => (
                  <motion.div
                    key={connection._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 font-poppins">
                        Connection #{connection.ConnectionID || connection._id.slice(-8)} updated
                      </p>
                      <p className="text-xs text-[#6b7280] font-inter">
                        {formatDate(connection.LastReadingDate)} • {connection.Status}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {connections.length === 0 ? (
          /* Empty State */
          <motion.div
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8 sm:p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                variants={iconVariants}
                className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <HomeIcon className="w-12 h-12 text-cyan-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#111827] font-poppins mb-3">
                No Connections Found
              </h3>
              <p className="text-[#6b7280] font-inter font-medium mb-8 leading-relaxed">
                You don't have any water connections yet. Request a new connection to get started with water services.
              </p>
              <motion.button
                onClick={handleRequestNewConnection}
                variants={ctaButtonVariants}
                whileHover="hover"
                whileTap="tap"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <PlusIcon className="w-4 h-4" />
                </div>
                Request New Connection
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Connections Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {filteredConnections.map((connection) => (
                <ConnectionCard
                  key={connection._id}
                  connection={connection}
                  variants={cardVariants}
                  buttonVariants={buttonVariants}
                  onCardClick={handleCardClick}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && selectedConnection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrashIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] font-poppins">Delete Connection</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-[#6b7280] font-inter font-medium">
                    Are you sure you want to delete connection #{selectedConnection.ConnectionID || selectedConnection._id.slice(-8)}? 
                    This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowDeleteModal(false)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={confirmDelete}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </motion.button>
              </div>
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
        >
          <motion.button
            onClick={handleRequestNewConnection}
            variants={ctaButtonVariants}
            whileHover="hover"
            whileTap="tap"
            title="Add New Connection"
            className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
          >
            <PlusIcon className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Connection Details Modal */}
        <AnimatePresence>
          {showConnectionModal && selectedConnectionForModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowConnectionModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/30 max-w-xs sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <WifiIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-[#111827] font-poppins">
                          Connection Details
                        </h3>
                        <p className="text-xs sm:text-sm text-[#6b7280] font-inter">
                          #{selectedConnectionForModal.ConnectionID || selectedConnectionForModal._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowConnectionModal(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Status Section */}
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50/50 rounded-xl">
                    {getStatusIcon(selectedConnectionForModal.Status)}
                    <div>
                      <p className="text-sm font-medium text-[#6b7280] font-inter">Status</p>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(selectedConnectionForModal.Status)}`}>
                        {selectedConnectionForModal.Status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Connection Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#6b7280] font-inter">Address</p>
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {selectedConnectionForModal.Address || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <BeakerIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#6b7280] font-inter">Meter Number</p>
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {selectedConnectionForModal.MeterNumber || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#6b7280] font-inter">Last Reading</p>
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {formatDate(selectedConnectionForModal.LastReadingDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#6b7280] font-inter">Connection Type</p>
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {selectedConnectionForModal.ConnectionType || 'Residential'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#6b7280] font-inter">Contact</p>
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {selectedConnectionForModal.ContactNumber || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#6b7280] font-inter">Email</p>
                          <p className="text-sm font-medium text-gray-900 font-poppins">
                            {selectedConnectionForModal.Email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      onClick={() => {
                        setShowConnectionModal(false);
                        handleEdit(selectedConnectionForModal);
                      }}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Connection</span>
                      <span className="sm:hidden">Edit</span>
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowConnectionModal(false);
                        handleDelete(selectedConnectionForModal);
                      }}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg sm:rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete Connection</span>
                      <span className="sm:hidden">Delete</span>
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

export default UserConnections; 