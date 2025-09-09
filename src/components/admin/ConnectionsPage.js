import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';
import { 
  CogIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  SparklesIcon,
  HomeIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './AdminLayout';

const initialFormState = {
  UserID: '',
  ConnectionDate: '',
  MeterNumber: '',
  Status: '',
  SourceID: '',
};

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [users, setUsers] = useState([]);
  const [waterSources, setWaterSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [maxConnectionsWarning, setMaxConnectionsWarning] = useState(false);
  const [customerIdError, setCustomerIdError] = useState("");
  
  // Modern features state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showConnectionDetails, setShowConnectionDetails] = useState(null);
  
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch connections from backend (with localStorage persistence)
  const fetchConnections = () => {
    setLoading(true);
    
    // Check if connections exist in localStorage first
    const savedConnections = localStorage.getItem('waterSystem_connections');
    
    if (savedConnections) {
      // Load connections from localStorage
      try {
        const parsedConnections = JSON.parse(savedConnections);
        setTimeout(() => {
          setConnections(parsedConnections);
          setError(null);
          setLoading(false);
        }, 500);
        return;
      } catch (error) {
        console.error('Error parsing saved connections:', error);
      }
    }
    
    // Default mock connections data for first time users
    const defaultConnections = [
      {
        _id: '1',
        UserID: 1,
        ConnectionDate: '2024-01-15',
        MeterNumber: 'M001',
        Status: 'Active',
        SourceID: '1',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: '2',
        UserID: 2,
        ConnectionDate: '2024-01-20',
        MeterNumber: 'M002',
        Status: 'Active',
        SourceID: '2',
        createdAt: '2024-01-20T14:30:00Z'
      },
      {
        _id: '3',
        UserID: 3,
        ConnectionDate: '2024-02-01',
        MeterNumber: 'M003',
        Status: 'Inactive',
        SourceID: '1',
        createdAt: '2024-02-01T09:15:00Z'
      }
    ];
    
    // Save default connections to localStorage
    localStorage.setItem('waterSystem_connections', JSON.stringify(defaultConnections));
    
    // Simulate API call delay
    setTimeout(() => {
      setConnections(defaultConnections);
      setError(null);
      setLoading(false);
    }, 1000);
    
    // Uncomment below for real API call
    /*
    fetch('/api/connections')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch connections');
        return res.json();
      })
      .then((data) => {
        setConnections(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    */
  };

  // Fetch users for lookup
  const fetchUsers = () => {
    // Mock users data for demonstration
    const mockUsers = [
      { _id: '1', UserID: 1, Name: 'John Doe', Email: 'john@example.com' },
      { _id: '2', UserID: 2, Name: 'Jane Smith', Email: 'jane@example.com' },
      { _id: '3', UserID: 3, Name: 'Bob Johnson', Email: 'bob@example.com' },
      { _id: '4', UserID: 4, Name: 'Alice Brown', Email: 'alice@example.com' },
      { _id: '5', UserID: 5, Name: 'Charlie Wilson', Email: 'charlie@example.com' }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setUsers(mockUsers);
    }, 500);
    
    // Uncomment below for real API call
    /*
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
    */
  };

  // Fetch water sources for dropdown
  const fetchWaterSources = () => {
    // Mock water sources data for demonstration
    const mockWaterSources = [
      { _id: '1', Name: 'Main Water Plant', Type: 'Ground Water', Location: 'City Center' },
      { _id: '2', Name: 'Reservoir A', Type: 'Surface Water', Location: 'North District' },
      { _id: '3', Name: 'Well Station B', Type: 'Ground Water', Location: 'South District' },
      { _id: '4', Name: 'Lake Source', Type: 'Surface Water', Location: 'East District' }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setWaterSources(mockWaterSources);
    }, 500);
    
    // Uncomment below for real API call
    /*
    fetch('/api/water-sources')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch water sources');
        return res.json();
      })
      .then((data) => setWaterSources(data))
      .catch(() => setWaterSources([]));
    */
  };

  useEffect(() => {
    fetchConnections();
    fetchUsers();
    fetchWaterSources();
  }, []);

  // Memoized filtered and sorted connections
  const filteredConnections = useMemo(() => {
    let filtered = connections.filter(connection => {
      const matchesSearch = connection.MeterNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           connection.Status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (connection.UserID && typeof connection.UserID === 'object' ? 
                             connection.UserID.Name?.toLowerCase().includes(searchTerm.toLowerCase()) :
                             String(connection.UserID).includes(searchTerm));
      const matchesFilter = filterStatus === 'all' || connection.Status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    // Sort connections
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.ConnectionDate);
          bValue = new Date(b.ConnectionDate);
          break;
        case 'meter':
          aValue = a.MeterNumber?.toLowerCase() || '';
          bValue = b.MeterNumber?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.Status?.toLowerCase() || '';
          bValue = b.Status?.toLowerCase() || '';
          break;
        case 'user':
          aValue = typeof a.UserID === 'object' ? a.UserID.Name?.toLowerCase() || '' : String(a.UserID);
          bValue = typeof b.UserID === 'object' ? b.UserID.Name?.toLowerCase() || '' : String(b.UserID);
          break;
        default:
          aValue = new Date(a.ConnectionDate);
          bValue = new Date(b.ConnectionDate);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [connections, searchTerm, filterStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredConnections.length / itemsPerPage);
  const paginatedConnections = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredConnections.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredConnections, page, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = connections.length;
    const active = connections.filter(c => c.Status === 'Active').length;
    const inactive = connections.filter(c => c.Status === 'Inactive').length;
    return { total, active, inactive };
  }, [connections]);

  // Auto-open add modal if navigated with action=add
  useEffect(() => {
    if (
      location.state &&
      location.state.action === 'add' &&
      !showForm
    ) {
      openAddForm();
      // Clear the state so it doesn't reopen on every navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, showForm, navigate, location.pathname]);

  useEffect(() => {
    if (showForm && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeForm(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  // Focus trap for modal
  useEffect(() => {
    if (!showForm) return;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    const firstEl = modal.querySelectorAll(focusableElements)[0];
    const focusEls = modal.querySelectorAll(focusableElements);
    const lastEl = focusEls[focusEls.length - 1];
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    modal.addEventListener('keydown', trap);
    return () => modal.removeEventListener('keydown', trap);
  }, [showForm]);

  // Check max 2 connections per user
  useEffect(() => {
    if (!showForm || !formData.UserID) {
      setMaxConnectionsWarning(false);
      setCustomerIdError("");
      return;
    }
    const normalize = (val) => {
      if (typeof val === 'object' && val && val._id) return val._id;
      return String(val);
    };
    const count = connections.filter(c => normalize(c.UserID) === normalize(formData.UserID)).length;
    setMaxConnectionsWarning(!isEdit && count >= 2);
    // UserID validation
    const userFound = users.some(u => String(u.UserID) === String(formData.UserID) || String(u._id) === String(formData.UserID));
    if (!userFound) {
      setCustomerIdError('UserID is not present');
    } else {
      setCustomerIdError('');
    }
  }, [formData.UserID, connections, showForm, isEdit, users]);

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (connection) => {
    // Normalize UserID for the form: use integer ID if available or fallback to populated object's UserID/_id
    let userIdForForm = connection.UserID;
    if (typeof connection.UserID === 'object' && connection.UserID) {
      // Try to map populated user back to integer UserID from users list
      const matched = users.find(u => String(u._id) === String(connection.UserID._id) || String(u.UserID) === String(connection.UserID.UserID));
      userIdForForm = matched ? matched.UserID : (connection.UserID.UserID || connection.UserID._id);
    }
    setFormData({
      UserID: userIdForForm,
      ConnectionDate: connection.ConnectionDate,
      MeterNumber: connection.MeterNumber,
      Status: connection.Status,
      SourceID: connection.SourceID ? connection.SourceID._id : '',
    });
    setIsEdit(true);
    setEditId(connection._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setFormErrors({});
    setMaxConnectionsWarning(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.UserID) errors.UserID = 'User is required';
    if (!formData.ConnectionDate) errors.ConnectionDate = 'Connection Date is required';
    if (!formData.MeterNumber.trim()) errors.MeterNumber = 'Meter Number is required';
    if (!formData.Status.trim()) errors.Status = 'Status is required';
    if (!formData.SourceID) errors.SourceID = 'Water Source is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || maxConnectionsWarning) return;
    setSubmitting(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Format ConnectionDate to YYYY-MM-DD if needed
      let formattedDate = formData.ConnectionDate;
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      
      const newConnection = {
        _id: Date.now().toString(), // Generate unique ID
        UserID: parseInt(formData.UserID),
        ConnectionDate: formattedDate,
        MeterNumber: formData.MeterNumber.trim(),
        Status: formData.Status,
        SourceID: formData.SourceID,
        createdAt: new Date().toISOString()
      };
      
      if (isEdit) {
        // Update existing connection
        const updatedConnections = connections.map(conn => 
          conn._id === editId ? { ...conn, ...newConnection } : conn
        );
        setConnections(updatedConnections);
        
        // Save to localStorage for persistence
        localStorage.setItem('waterSystem_connections', JSON.stringify(updatedConnections));
        
        setSuccessMsg('Connection updated successfully!');
      } else {
        // Add new connection
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        
        // Save to localStorage for persistence
        localStorage.setItem('waterSystem_connections', JSON.stringify(updatedConnections));
        
        setSuccessMsg('Connection added successfully!');
      }
      
      closeForm();
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Uncomment below for real API call
      /*
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/connections/${editId}` : '/api/connections';
      const requestData = {
        ...formData,
        ConnectionDate: formattedDate,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!res.ok) throw new Error('Failed to save connection');
      closeForm();
      fetchConnections();
      setSuccessMsg(isEdit ? 'Connection updated successfully!' : 'Connection added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      */
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove connection from state
      const updatedConnections = connections.filter(conn => conn._id !== id);
      setConnections(updatedConnections);
      
      // Save to localStorage for persistence
      localStorage.setItem('waterSystem_connections', JSON.stringify(updatedConnections));
      
      setSuccessMsg('Connection deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Uncomment below for real API call
      /*
      const res = await fetch(`/api/connections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete connection');
      fetchConnections();
      setSuccessMsg('Connection deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      */
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const handleSelectConnection = useCallback((connectionId) => {
    setSelectedConnections(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedConnections.length === paginatedConnections.length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(paginatedConnections.map(connection => connection._id));
    }
  }, [selectedConnections.length, paginatedConnections]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedConnections.length} connections?`)) return;
    try {
      await Promise.all(
        selectedConnections.map(connectionId => 
          fetch(`/api/connections/${connectionId}`, { method: 'DELETE' })
        )
      );
      fetchConnections();
      setSelectedConnections([]);
      setSuccessMsg(`${selectedConnections.length} connections deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete some connections');
    }
  }, [selectedConnections]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  }, []);

  // Helper to get user name by ID
  const getUserName = (id) => {
    const user = users.find(u => String(u.UserID) === String(id));
    return user ? user.Name : id;
  };

  return (
    <AdminLayout currentPage="connections" hideHeader={showConnectionDetails || showForm}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float animation-delay-200"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-full blur-3xl animate-float animation-delay-400"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float animation-delay-300"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-cyan-50/40"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes gridMove {
              0% { transform: translate(0, 0); }
              100% { transform: translate(50px, 50px); }
            }
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
            .animate-slideIn { animation: slideIn 0.6s ease-out; }
            .animate-scaleIn { animation: scaleIn 0.6s ease-out; }
            .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
            .animate-gradient { 
              background-size: 200% 200%;
              animation: gradientShift 8s ease infinite;
            }
            .animation-delay-100 { animation-delay: 0.1s; }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-300 { animation-delay: 0.3s; }
            .animation-delay-400 { animation-delay: 0.4s; }
            .animation-delay-500 { animation-delay: 0.5s; }
            .glass-effect {
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.18);
            }
            .glass-card {
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
          `}</style>

          {/* Success Message */}
          {successMsg && (
            <div className="fixed top-4 right-4 z-[10000] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Water Connections
                </h1>
                <p className="text-gray-600 text-lg">Manage water connections and meter information with advanced tools</p>
      </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <CogIcon className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={fetchConnections}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowPathIcon className="h-6 w-6 text-gray-600" />
                </button>
        <button
          onClick={openAddForm}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Connection</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Connections</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent animate-gradient">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CogIcon className="h-8 w-8 text-white animate-float" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-cyan-200 to-cyan-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full animate-shimmer"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Active</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent animate-gradient">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="h-8 w-8 text-white animate-float animation-delay-200" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-shimmer animation-delay-200"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-400 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Inactive</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent animate-gradient">{stats.inactive}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ExclamationTriangleIcon className="h-8 w-8 text-white animate-float animation-delay-400" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-red-200 to-red-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-shimmer animation-delay-400"></div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="glass-card rounded-2xl p-6 mb-6 animate-slideIn">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search connections by meter number, status, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="meter-asc">Meter A-Z</option>
                    <option value="meter-desc">Meter Z-A</option>
                    <option value="status-asc">Status A-Z</option>
                    <option value="status-desc">Status Z-A</option>
                    <option value="user-asc">User A-Z</option>
                    <option value="user-desc">User Z-A</option>
                  </select>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedConnections.length > 0 && (
                <div className="mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-700 font-medium">
                      {selectedConnections.length} connection{selectedConnections.length > 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                    >
                      Delete Selected
        </button>
                  </div>
                </div>
        )}
      </div>
          </div>

          {/* Main Content */}
          <div className="glass-card rounded-2xl overflow-hidden animate-fadeIn">
        {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mt-4 animate-pulse-slow">Loading connections...</p>
                  <p className="text-sm text-gray-500 animate-fadeIn animation-delay-200">Please wait while we fetch the data</p>
                </div>
              </div>
        ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Connections</p>
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchConnections}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedConnections.map((connection, index) => (
                        <div
                          key={connection._id || connection.ConnectionID}
                          className={`glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 border-2 ${
                            selectedConnections.includes(connection._id) 
                              ? 'border-cyan-500 bg-cyan-50/50' 
                              : 'border-transparent hover:border-white/50'
                          } animate-scaleIn group`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedConnections.includes(connection._id)}
                                onChange={() => handleSelectConnection(connection._id)}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                              />
                              <div className="h-12 w-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {connection.MeterNumber?.charAt(0) || 'C'}
                                </span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              connection.Status === 'Active' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {connection.Status}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">Meter #{connection.MeterNumber}</h3>
                              <p className="text-gray-500 text-sm">Connection ID: {index + 1}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(connection.ConnectionDate)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <UserIcon className="h-4 w-4" />
                                <span className="truncate">
                                  {connection.UserID ? (typeof connection.UserID === 'object' ? connection.UserID.Name : connection.UserID) : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BeakerIcon className="h-4 w-4" />
                                <span className="truncate">{connection.SourceID ? connection.SourceID.Name : 'N/A'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setShowConnectionDetails(connection)}
                                className="flex items-center space-x-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => openEditForm(connection)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(connection._id)}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/20">
                      <thead className="bg-white/10 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <input
                              type="checkbox"
                              checked={selectedConnections.length === paginatedConnections.length && paginatedConnections.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Connection
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Meter Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
              </tr>
            </thead>
                      <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/20">
                        {paginatedConnections.map((connection, index) => (
                          <tr
                            key={connection._id || connection.ConnectionID}
                            className={`hover:bg-white/10 transition-all duration-300 ${
                              selectedConnections.includes(connection.ConnectionID) ? 'bg-cyan-50/30' : ''
                            } animate-fadeIn`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedConnections.includes(connection._id)}
                                onChange={() => handleSelectConnection(connection._id)}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                  <span className="text-white font-bold">
                                    {connection.MeterNumber?.charAt(0) || 'C'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">#{connection.MeterNumber}</div>
                                  <div className="text-sm text-gray-500">ID: {index + 1}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{connection.MeterNumber}</div>
                              <div className="text-sm text-gray-500">{formatDate(connection.ConnectionDate)}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {connection.UserID ? (typeof connection.UserID === 'object' ? connection.UserID.Name : connection.UserID) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {connection.SourceID ? connection.SourceID.Name : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                connection.Status === 'Active' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {connection.Status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setShowConnectionDetails(connection)}
                                  className="p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all duration-200"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                    <button
                      onClick={() => openEditForm(connection)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                                  <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(connection._id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                                  <TrashIcon className="h-4 w-4" />
                    </button>
                              </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredConnections.length)} of {filteredConnections.length} connections
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              page === i + 1
                                ? 'bg-cyan-500 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
        )}
      </div>

          {/* Connection Details Modal */}
          {showConnectionDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
              <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Connection Details</h3>
                  <button
                    onClick={() => setShowConnectionDetails(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-white font-bold text-2xl">
                        {showConnectionDetails.MeterNumber?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">Meter #{showConnectionDetails.MeterNumber}</h4>
                    <p className="text-gray-500">Connection ID: {connections.findIndex(c => (c._id || c.ConnectionID) === (showConnectionDetails._id || showConnectionDetails.ConnectionID)) + 1}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Connection Date</p>
                        <p className="text-gray-600">{formatDate(showConnectionDetails.ConnectionDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">User</p>
                        <p className="text-gray-600">
                          {showConnectionDetails.UserID ? (typeof showConnectionDetails.UserID === 'object' ? showConnectionDetails.UserID.Name : showConnectionDetails.UserID) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BeakerIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Water Source</p>
                        <p className="text-gray-600">{showConnectionDetails.SourceID ? showConnectionDetails.SourceID.Name : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CogIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          showConnectionDetails.Status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {showConnectionDetails.Status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowConnectionDetails(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowConnectionDetails(null);
                        openEditForm(showConnectionDetails);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Edit Connection
                    </button>
                    <button
                      onClick={() => {
                        setShowConnectionDetails(null);
                        handleDelete(showConnectionDetails._id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Modal Form for Add/Edit */}
      {showForm && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
              <div
                ref={modalRef}
                className="glass-card w-full max-w-lg mx-4 rounded-2xl p-8 shadow-2xl animate-scaleIn relative focus:outline-none"
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
          aria-modal="true"
          role="dialog"
          aria-labelledby="connection-modal-title"
        >
                <div className="flex items-center justify-between mb-6">
                  <h3 id="connection-modal-title" className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {isEdit ? 'Edit Connection' : 'Add New Connection'}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" id="connection-modal-desc">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="connection-user-id">
                        <UserIcon className="h-4 w-4 inline mr-2" />
                        User ID
                      </label>
                <input
                  id="connection-user-id"
                  ref={firstInputRef}
                  type="number"
                  name="UserID"
                  value={formData.UserID}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.UserID || customerIdError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                  min="1"
                  disabled={isEdit}
                        placeholder="Enter User ID"
                      />
                      {formErrors.UserID && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.UserID}
                      </div>}
                      {customerIdError && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {customerIdError}
                      </div>}
                {maxConnectionsWarning && (
                        <div className="text-red-600 text-sm mt-1 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          This user already has 2 connections. Cannot add more.
                        </div>
                )}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="connection-date">
                        <CalendarIcon className="h-4 w-4 inline mr-2" />
                        Connection Date
                      </label>
                <input
                  id="connection-date"
                  type="date"
                  name="ConnectionDate"
                  value={formData.ConnectionDate}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.ConnectionDate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                      {formErrors.ConnectionDate && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.ConnectionDate}
                      </div>}
                    </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="connection-meter-number">
                      <WrenchScrewdriverIcon className="h-4 w-4 inline mr-2" />
                      Meter Number
                    </label>
                <input
                  id="connection-meter-number"
                  type="text"
                  name="MeterNumber"
                  value={formData.MeterNumber}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.MeterNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                      placeholder="Enter meter number"
                />
                    {formErrors.MeterNumber && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.MeterNumber}
                    </div>}
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="connection-status">
                        <CogIcon className="h-4 w-4 inline mr-2" />
                        Status
                      </label>
                <select
                  id="connection-status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.Status ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                      {formErrors.Status && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.Status}
                      </div>}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="connection-source-id">
                        <BeakerIcon className="h-4 w-4 inline mr-2" />
                        Water Source
                      </label>
                <select
                  id="connection-source-id"
                  name="SourceID"
                  value={formData.SourceID}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.SourceID ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Water Source</option>
                  {waterSources.map((source) => (
                          <option key={source._id} value={source._id}>
                      {`${source.Name} (${source.Type})`}
                    </option>
                  ))}
                </select>
                      {formErrors.SourceID && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.SourceID}
                      </div>}
                    </div>
              </div>

                  <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || maxConnectionsWarning || !!customerIdError}
                >
                      {submitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>{isEdit ? 'Updating...' : 'Adding...'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <SparklesIcon className="h-4 w-4" />
                          <span>{isEdit ? 'Update Connection' : 'Add Connection'}</span>
                        </div>
                      )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      </div>
    </AdminLayout>
  );
};

export default ConnectionsPage; 